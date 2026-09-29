import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { CurriculumService } from '@/server/services/curriculum';

const Body = z.object({ skillSlug: z.string(), correct: z.boolean(), context: z.string().default('module') });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const row = await new CurriculumService(await getDb())
    .recordSkillAttempt(session.userId, body.skillSlug, body.correct, body.context);
  return NextResponse.json(row ?? { ok: false });
}
