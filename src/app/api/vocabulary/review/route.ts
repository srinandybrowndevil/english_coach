import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { CurriculumService } from '@/server/services/curriculum';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  learnerVocabularyId: z.string(),
  result: z.enum(['recalled', 'recognised', 'used_in_context', 'failed']),
  sentence: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const row = await new CurriculumService(await getDb())
    .recordVocabularyReview(session.userId, body.learnerVocabularyId, body.result, body.sentence);
  return NextResponse.json(row);
}
