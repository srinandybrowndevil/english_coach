import { and, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import {
  curriculumPlans, dailyPlanItems, dailyPlans, learnerProfiles, learnerSkillStates,
} from '@/lib/db/schema';
import type { AssessmentItem } from '@/content/assessment';
import type { AssessmentItemGrade } from '@/lib/evaluation/schemas';
import type { Candidate } from '@/lib/learning/planner';
import { buildDailyPlan } from '@/lib/learning/planner';
import { prerequisitesReady, updateSkillState, type SkillState } from '@/lib/learning/skills';
import { MistakeService } from './mistake';
import { VocabularyService } from './vocabulary';

const ROUTE_BY_DOMAIN: Record<string, string> = {
  grammar: '/grammar', pronunciation: '/pronunciation', fluency: '/fluency',
  vocabulary: '/vocabulary', listening: '/listening', reading: '/reading',
  writing: '/writing', business: '/business', negotiation: '/negotiation',
  presentation: '/presentation', debate: '/debate', register: '/register',
};

export class CurriculumService {
  constructor(private db: Db) {}

  /** §38/§58 — fold every graded assessment item into learner_skill_states, then build the plan. */
  async initialiseFromAssessment(
    userId: string,
    graded: { item: AssessmentItem; grade: AssessmentItemGrade | null }[],
    level: string | null,
  ) {
    const defs = await this.db.query.skillDefinitions.findMany();
    const prereqRows = await this.db.query.skillPrerequisites.findMany();
    const prereqBySkill = new Map<string, string[]>();
    for (const p of prereqRows) {
      prereqBySkill.set(p.skillId, [...(prereqBySkill.get(p.skillId) ?? []), p.prerequisiteSkillId]);
    }
    const defList = defs.map((d) => ({ id: d.id, prerequisites: prereqBySkill.get(d.id) ?? [] }));

    // ensure a state row exists for every seeded skill
    const existing = await this.db.query.learnerSkillStates.findMany({
      where: eq(learnerSkillStates.learnerId, userId),
    });
    const stateBySkill = new Map(existing.map((s) => [s.skillId, s]));
    const now = new Date();
    for (const d of defs) {
      if (!stateBySkill.has(d.id)) {
        const [row] = await this.db.insert(learnerSkillStates)
          .values({ learnerId: userId, skillId: d.id, status: 'unseen' }).returning();
        stateBySkill.set(d.id, row!);
      }
    }

    const touched = new Set<string>();
    for (const { item, grade } of graded) {
      if (!grade) continue;
      const correct = grade.correct || (grade.score ?? 0) >= 60;
      for (const slug of item.skillSlugs) {
        const def = defs.find((d) => d.slug === slug);
        if (!def) continue;
        const row = stateBySkill.get(def.id)!;
        const st: SkillState = {
          masteryScore: row.masteryScore, confidenceScore: row.confidenceScore,
          attemptCount: row.attemptCount, successCount: row.successCount,
          status: row.status as SkillState['status'],
          lastPractisedAt: row.lastPractisedAt ?? undefined,
          nextReviewAt: row.nextReviewAt ?? undefined,
          intervalIndex: row.intervalIndex, easeFactor: row.easeFactor,
        };
        const next = updateSkillState(st, { correct, at: now });
        await this.db.update(learnerSkillStates).set({
          masteryScore: next.masteryScore, confidenceScore: next.confidenceScore,
          attemptCount: next.attemptCount, successCount: next.successCount,
          status: next.status, lastPractisedAt: now, nextReviewAt: next.nextReviewAt ?? null,
          intervalIndex: next.intervalIndex, easeFactor: next.easeFactor,
          evidenceCount: row.evidenceCount + 1, updatedAt: now,
        }).where(eq(learnerSkillStates.id, row.id));
        stateBySkill.set(def.id, { ...row, ...next, nextReviewAt: next.nextReviewAt ?? null, lastPractisedAt: now, evidenceCount: row.evidenceCount + 1 });
        touched.add(def.id);
      }
    }

    // order skills by adaptive priority
    const states: Record<string, SkillState> = {};
    for (const [id, r] of stateBySkill) {
      states[id] = {
        masteryScore: r.masteryScore, confidenceScore: r.confidenceScore,
        attemptCount: r.attemptCount, successCount: r.successCount,
        status: r.status as SkillState['status'],
        lastPractisedAt: r.lastPractisedAt ?? undefined,
        nextReviewAt: r.nextReviewAt ?? undefined,
        intervalIndex: r.intervalIndex, easeFactor: r.easeFactor,
      };
    }
    const { computePriority } = await import('@/lib/learning/planner');
    const ordered = defs
      .map((d) => {
        const st = states[d.id]!;
        const weakness = 1 - st.masteryScore / 100;
        const candidate: Candidate = {
          id: d.slug, domain: d.domain, kind: 'lesson', estMinutes: 6,
          weakness, importance: d.importance, recurrence: 0,
          reviewDueHours: st.nextReviewAt ? (st.nextReviewAt.getTime() - now.getTime()) / 3_600_000 : 9999,
          goalRelevance: 0.7, hoursSinceLastPractised: st.lastPractisedAt ? (now.getTime() - st.lastPractisedAt.getTime()) / 3_600_000 : 168,
          prerequisitesReady: prerequisitesReady(d.id, defList, states),
        };
        return { slug: d.slug, domain: d.domain, priority: computePriority(candidate) };
      })
      .sort((a, b) => b.priority - a.priority);

    const orderedSkillSlugs = ordered.map((o) => o.slug);
    const [plan] = await this.db.insert(curriculumPlans).values({
      learnerId: userId, plan: { orderedSkillSlugs, currentPosition: 0 },
    }).returning();

    const weak = ordered.filter((o) => {
      const st = states[defs.find((d) => d.slug === o.slug)!.id]!;
      return st.masteryScore < 50;
    }).slice(0, 8).map((o) => o.slug);
    const strong = ordered.filter((o) => {
      const st = states[defs.find((d) => d.slug === o.slug)!.id]!;
      return st.masteryScore >= 70;
    }).slice(0, 8).map((o) => o.slug);

    await this.db.insert(learnerProfiles).values({ learnerId: userId })
      .onConflictDoNothing();
    await this.db.update(learnerProfiles).set({
      currentLevel: (level ?? undefined) as never,
      weakSkills: weak, strongSkills: strong,
      skillMasteryMap: Object.fromEntries(
        ordered.map((o) => [o.slug, Math.round(states[defs.find((d) => d.slug === o.slug)!.id]!.masteryScore)]),
      ),
      currentCurriculumPosition: { planId: plan!.id, position: 0 },
      updatedAt: now,
    }).where(eq(learnerProfiles.learnerId, userId));

    return { plan, orderedSkillSlugs, weak, strong };
  }

  /** §37 — idempotent per (learner, date); regenerates when minutes differ. */
  async generateDailyPlan(userId: string, minutes: number, dateStr?: string) {
    const date = dateStr ?? new Date().toISOString().slice(0, 10);
    const existing = await this.db.query.dailyPlans.findFirst({
      where: and(eq(dailyPlans.learnerId, userId), eq(dailyPlans.date, date)),
    });
    if (existing && existing.targetMinutes === minutes) {
      return this.planWithItems(existing.id);
    }
    if (existing) {
      await this.db.delete(dailyPlans).where(eq(dailyPlans.id, existing.id)); // items cascade
    }

    const now = new Date();
    const [mistakes, vocab, states, defs, profile] = await Promise.all([
      new MistakeService(this.db).due(userId, 6),
      new VocabularyService(this.db).due(userId, 10),
      this.db.query.learnerSkillStates.findMany({ where: eq(learnerSkillStates.learnerId, userId) }),
      this.db.query.skillDefinitions.findMany(),
      this.db.query.learnerProfiles.findFirst({ where: eq(learnerProfiles.learnerId, userId) }),
    ]);
    const defById = new Map(defs.map((d) => [d.id, d]));

    const candidates: (Candidate & { moduleRoute?: string; title: string; payload?: unknown })[] = [];
    for (const m of mistakes) {
      candidates.push({
        id: `mistake:${m.id}`, domain: 'grammar', kind: 'review', estMinutes: 2,
        weakness: m.status === 'relapsed' ? 1 : 0.8, importance: 0.9,
        recurrence: m.occurrenceCount, reviewDueHours: m.nextReviewAt ? (m.nextReviewAt.getTime() - now.getTime()) / 3_600_000 : -1,
        goalRelevance: 0.9, hoursSinceLastPractised: 24, prerequisitesReady: true,
        moduleRoute: '/mistakes/review', title: `Review: ${m.label ?? m.errorSignature}`,
        payload: { patternId: m.id },
      });
    }
    for (const v of vocab) {
      candidates.push({
        id: `vocab:${v.id}`, domain: 'vocabulary', kind: 'review', estMinutes: 1,
        weakness: 0.6, importance: 0.6, recurrence: 0,
        reviewDueHours: -1, goalRelevance: 0.6, hoursSinceLastPractised: 24,
        prerequisitesReady: true, moduleRoute: '/vocabulary', title: `Review: ${v.word}`,
        payload: { vocabId: v.id },
      });
    }
    // fresh learners have no state rows yet — plan from definitions at mastery 0
    const skillPool: { def: (typeof defs)[number]; mastery: number; nextReviewAt: Date | null; lastPractisedAt: Date | null }[] =
      states.length
        ? [...states]
            .sort((a, b) => a.masteryScore - b.masteryScore)
            .slice(0, 12)
            .map((st) => ({ def: defById.get(st.skillId)!, mastery: st.masteryScore, nextReviewAt: st.nextReviewAt, lastPractisedAt: st.lastPractisedAt }))
            .filter((x) => x.def)
        : (() => {
            // round-robin domains so a fresh plan is diverse, not 12×grammar
            const byDom = new Map<string, (typeof defs)[number][]>();
            for (const d of defs) byDom.set(d.domain, [...(byDom.get(d.domain) ?? []), d]);
            const doms = [...byDom.keys()];
            const pool: (typeof defs)[number][] = [];
            for (let i = 0; pool.length < 12; i++) {
              let added = false;
              for (const dom of doms) {
                const list = byDom.get(dom)!;
                if (list[i]) { pool.push(list[i]!); added = true; }
              }
              if (!added) break;
            }
            return pool.slice(0, 12).map((def) => ({ def, mastery: 0, nextReviewAt: null, lastPractisedAt: null }));
          })();
    for (const { def, mastery, nextReviewAt, lastPractisedAt } of skillPool) {
      const base = ROUTE_BY_DOMAIN[def.domain] ?? '/tutor';
      candidates.push({
        id: `skill:${def.slug}`, domain: def.domain, kind: 'lesson', estMinutes: 6,
        weakness: 1 - mastery / 100, importance: def.importance,
        recurrence: 0,
        reviewDueHours: nextReviewAt ? (nextReviewAt.getTime() - now.getTime()) / 3_600_000 : 9999,
        goalRelevance: 0.7,
        hoursSinceLastPractised: lastPractisedAt ? (now.getTime() - lastPractisedAt.getTime()) / 3_600_000 : 168,
        prerequisitesReady: true,
        moduleRoute: `${base}?plan=`,
        title: `${def.name}`,
        payload: { skillSlug: def.slug },
      });
    }
    candidates.push({
      id: 'conversation:tutor', domain: 'speaking', kind: 'conversation', estMinutes: 10,
      weakness: 0.5, importance: 0.9, recurrence: 0, reviewDueHours: 9999,
      goalRelevance: 1, hoursSinceLastPractised: 24, prerequisitesReady: true,
      moduleRoute: '/tutor?plan=', title: 'Conversation practice with your tutor',
    });
    candidates.push({
      id: 'scenario:business', domain: 'business', kind: 'scenario', estMinutes: 10,
      weakness: 0.5, importance: 0.8, recurrence: 0, reviewDueHours: 9999,
      goalRelevance: (profile?.learningGoals as string[] | null)?.includes('business') ? 1 : 0.5,
      hoursSinceLastPractised: 48, prerequisitesReady: true,
      moduleRoute: '/speak?plan=', title: 'Business scenario practice',
    });

    const { items } = buildDailyPlan({ minutes, candidates });
    const [plan] = await this.db.insert(dailyPlans).values({
      learnerId: userId, date, targetMinutes: minutes,
      factors: { candidates: candidates.length, generatedAt: now.toISOString() },
    }).returning();
    for (const [i, c] of items.entries()) {
      const full = candidates.find((x) => x.id === c.id)!;
      await this.db.insert(dailyPlanItems).values({
        dailyPlanId: plan!.id, position: i, kind: c.kind, domain: c.domain,
        moduleRoute: full.moduleRoute ?? null, title: full.title,
        estMinutes: c.estMinutes, payload: (full.payload ?? null) as never,
      });
    }
    return this.planWithItems(plan!.id);
  }

  async planWithItems(planId: string) {
    const plan = await this.db.query.dailyPlans.findFirst({ where: eq(dailyPlans.id, planId) });
    const items = await this.db.query.dailyPlanItems.findMany({
      where: eq(dailyPlanItems.dailyPlanId, planId),
      orderBy: (t, { asc }) => asc(t.position),
    });
    return { plan, items };
  }

  async todayPlan(userId: string) {
    const date = new Date().toISOString().slice(0, 10);
    const plan = await this.db.query.dailyPlans.findFirst({
      where: and(eq(dailyPlans.learnerId, userId), eq(dailyPlans.date, date)),
    });
    if (!plan) return null;
    return this.planWithItems(plan.id);
  }

  async markItem(itemId: string, status: 'pending' | 'in_progress' | 'done' | 'skipped') {
    await this.db.update(dailyPlanItems)
      .set({ status, completedAt: status === 'done' || status === 'skipped' ? new Date() : null })
      .where(eq(dailyPlanItems.id, itemId));
  }

  async completionPercent(userId: string) {
    const t = await this.todayPlan(userId);
    if (!t || !t.items.length) return null;
    const done = t.items.filter((i) => i.status === 'done' || i.status === 'skipped').length;
    return Math.round((done / t.items.length) * 100);
  }
}
