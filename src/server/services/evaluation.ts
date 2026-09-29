import { eq } from 'drizzle-orm';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import { EVALUATOR_PROMPT_VERSION, SPEECH_EVALUATOR_SYSTEM } from '@/lib/ai/prompts/evaluators';
import type { Db } from '@/lib/db/client';
import { learningSessions, sessionTurns, speechMetrics } from '@/lib/db/schema';
import { SpeechEvaluationSchema } from '@/lib/evaluation/schemas';
import { computeFluencyScore } from '@/lib/scoring/fluency';
import { computeGrammarScore } from '@/lib/scoring/grammar';
import { computeVocabularyScore } from '@/lib/scoring/vocabulary';
import { deriveSpeechMetrics, type WordTiming } from '@/lib/scoring/speech-metrics';
import { MistakeService } from './mistake';
import { ensurePromptVersion } from './prompt-version';
import { VocabularyService } from './vocabulary';

export class EvaluationService {
  constructor(private db: Db) {}

  async evaluateTurn(
    turnId: string,
    opts: { taskPrompt?: string; register?: string; learnerSignatures?: string[]; imageDataUrl?: string },
  ) {
    const turn = await this.db.query.sessionTurns.findFirst({ where: eq(sessionTurns.id, turnId) });
    if (!turn) throw new Error(`turn ${turnId} not found`);

    try {
      const words = (turn.words as WordTiming[] | null) ?? [];
      const metrics = deriveSpeechMetrics(
        words, turn.content,
        { responseLatencySec: (turn.metrics as { responseLatencySec?: number } | null)?.responseLatencySec },
      );

      const start = Date.now();
      const res = await getAI().llm.structured({
        name: 'speech-evaluation', schema: SpeechEvaluationSchema,
        system: SPEECH_EVALUATOR_SYSTEM, tier: 'balanced',
        messages: [{
          role: 'user',
          content: opts.imageDataUrl
            ? [
              { type: 'text' as const, text: `Task prompt: ${opts.taskPrompt ?? 'free speech'}\n\nExpected register: ${opts.register ?? 'neutral'}\n\nTranscript: ${turn.content}\n\nSpeech metrics: ${JSON.stringify(metrics)}\n\nKnown recurring signatures: ${(opts.learnerSignatures ?? []).join(', ') || 'none'}` },
              { type: 'image' as const, dataUrl: opts.imageDataUrl },
            ]
            : [
              `Task prompt: ${opts.taskPrompt ?? 'free speech'}`,
              `Expected register: ${opts.register ?? 'neutral'}`,
              `Transcript: ${turn.content}`,
              `Speech metrics: ${JSON.stringify(metrics)}`,
              `Known recurring signatures: ${(opts.learnerSignatures ?? []).join(', ') || 'none'}`,
            ].join('\n\n'),
        }],
      });
      const evaluation = res.data;

      const scores = {
        fluency: computeFluencyScore(metrics, {
          sentenceCount: evaluation.sentenceCount,
          completedSentenceCount: evaluation.completedSentenceCount,
        }),
        grammar: computeGrammarScore(
          evaluation.grammarErrors.map((e) => ({ severity: e.severity })),
          metrics.wordCount,
          { subordinateClauses: evaluation.subordinateClauseCount, sentences: evaluation.sentenceCount },
        ),
        vocabulary: computeVocabularyScore(turn.content, evaluation.vocabularyRatings),
      };

      await this.db.insert(speechMetrics).values({
        sessionId: turn.sessionId, turnId,
        duration: metrics.durationSec, wordCount: metrics.wordCount,
        wordsPerMinute: metrics.wordsPerMinute, responseLatency: metrics.responseLatencySec,
        pauseCount: metrics.pauseCount, averagePause: metrics.averagePauseSec,
        longPauseCount: metrics.longPauseCount, fillerCount: metrics.fillerCount,
        repetitionCount: metrics.repetitionCount, selfCorrectionCount: metrics.selfCorrectionCount,
      });
      await this.db.update(sessionTurns)
        .set({ metrics: { ...((turn.metrics as object) ?? {}), speech: metrics } as never,
               evaluation: { evaluation, scores } as never, evaluationStatus: 'done' })
        .where(eq(sessionTurns.id, turnId));

      recordAIEvent({
        provider: 'llm', model: res.model, kind: 'structured', ms: Date.now() - start,
        evaluatorVersion: 'speech.v1',
        promptVersionId: await ensurePromptVersion(this.db, 'speech-evaluation', EVALUATOR_PROMPT_VERSION, SPEECH_EVALUATOR_SYSTEM),
        confidence: scores.fluency.confidence,
        inputEvidence: { transcript: turn.content, metrics },
      });

      const owner = await this.owner(turn.sessionId);
      await new MistakeService(this.db).recordDetected(
        owner, evaluation.grammarErrors, turn.content,
        { sessionId: turn.sessionId, turnId, context: 'speech-evaluation' },
      );
      await new VocabularyService(this.db).addFromEvaluation(owner, evaluation.newVocabulary);
      return { evaluation, scores, metrics };
    } catch (err) {
      await this.db.update(sessionTurns).set({ evaluationStatus: 'failed' })
        .where(eq(sessionTurns.id, turnId));
      throw err;
    }
  }

  private async owner(sessionId: string): Promise<string> {
    const s = await this.db.query.learningSessions.findFirst({ where: eq(learningSessions.id, sessionId) });
    return s?.learnerId ?? '';
  }
}
