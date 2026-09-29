import { desc, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { learningSessions, sessionTurns } from '@/lib/db/schema';
import { SESSION_SUMMARY_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { SessionSummarySchema, type SessionSummary } from '@/lib/evaluation/schemas';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from './prompt-version';

export type SessionType = 'tutor_voice' | 'tutor_text' | 'speak' | 'fluency' | 'roleplay';

export class SessionService {
  constructor(private db: Db) {}

  async start(userId: string, opts: {
    type: SessionType; tutorMode?: string; correctionMode?: string;
    sessionGoal?: string; difficulty?: number; exerciseRef?: string; planItemId?: string;
  }) {
    const [row] = await this.db.insert(learningSessions).values({
      learnerId: userId, sessionType: opts.type,
      tutorMode: opts.tutorMode, correctionMode: opts.correctionMode,
      sessionGoal: opts.sessionGoal ?? opts.exerciseRef, difficulty: opts.difficulty, planItemId: opts.planItemId,
    }).returning();
    return row!;
  }

  async addTurn(sessionId: string, turn: {
    role: 'learner' | 'tutor' | 'system';
    text: string; audioPath?: string; words?: unknown; metrics?: unknown; evaluation?: unknown;
  }) {
    const [row] = await this.db.insert(sessionTurns).values({
      sessionId, role: turn.role, content: turn.text,
      audioPath: turn.audioPath, words: turn.words as never,
      metrics: turn.metrics as never, evaluation: turn.evaluation as never,
      evaluationStatus: turn.evaluation ? 'done' : 'none',
    }).returning();
    return row!;
  }

  async recentTurns(sessionId: string, n = 12) {
    const rows = await this.db.query.sessionTurns.findMany({
      where: eq(sessionTurns.sessionId, sessionId),
      orderBy: desc(sessionTurns.createdAt), limit: n,
    });
    return rows.reverse();
  }

  async get(sessionId: string) {
    return this.db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
  }

  async getWithTurns(sessionId: string) {
    const s = await this.get(sessionId);
    if (!s) return null;
    return { ...s, turns: await this.recentTurns(sessionId, 200) };
  }

  async listRecent(userId: string, limit = 20) {
    return this.db.query.learningSessions.findMany({
      where: eq(learningSessions.learnerId, userId),
      orderBy: desc(learningSessions.createdAt), limit,
    });
  }

  async end(sessionId: string): Promise<SessionSummary | null> {
    const session = await this.get(sessionId);
    if (!session || session.endedAt) return (session?.overallSummary as SessionSummary | null) ?? null;
    const turns = await this.recentTurns(sessionId, 100);
    const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt.getTime()) / 1000));

    let summary: SessionSummary | null = null;
    try {
      const payload = turns.map((t) => ({
        role: t.role, text: t.content, metrics: t.metrics, evaluation: t.evaluation,
      }));
      const start = Date.now();
      const res = await getAI().llm.structured({
        name: 'session-summary', schema: SessionSummarySchema,
        system: SESSION_SUMMARY_SYSTEM, tier: 'balanced',
        messages: [{ role: 'user', content: `Summarise this session. Turns with evaluations:\n${JSON.stringify(payload)}` }],
      });
      summary = res.data;
      recordAIEvent({
        provider: 'llm', model: res.model, kind: 'structured', ms: Date.now() - start,
        evaluatorVersion: 'session-summary.v1',
        promptVersionId: await ensurePromptVersion(this.db, 'session-summary', EVALUATOR_PROMPT_VERSION, SESSION_SUMMARY_SYSTEM),
        inputEvidence: { turnCount: turns.length },
      });
    } catch (err) {
      console.warn('[session] summary generation failed:', err);
    }

    await this.db.update(learningSessions)
      .set({ endedAt: new Date(), durationSeconds, overallSummary: summary as never })
      .where(eq(learningSessions.id, sessionId));
    return summary;
  }
}
