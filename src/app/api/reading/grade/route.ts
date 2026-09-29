import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { assertSameOrigin } from '@/lib/security/origin';
import { READING_EVALUATOR_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { ReadingEvaluationSchema } from '@/lib/evaluation/schemas';
import { READING_PASSAGES } from '@/content/reading';
import { readingAttempts } from '@/lib/db/schema';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({ slug: z.string(), answers: z.record(z.string(), z.string()) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const p = READING_PASSAGES.find((x) => x.slug === body.slug);
  if (!p) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const db = await getDb();

  const answerLines = p.exercises.map((e, i) => `Q${i + 1} (${e.kind}): ${e.prompt}\nAnswer: ${body.answers[String(i)] ?? body.answers[i] ?? '—'}`).join('\n\n');
  const res = await getAI().llm.structured({
    name: 'reading-evaluation', schema: ReadingEvaluationSchema, tier: 'balanced',
    system: READING_EVALUATOR_SYSTEM,
    messages: [{ role: 'user', content:
      `Passage (${p.type}, ${p.level}):\n${p.text}\n\nQuestions and learner answers:\n${answerLines}` }],
  });
  await db.insert(readingAttempts).values({
    learnerId: session.userId, material: { slug: p.slug, level: p.level },
    responses: body.answers, score: res.data.comprehensionScore,
  });
  await recordAIEvent({
    kind: 'reading-evaluation', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'reading.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, READING_EVALUATOR_SYSTEM),
    confidence: 'medium', inputEvidence: { slug: p.slug },
  });
  return NextResponse.json(res.data);
}
