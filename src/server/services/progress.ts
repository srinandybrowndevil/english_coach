import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import {
  learnerSkillStates, mistakePatterns, sessionTurns, skillDefinitions, speechMetrics,
  learningSessions,
} from '@/lib/db/schema';

const DAY_MS = 86_400_000;

/** §80 — consecutive days with any practice. Yesterday counts if today hasn't practised yet. */
export function computeStreak(activityDates: string[], today: string): number {
  const days = new Set(activityDates);
  let cursor = today;
  if (!days.has(cursor)) {
    // today not practised yet — start counting from yesterday
    cursor = new Date(Date.parse(cursor + 'T00:00:00Z') - DAY_MS).toISOString().slice(0, 10);
    if (!days.has(cursor)) return 0;
  }
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = new Date(Date.parse(cursor + 'T00:00:00Z') - DAY_MS).toISOString().slice(0, 10);
  }
  return streak;
}

export class ProgressService {
  constructor(private db: Db) {}

  async streak(userId: string) {
    const sessions = await this.db.query.learningSessions.findMany({
      where: eq(learningSessions.learnerId, userId),
      columns: { createdAt: true },
      limit: 400,
      orderBy: desc(learningSessions.createdAt),
    });
    const dates = sessions.map((s) => s.createdAt.toISOString().slice(0, 10));
    return computeStreak(dates, new Date().toISOString().slice(0, 10));
  }

  /** §86 — null when <2 sessions in either 7-day window. Never fabricate. */
  async recentImprovement(userId: string) {
    const now = Date.now();
    const w1Start = new Date(now - 7 * DAY_MS);
    const w0Start = new Date(now - 14 * DAY_MS);

    const sessRows = await this.db.query.learningSessions.findMany({
      where: and(eq(learningSessions.learnerId, userId), gte(learningSessions.createdAt, w0Start)),
      columns: { id: true, createdAt: true },
    });
    const w1 = new Set(sessRows.filter((s) => s.createdAt >= w1Start).map((s) => s.id));
    const w0 = new Set(sessRows.filter((s) => s.createdAt < w1Start).map((s) => s.id));
    if (w1.size < 2 || w0.size < 2) {
      return { fillerRate: null, pastTenseErrors: null, speakingDuration: null };
    }

    const metrics = await this.db.query.speechMetrics.findMany();
    const inW = (set: Set<string>) => metrics.filter((m) => set.has(m.sessionId ?? ''));
    const m1 = inW(w1); const m0 = inW(w0);

    const rate = (rows: typeof metrics) => {
      const words = rows.reduce((s, m) => s + (m.wordCount ?? 0), 0);
      const fillers = rows.reduce((s, m) => s + (m.fillerCount ?? 0), 0);
      return words ? (fillers / words) * 100 : null;
    };
    const dur = (rows: typeof metrics) => {
      const d = rows.map((m) => m.duration ?? 0).filter((d) => d > 0);
      return d.length ? d.reduce((a, b) => a + b, 0) / d.length : null;
    };

    // past-tense occurrences per week (from mistake_patterns subcategory)
    const patterns = await this.db.query.mistakePatterns.findMany({
      where: and(eq(mistakePatterns.learnerId, userId)),
    });
    const tense = patterns.filter((p) => p.subcategory?.toLowerCase().includes('past'));

    return {
      fillerRate: (() => { const a = rate(m0), b = rate(m1); return a != null && b != null ? { from: a, to: b } : null; })(),
      pastTenseErrors: tense.length ? { count: tense.length } : null,
      speakingDuration: (() => { const a = dur(m0), b = dur(m1); return a != null && b != null ? { from: a, to: b } : null; })(),
    };
  }

  /** §8 radar — mean mastery per domain; null when nothing practised. */
  async skillRadar(userId: string) {
    const states = await this.db.query.learnerSkillStates.findMany({
      where: eq(learnerSkillStates.learnerId, userId),
    });
    const defs = await this.db.query.skillDefinitions.findMany({
      where: inArray(skillDefinitions.id, states.map((s) => s.skillId).length ? states.map((s) => s.skillId) : ['00000000-0000-0000-0000-000000000000']),
    });
    const domainBySkill = new Map(defs.map((d) => [d.id, d.domain]));
    const practised = states.filter((s) => s.attemptCount > 0);
    if (!practised.length) return null;
    const byDomain = new Map<string, number[]>();
    for (const s of practised) {
      const dom = domainBySkill.get(s.skillId) ?? 'other';
      byDomain.set(dom, [...(byDomain.get(dom) ?? []), s.masteryScore]);
    }
    return Object.fromEntries(
      [...byDomain].map(([d, vals]) => [d, Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)]),
    );
  }
}
