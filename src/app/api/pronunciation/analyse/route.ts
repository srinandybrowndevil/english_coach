import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import { assertSameOrigin } from '@/lib/security/origin';
import { PRONUNCIATION_NOTES_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { PronunciationNotesSchema } from '@/lib/evaluation/schemas';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  transcript: z.string(), target: z.string(), kind: z.string().default('word'),
});

// §11/§52 — notes only, low-confidence text estimate; never a phoneme score.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const db = await getDb();

  const raw = await getAI().pronunciation.analyse({ transcript: body.transcript, target: body.target });
  const res = await getAI().llm.structured({
    name: 'pronunciation-notes', schema: PronunciationNotesSchema,
    system: PRONUNCIATION_NOTES_SYSTEM, tier: 'balanced',
    messages: [{ role: 'user', content: `Target: ${body.target}\nTranscript: ${body.transcript}` }],
  });
  recordAIEvent({
    kind: 'pronunciation-notes', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'pronunciation.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, PRONUNCIATION_NOTES_SYSTEM),
    confidence: 'low', inputEvidence: { transcript: body.transcript, target: body.target },
  });
  return NextResponse.json({
    notes: res.data.notes,
    confidence: 'low', // text-based estimate — never upgraded without audio evidence
    providerConfidence: raw.confidence,
  });
}
