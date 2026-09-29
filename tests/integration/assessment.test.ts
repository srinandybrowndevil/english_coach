process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://';

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import {
  assessments, curriculumPlans, cefrEstimates, learnerProfiles, learnerSkillStates, users,
} from '@/lib/db/schema';
import { selectItems } from '@/content/assessment';
import { AssessmentService } from '@/server/services/assessment';
import { CurriculumService } from '@/server/services/curriculum';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  (globalThis as unknown as { __db?: unknown }).__db = db;
  return db;
}

async function mkUser(db: Awaited<ReturnType<typeof testDb>>) {
  const [u] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
  return u!.id;
}

// seed the §38 skill graph so curriculum/planning have real definitions
async function seedSkills(db: Awaited<ReturnType<typeof testDb>>) {
  const { SKILLS } = await import('@/content/skills');
  const { skillDefinitions, skillPrerequisites } = await import('@/lib/db/schema');
  for (const s of SKILLS) {
    await db.insert(skillDefinitions).values({
      slug: s.slug, domain: s.domain, name: s.name, description: s.description,
      difficulty: s.difficulty, importance: s.importance, cefrRelevance: s.cefr,
      exerciseTypes: s.exerciseTypes, masteryThreshold: s.masteryThreshold,
    }).onConflictDoNothing();
  }
  const rows = await db.select({ id: skillDefinitions.id, slug: skillDefinitions.slug }).from(skillDefinitions);
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));
  for (const s of SKILLS) {
    for (const pre of s.prerequisites) {
      const a = idBySlug.get(s.slug); const b = idBySlug.get(pre);
      if (a && b) {
        await db.insert(skillPrerequisites)
          .values({ skillId: a, prerequisiteSkillId: b })
          .onConflictDoNothing();
      }
    }
  }
}

describe('assessment engine (§58/§59)', () => {
  it('resume: same assessment object, position preserved', async () => {
    const db = await testDb();
    const uid = await mkUser(db);
    const svc = new AssessmentService(db);

    const a1 = await svc.startOrResume(uid, 'initial');
    const items = selectItems('initial', 0);
    // answer first 3 objective items
    for (const item of items.slice(0, 3)) {
      await svc.submit(a1!.id, item.slug, { selected: item.answer });
    }
    const a2 = await svc.startOrResume(uid, 'initial');
    expect(a2!.id).toBe(a1!.id);
    const step = await svc.currentStep(a1!.id);
    expect(step.answered).toBe(3);
    expect(step.next?.slug).toBe(items[3]!.slug);
  });

  it('full run → cefr_estimates + result fields + skill states + curriculum', async () => {
    const db = await testDb();
    const uid = await mkUser(db);
    await seedSkills(db);
    const svc = new AssessmentService(db);
    const a = await svc.startOrResume(uid, 'initial');
    const items = selectItems('initial', 0);

    for (const item of items) {
      if (['mcq', 'cloze', 'listening_mcq', 'dictation'].includes(item.type)) {
        await svc.submit(a!.id, item.slug, { selected: item.answer ?? 'x', text: item.answer ?? 'x' });
      } else {
        await svc.submit(a!.id, item.slug, { text: 'A reasonable spoken or written response in English.' });
      }
    }
    const step = await svc.currentStep(a!.id);
    expect(step.done).toBe(true);

    const out = await svc.finish(a!.id);
    expect(out.estimate.level).toBeTruthy();

    const est = await db.select().from(cefrEstimates).where(eq(cefrEstimates.learnerId, uid));
    expect(est).toHaveLength(1);

    const stored = await db.query.assessments.findFirst({ where: eq(assessments.id, a!.id) });
    const result = stored!.result as Record<string, unknown>;
    for (const k of ['overall', 'domainScores', 'strengths', 'weaknesses', 'recurringPatterns',
      'pronunciationFocus', 'fluencyProfile', 'vocabularyProfile', 'businessProfile', 'recommendedCurriculum'])
      expect(result).toHaveProperty(k);

    const states = await db.select().from(learnerSkillStates).where(eq(learnerSkillStates.learnerId, uid));
    expect(states.length).toBeGreaterThanOrEqual(80); // all seeded skills get a row
    expect(states.some((s) => s.status !== 'unseen' && s.attemptCount > 0)).toBe(true);

    const plans = await db.select().from(curriculumPlans).where(eq(curriculumPlans.learnerId, uid));
    expect(plans.length).toBeGreaterThanOrEqual(1);

    const prof = await db.query.learnerProfiles.findFirst({ where: eq(learnerProfiles.learnerId, uid) });
    expect(prof?.currentLevel).toBeTruthy();
    expect(prof?.skillMasteryMap).toBeTruthy();
  }, 60000);
});

describe('daily plan (§37)', () => {
  it('45 min → ≥3 domains incl. conversation; regenerate with 15 replaces, no dupes', async () => {
    const db = await testDb();
    const uid = await mkUser(db);
    await seedSkills(db);
    const svc = new CurriculumService(db);

    const p45 = await svc.generateDailyPlan(uid, 45);
    expect(p45.items.length).toBeGreaterThan(0);
    const domains = new Set(p45.items.map((i) => i.domain));
    expect(domains.size).toBeGreaterThanOrEqual(3);
    expect(p45.items.some((i) => i.kind === 'conversation')).toBe(true);

    const p15 = await svc.generateDailyPlan(uid, 15);
    expect(p15.plan!.id).not.toBe(p45.plan!.id);
    const dates = await db.select().from(schema.dailyPlans).where(eq(schema.dailyPlans.learnerId, uid));
    expect(dates).toHaveLength(1); // replaced, not duplicated

    const same = await svc.generateDailyPlan(uid, 15);
    expect(same.plan!.id).toBe(p15.plan!.id); // idempotent same minutes
  });
});
