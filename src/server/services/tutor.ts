import { eq } from 'drizzle-orm';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import { TUTOR_PROMPT_VERSION, buildTutorSystemPrompt, type CorrectionMode, type TutorMode } from '@/lib/ai/prompts/tutor';
import type { Db } from '@/lib/db/client';
import { learnerProfiles, learningSessions } from '@/lib/db/schema';
import { TutorTurnSchema, type TutorTurn } from '@/lib/evaluation/schemas';
import { MemoryService } from './memory';
import { MistakeService } from './mistake';
import { ensurePromptVersion } from './prompt-version';
import { SessionService } from './session';
import { SettingsService } from './settings';
import { VocabularyService } from './vocabulary';

// spec §46 orchestrator — targeted retrieval only; no dumping whole tables.
export class TutorService {
  constructor(private db: Db) {}

  async respond(
    sessionId: string,
    learnerText: string,
    opts: { metrics?: unknown; persistedTurnId?: string } = {},
  ) {
    const session = await this.db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
    if (!session) throw new Error(`session ${sessionId} not found`);
    const userId = session.learnerId;

    const [settings, profile, mistakes, vocab, lastSession, memories, turns] = await Promise.all([
      new SettingsService(this.db).get(userId),
      this.db.query.learnerProfiles.findFirst({ where: eq(learnerProfiles.learnerId, userId) }),
      new MistakeService(this.db).due(userId, 8),
      new VocabularyService(this.db).due(userId, 6),
      this.db.query.learningSessions.findMany({
        where: eq(learningSessions.learnerId, userId), orderBy: (t, { desc }) => desc(t.createdAt), limit: 2,
      }).then((rows) => rows.find((r) => r.id !== sessionId && r.overallSummary)),
      new MemoryService(this.db).recall(userId, { kinds: ['learner'], limit: 5 }),
      new SessionService(this.db).recentTurns(sessionId, 12),
    ]);

    const ctx = {
      learnerName: profile?.name ?? 'Srinivash',
      cefrEstimate: profile?.currentLevel ?? null,
      cefrConfidence: null,
      todayObjective: session.sessionGoal,
      recurringMistakes: mistakes.map((m) => ({
        signature: m.errorSignature, example: m.originalExample ?? '',
        correction: m.correctedExample ?? '', occurrences: m.occurrenceCount, status: m.status,
      })),
      vocabularyDue: vocab.map((v) => ({ word: v.word, meaning: v.meaning })),
      goals: [profile?.targetLevel ? `reach ${profile.targetLevel.toUpperCase()} English` : 'advanced overall fluency'],
      recentSessionSummary: lastSession ? JSON.stringify(lastSession.overallSummary).slice(0, 500) : null,
      difficulty: (session.difficulty ?? settings.tutor.difficulty) as 1 | 2 | 3 | 4 | 5,
      tamilAllowed: settings.tutor.tamilEnabled,
      englishOnly: settings.tutor.englishOnly,
      mode: (session.tutorMode ?? settings.tutor.tutorMode) as TutorMode,
      correctionMode: (session.correctionMode ?? settings.tutor.correctionMode) as CorrectionMode,
      sessionGoal: session.sessionGoal,
    };

    const system = buildTutorSystemPrompt(ctx);
    const messages = turns.map((t) => ({
      role: (t.role === 'tutor' ? 'assistant' : 'user') as 'user' | 'assistant',
      content: t.content,
    }));
    messages.push({ role: 'user', content: learnerText });

    const start = Date.now();
    const res = await getAI().llm.structured({
      name: 'tutor-turn', schema: TutorTurnSchema, system, tier: 'frontier', messages,
    });
    const out: TutorTurn = res.data;
    recordAIEvent({
      provider: 'llm', model: res.model, kind: 'structured', ms: Date.now() - start,
      evaluatorVersion: 'tutor.v1',
      promptVersionId: await ensurePromptVersion(this.db, 'tutor', TUTOR_PROMPT_VERSION, system),
      inputEvidence: { turnCount: messages.length },
    });

    const sessions = new SessionService(this.db);
    // the route may already have persisted the learner turn (§75: transcript never lost)
    const learnerTurn = opts.persistedTurnId
      ? { id: opts.persistedTurnId }
      : await sessions.addTurn(sessionId, { role: 'learner', text: learnerText, metrics: opts.metrics });
    const tutorTurn = await sessions.addTurn(sessionId, { role: 'tutor', text: out.reply });

    const memory = new MemoryService(this.db);
    for (const m of out.memoryCandidates) await memory.remember(userId, m.kind, m.content);

    if (out.corrections.length)
      await new MistakeService(this.db).recordDetected(userId, out.corrections, learnerText, {
        sessionId, turnId: learnerTurn.id, context: `tutor:${ctx.mode}`,
      });

    const nextDifficulty = Math.min(5, Math.max(1, ctx.difficulty + out.difficultyAdjustment));
    if (nextDifficulty !== ctx.difficulty)
      await this.db.update(learningSessions).set({ difficulty: nextDifficulty })
        .where(eq(learningSessions.id, sessionId));

    return { tutorTurn: out, learnerTurnId: learnerTurn.id, tutorTurnId: tutorTurn.id };
  }
}
