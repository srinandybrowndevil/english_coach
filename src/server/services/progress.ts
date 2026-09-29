import { and, asc, desc, eq, gte, inArray } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import {
  learnerSkillStates, learnerVocabulary, mistakePatterns, mistakeOccurrences, mistakeReviews, cefrEstimates, skillDefinitions, learningSessions, exerciseAttempts, writingSubmissions,
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

const RANGE_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '6m': 180, all: 3650 };

const bucketKey = (d: Date, weekly: boolean): string => {
  if (!weekly) return d.toISOString().slice(0, 10);
  const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday
  return x.toISOString().slice(0, 10);
};

export class ProgressService {
  constructor(private db: Db) {}

  /** §60/§89 — bucketed series from stored rows only; gaps stay empty. */
  async timeseries(userId: string, range: '7d' | '30d' | '90d' | '6m' | 'all' = '30d') {
    const days = RANGE_DAYS[range] ?? 30;
    const weekly = days > 30;
    const since = new Date(Date.now() - days * DAY_MS);

    const [sessions, attempts, writes, occs, reviews, vocabRows, cefrRows] = await Promise.all([
      this.db.query.learningSessions.findMany({
        where: and(eq(learningSessions.learnerId, userId), gte(learningSessions.createdAt, since)),
        columns: { id: true, createdAt: true, durationSeconds: true, sessionType: true }, limit: 2000,
      }),
      this.db.query.exerciseAttempts.findMany({
        where: and(eq(exerciseAttempts.learnerId, userId), gte(exerciseAttempts.createdAt, since)),
        columns: { createdAt: true, score: true }, limit: 2000,
      }),
      this.db.query.writingSubmissions.findMany({
        where: and(eq(writingSubmissions.learnerId, userId), gte(writingSubmissions.createdAt, since)),
        columns: { createdAt: true, scores: true }, limit: 500,
      }),
      this.db.select({ detectedAt: mistakeOccurrences.detectedAt }).from(mistakeOccurrences)
        .innerJoin(mistakePatterns, eq(mistakeOccurrences.mistakePatternId, mistakePatterns.id))
        .where(and(eq(mistakePatterns.learnerId, userId), gte(mistakeOccurrences.detectedAt, since))).limit(2000),
      this.db.select({ reviewedAt: mistakeReviews.reviewedAt }).from(mistakeReviews)
        .innerJoin(mistakePatterns, eq(mistakeReviews.mistakePatternId, mistakePatterns.id))
        .where(and(eq(mistakePatterns.learnerId, userId), gte(mistakeReviews.reviewedAt, since))).limit(2000),
      this.db.query.learnerVocabulary.findMany({
        where: and(eq(learnerVocabulary.learnerId, userId), inArray(learnerVocabulary.status, ['practising', 'stable', 'mastered'])),
        columns: { createdAt: true, status: true }, limit: 3000,
      }),
      this.db.query.cefrEstimates.findMany({
        where: eq(cefrEstimates.learnerId, userId), orderBy: asc(cefrEstimates.createdAt), limit: 60,
      }),
    ]);
    const sessIds = new Set(sessions.map((s) => s.id));
    const metrics = (await this.db.query.speechMetrics.findMany({ limit: 5000 }))
      .filter((m) => m.sessionId && sessIds.has(m.sessionId));

    const buckets = new Map<string, {
      speakingSec: number; words: number; fillers: number; mistakes: number;
      reviews: number; scores: number[]; vocabActive: number; practised: boolean;
    }>();
    const b = (d: Date) => {
      const k = bucketKey(d, weekly);
      if (!buckets.has(k)) buckets.set(k, { speakingSec: 0, words: 0, fillers: 0, mistakes: 0, reviews: 0, scores: [], vocabActive: 0, practised: false });
      return buckets.get(k)!;
    };
    const sessBucket = new Map(sessions.map((s) => [s.id, s]));
    for (const s of sessions) { const x = b(s.createdAt); x.practised = true; x.speakingSec += s.durationSeconds ?? 0; }
    for (const m of metrics) {
      const s = sessBucket.get(m.sessionId!); if (!s) continue;
      const x = b(s.createdAt); x.words += m.wordCount ?? 0; x.fillers += m.fillerCount ?? 0;
    }
    for (const a of attempts) { const t = (a.score as { total?: number } | null)?.total; if (t != null) b(a.createdAt).scores.push(t); }
    for (const w of writes) { const t = (w.scores as { total?: number } | null)?.total; if (t != null) b(w.createdAt).scores.push(t); }
    for (const o of occs) b(o.detectedAt).mistakes++;
    for (const r of reviews) b(r.reviewedAt).reviews++;
    for (const v of vocabRows) b(v.createdAt).vocabActive++;

    const series = [...buckets].sort(([a], [c]) => a.localeCompare(c)).map(([key, x]) => ({
      key,
      speakingMinutes: +(x.speakingSec / 60).toFixed(1),
      fillerRatePer100: x.words ? +((x.fillers / x.words) * 100).toFixed(1) : null,
      avgScore: x.scores.length ? +(x.scores.reduce((a, c) => a + c, 0) / x.scores.length).toFixed(1) : null,
      mistakesDetected: x.mistakes, reviewsDone: x.reviews, vocabActive: x.vocabActive,
      practised: x.practised,
    }));
    return {
      range, buckets: series,
      streakDays: sessions.length ? computeStreak(sessions.map((s) => s.createdAt.toISOString().slice(0, 10)), new Date().toISOString().slice(0, 10)) : 0,
      cefrHistory: cefrRows.map((c) => ({ at: c.createdAt.toISOString().slice(0, 10), level: c.level, confidence: c.confidence })),
      skillRadar: await this.skillRadar(userId),
    };
  }

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

    // §41 fix: real week-over-week delta of past-tense occurrences
    const patterns = await this.db.query.mistakePatterns.findMany({
      where: and(eq(mistakePatterns.learnerId, userId)),
      columns: { id: true, errorSignature: true, subcategory: true },
    });
    const tenseIds = new Set(patterns
      .filter((p) => p.subcategory?.toLowerCase().includes('past')
        || p.errorSignature === 'grammar:did-plus-past-form'
        || p.errorSignature === 'grammar:tense-consistency')
      .map((p) => p.id));
    const occs = tenseIds.size
      ? await this.db.select({ detectedAt: mistakeOccurrences.detectedAt, patternId: mistakeOccurrences.mistakePatternId })
          .from(mistakeOccurrences)
          .innerJoin(mistakePatterns, eq(mistakeOccurrences.mistakePatternId, mistakePatterns.id))
          .where(and(eq(mistakePatterns.learnerId, userId), gte(mistakeOccurrences.detectedAt, w0Start)))
      : [];
    const c1 = occs.filter((o) => tenseIds.has(o.patternId) && o.detectedAt >= w1Start).length;
    const c0 = occs.filter((o) => tenseIds.has(o.patternId) && o.detectedAt < w1Start).length;

    return {
      fillerRate: (() => { const a = rate(m0), b = rate(m1); return a != null && b != null ? { from: a, to: b } : null; })(),
      pastTenseErrors: (c0 || c1) ? { from: c0, to: c1 } : null,
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
