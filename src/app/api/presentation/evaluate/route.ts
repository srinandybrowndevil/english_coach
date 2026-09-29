import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { assertSameOrigin } from '@/lib/security/origin';
import { PRESENTATION_EVALUATOR_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { PresentationEvaluationSchema } from '@/lib/evaluation/schemas';
import { computePresentationScore } from '@/lib/scoring/presentation';
import { deriveSpeechMetrics } from '@/lib/scoring/speech-metrics';
import { learningSessions, sessionTurns } from '@/lib/db/schema';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  transcript: z.string(), mode: z.string(), targetSec: z.number(),
  words: z.array(z.object({ word: z.string(), start: z.number(), end: z.number() })).optional(),
  durationMs: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const db = await getDb();

  const metrics = deriveSpeechMetrics(body.words ?? [], body.transcript);
  const res = await getAI().llm.structured({
    name: 'presentation-evaluation', schema: PresentationEvaluationSchema, tier: 'frontier',
    system: PRESENTATION_EVALUATOR_SYSTEM,
    messages: [{ role: 'user', content:
      `Mode: ${body.mode}\nTarget duration: ${body.targetSec}s\nDelivery metrics: wpm=${metrics.wordsPerMinute.toFixed(0)}, longPauses=${metrics.longPauseCount}, fillers=${metrics.fillerCount}\n\nTranscript:\n${body.transcript}` }],
  });
  const score = computePresentationScore(res.data.dimensions, {
    wpm: metrics.wordsPerMinute, longPauseCount: metrics.longPauseCount, fillerCount: metrics.fillerCount,
  });

  const [sess] = await db.insert(learningSessions).values({
    learnerId: session.userId, sessionType: 'presentation', sessionGoal: body.mode,
  }).returning();
  await db.insert(sessionTurns).values({
    sessionId: sess!.id, role: 'learner', content: body.transcript,
  });
  await recordAIEvent({
    kind: 'presentation-evaluation', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'presentation.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, PRESENTATION_EVALUATOR_SYSTEM),
    confidence: 'medium', inputEvidence: { mode: body.mode },
  });
  return NextResponse.json({ evaluation: res.data, score, metrics });
}
