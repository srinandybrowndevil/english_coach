import { and, eq, gte, lt } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import {
  learningSessions, mistakePatterns, mistakeOccurrences, mistakeReviews,
  learnerVocabulary, writingSubmissions, exerciseAttempts, cefrEstimates,
  sessionTurns, weeklyReports, monthlyReports,
} from '@/lib/db/schema';

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);

export class ReportService {
  constructor(private db: Db) {}

  /** §61 — pure aggregation; regenerated on demand, idempotent per week. */
  async weekly(userId: string, weekStart: Date) {
    const ws = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7)));
    const we = new Date(ws.getTime() + 7 * DAY);
    const report = await this.aggregate(userId, ws, we, 'week');
    const [row] = await this.db.insert(weeklyReports)
      .values({ learnerId: userId, weekStart: iso(ws), report: report as never })
      .onConflictDoUpdate({ target: [weeklyReports.learnerId, weeklyReports.weekStart], set: { report: report as never } })
      .returning();
    return row!;
  }

  /** §62 */
  async monthly(userId: string, monthStart: Date) {
    const ms = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), 1));
    const me = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    const report = await this.aggregate(userId, ms, me, 'month');
    const [row] = await this.db.insert(monthlyReports)
      .values({ learnerId: userId, month: iso(ms), report: report as never })
      .onConflictDoUpdate({ target: [monthlyReports.learnerId, monthlyReports.month], set: { report: report as never } })
      .returning();
    return row!;
  }

  private async aggregate(userId: string, start: Date, end: Date, period: 'week' | 'month') {
    const priorStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const inWindow = and(eq(learningSessions.learnerId, userId), gte(learningSessions.createdAt, start), lt(learningSessions.createdAt, end));
    const sessions = await this.db.query.learningSessions.findMany({ where: inWindow, columns: { id: true, durationSeconds: true, sessionType: true } });
    const ids = new Set(sessions.map((s) => s.id));

    const [occs, reviews, patterns, vocab, writes, attempts, turns, cefr, prior] = await Promise.all([
      this.db.select({ detectedAt: mistakeOccurrences.detectedAt, patternId: mistakeOccurrences.mistakePatternId })
        .from(mistakeOccurrences).innerJoin(mistakePatterns, eq(mistakeOccurrences.mistakePatternId, mistakePatterns.id))
        .where(and(eq(mistakePatterns.learnerId, userId), gte(mistakeOccurrences.detectedAt, start), lt(mistakeOccurrences.detectedAt, end))),
      this.db.select({ reviewedAt: mistakeReviews.reviewedAt, successful: mistakeReviews.successful, patternId: mistakeReviews.mistakePatternId })
        .from(mistakeReviews).innerJoin(mistakePatterns, eq(mistakeReviews.mistakePatternId, mistakePatterns.id))
        .where(and(eq(mistakePatterns.learnerId, userId), gte(mistakeReviews.reviewedAt, start), lt(mistakeReviews.reviewedAt, end))),
      this.db.query.mistakePatterns.findMany({ where: eq(mistakePatterns.learnerId, userId), columns: { id: true, status: true, errorSignature: true, label: true, lastSeenAt: true } }),
      this.db.query.learnerVocabulary.findMany({
        where: and(eq(learnerVocabulary.learnerId, userId), gte(learnerVocabulary.createdAt, start), lt(learnerVocabulary.createdAt, end)),
        columns: { id: true, vocabularyItemId: true },
      }),
      this.db.query.writingSubmissions.findMany({
        where: and(eq(writingSubmissions.learnerId, userId), gte(writingSubmissions.createdAt, start), lt(writingSubmissions.createdAt, end)),
        columns: { scores: true },
      }),
      this.db.query.exerciseAttempts.findMany({
        where: and(eq(exerciseAttempts.learnerId, userId), gte(exerciseAttempts.createdAt, start), lt(exerciseAttempts.createdAt, end)),
        columns: { score: true },
      }),
      // best speaking sample = learner turn with highest fluency total in window
      this.db.query.sessionTurns.findMany({
        where: and(eq(sessionTurns.role, 'learner'), gte(sessionTurns.createdAt, start), lt(sessionTurns.createdAt, end)),
        columns: { id: true, sessionId: true, content: true, evaluation: true }, limit: 2000,
      }),
      this.db.query.cefrEstimates.findFirst({
        where: eq(cefrEstimates.learnerId, userId),
        orderBy: (t, { desc }) => desc(t.createdAt),
      }),
      this.db.query.learningSessions.findMany({
        where: and(eq(learningSessions.learnerId, userId), gte(learningSessions.createdAt, priorStart), lt(learningSessions.createdAt, start)),
        columns: { durationSeconds: true },
      }),
    ]);

    const scores = [...writes.map((w) => (w.scores as { total?: number } | null)?.total), ...attempts.map((a) => (a.score as { total?: number } | null)?.total)].filter((x): x is number => x != null);
    const best = turns
      .filter((t) => ids.has(t.sessionId))
      .map((t) => ({ t, score: ((t.evaluation as { scores?: { fluency?: { total?: number } } } | null)?.scores?.fluency?.total) ?? 0 }))
      .sort((a, b) => b.score - a.score)[0];

    const active = patterns.filter((p) => p.status === 'recurring' || p.status === 'relapsed');
    const mastered = patterns.filter((p) => p.status === 'mastered' && p.lastSeenAt && p.lastSeenAt >= start && p.lastSeenAt < end);
    const minutes = Math.round(sessions.reduce((s, x) => s + (x.durationSeconds ?? 0), 0) / 60);
    const priorMinutes = Math.round(prior.reduce((s, x) => s + (x.durationSeconds ?? 0), 0) / 60);

    return {
      period, start: iso(start), end: iso(end),
      minutesPractised: minutes,
      sessionsCompleted: sessions.length,
      sessionTypes: [...new Set(sessions.map((s) => s.sessionType))],
      wordsAddedToVocabulary: vocab.length,
      mistakesDetected: occs.length,
      reviewItemsDone: reviews.length,
      patternsResolved: mastered.map((p) => p.label ?? p.errorSignature),
      activePatterns: active.map((p) => p.label ?? p.errorSignature),
      avgScore: scores.length ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null,
      currentCefr: cefr ? { level: cefr.level, confidence: cefr.confidence } : null,
      vsPriorPeriod: { minutesFrom: priorMinutes, minutesTo: minutes },
      bestSpeakingSample: best ? { turnId: best.t.id, excerpt: best.t.content.slice(0, 200), fluencyTotal: best.score } : null,
      // §61/§62 — planner-sourced label, not LLM prose
      recommendedNextFocus: active[0] ? `Fix ${active[0].label ?? active[0].errorSignature}` : 'Keep the streak going',
    };
  }
}
