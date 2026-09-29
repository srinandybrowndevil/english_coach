import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { assertSameOrigin } from '@/lib/security/origin';
import { REGISTER_EVALUATOR_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { RegisterEvaluationSchema } from '@/lib/evaluation/schemas';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { recordAIEvent } from '@/lib/ai/usage';
import { takeTokens } from '@/lib/security/rate-limit';
import { exerciseAttempts, exerciseDefinitions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const Body = z.object({
  meaning: z.string(), targetRegister: z.string(), attempt: z.string(),
  exerciseSlug: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const db = await getDb();

  const res = await getAI().llm.structured({
    name: 'register-evaluation', schema: RegisterEvaluationSchema, tier: 'balanced',
    system: REGISTER_EVALUATOR_SYSTEM,
    messages: [{ role: 'user', content:
      `Meaning to express: ${body.meaning}\nTarget register: ${body.targetRegister}\nAttempt: ${body.attempt}` }],
  });
  await recordAIEvent({
    kind: 'register-evaluation', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'register.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, REGISTER_EVALUATOR_SYSTEM),
    confidence: 'medium', inputEvidence: { targetRegister: body.targetRegister },
  });
  if (body.exerciseSlug) {
    const [def] = await db.insert(exerciseDefinitions).values({
      slug: body.exerciseSlug, domain: 'vocabulary', kind: 'register', title: body.exerciseSlug, payload: {},
    }).onConflictDoUpdate({ target: exerciseDefinitions.slug, set: { title: body.exerciseSlug } }).returning();
    await db.insert(exerciseAttempts).values({
      learnerId: session.userId, exerciseId: def!.id,
      payload: { meaning: body.meaning, register: body.targetRegister },
      score: { registerFit: res.data.registerFit.score },
    });
    void eq; // reserved
  }
  return NextResponse.json(res.data);
}
