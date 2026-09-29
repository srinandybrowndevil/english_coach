import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { VocabularyService } from '@/server/services/vocabulary';

const Body = z.object({ word: z.string().min(1).max(80), meaning: z.string().default('') });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { word } = Body.parse(await req.json());
  await new VocabularyService(await getDb()).addFromEvaluation(session.userId,
    [{ word: word.replace(/[^a-zA-Z'-]/g, ''), meaning: '', example: '' }]);
  return NextResponse.json({ ok: true });
}
