import { desc, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { writingSubmissions } from '@/lib/db/schema';
import { getAI } from '@/lib/ai';
import { WRITING_EVALUATOR_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { WritingEvaluationSchema, type WritingEvaluation } from '@/lib/evaluation/schemas';
import { computeWritingScore } from '@/lib/scoring/writing';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { MistakeService } from '@/server/services/mistake';
import type { WritingMode } from '@/content/writing-templates';

export class WritingService {
  constructor(private db: Db) {}

  async evaluate(userId: string, mode: WritingMode, text: string, submissionId?: string) {
    const res = await getAI().llm.structured({
      name: 'writing-evaluation', schema: WritingEvaluationSchema, tier: 'balanced',
      system: WRITING_EVALUATOR_SYSTEM,
      messages: [{ role: 'user', content:
        `Task: ${mode.mode}\nAudience: ${mode.audience}\nRequired register: ${mode.register}\nPrompt: ${mode.prompt}\n\nText:\n${text}` }],
    });
    const score = computeWritingScore(res.data.dimensions, {
      weightOverrides: mode.weightOverrides, wordCount: text.split(/\s+/).filter(Boolean).length,
    });
    const evaluation: WritingEvaluation = res.data;

    let row;
    if (submissionId) {
      // rewrite → version bump stored in scores
      const prev = await this.db.query.writingSubmissions.findFirst({ where: eq(writingSubmissions.id, submissionId) });
      const prevTotal = (prev?.scores as { total?: number } | null)?.total;
      [row] = await this.db.update(writingSubmissions).set({
        rewriteText: text, analysis: evaluation as never,
        scores: { ...score, delta: prevTotal !== undefined ? score.total - prevTotal : null } as never,
      }).where(eq(writingSubmissions.id, submissionId)).returning();
    } else {
      [row] = await this.db.insert(writingSubmissions).values({
        learnerId: userId, mode: mode.mode, prompt: mode.prompt,
        originalText: text, analysis: evaluation as never, scores: score as never,
      }).returning();
    }

    if (evaluation.grammarErrors.length) {
      await new MistakeService(this.db).recordDetected(userId, evaluation.grammarErrors, text,
        { context: `writing:${mode.slug}` });
    }
    await recordAIEvent({
      kind: 'writing-evaluation', provider: 'llm', model: res.model, ms: 0,
      evaluatorVersion: 'writing.v1',
      promptVersionId: await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, WRITING_EVALUATOR_SYSTEM),
      confidence: 'medium', inputEvidence: { words: text.split(/\s+/).length },
    });
    return { submission: row, evaluation, score };
  }

  list(userId: string) {
    return this.db.query.writingSubmissions.findMany({
      where: eq(writingSubmissions.learnerId, userId), orderBy: desc(writingSubmissions.createdAt), limit: 30,
    });
  }
}
