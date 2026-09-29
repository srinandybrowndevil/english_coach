import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { assertSameOrigin } from '@/lib/security/origin';
import { TAMIL_TO_ENGLISH_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { TamilToEnglishSchema } from '@/lib/evaluation/schemas';
import { TAMIL_ITEMS } from '@/content/tamil-english';
import { exerciseAttempts, exerciseDefinitions } from '@/lib/db/schema';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { takeTokens } from '@/lib/security/rate-limit';
import { containsTamil } from '@/lib/learning/tamil';

const Body = z.object({ slug: z.string(), attempt: z.string() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const item = TAMIL_ITEMS.find((i) => i.slug === body.slug);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (containsTamil(body.attempt)) {
    return NextResponse.json({ error: 'english_only', hint: 'English only — try again with a recovery phrase.' }, { status: 400 });
  }
  const db = await getDb();
  const res = await getAI().llm.structured({
    name: 'tamil-to-english', schema: TamilToEnglishSchema, tier: 'balanced',
    system: TAMIL_TO_ENGLISH_SYSTEM,
    messages: [{ role: 'user', content: `Tamil: ${item.tamil} (${item.transliteration})\nLearner's English: ${body.attempt}` }],
  });
  const [def] = await db.insert(exerciseDefinitions).values({
    slug: `tamil-lab:${item.slug}`, domain: 'grammar', kind: 'tamil_translation', title: item.slug, payload: {},
  }).onConflictDoUpdate({ target: exerciseDefinitions.slug, set: { title: item.slug } }).returning();
  await db.insert(exerciseAttempts).values({
    learnerId: session.userId, exerciseId: def!.id,
    payload: { attempt: body.attempt },
    score: { errors: res.data.grammarErrors.length },
  });
  await recordAIEvent({
    kind: 'tamil-to-english', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'tamil.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, TAMIL_TO_ENGLISH_SYSTEM),
    confidence: 'medium', inputEvidence: { slug: item.slug },
  });
  return NextResponse.json(res.data);
}
