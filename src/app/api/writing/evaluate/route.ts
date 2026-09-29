import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { WritingService } from '@/server/services/writing';
import { WRITING_MODES } from '@/content/writing-templates';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  modeSlug: z.string(), text: z.string().min(1).max(20000),
  submissionId: z.string().optional(), // rewrite → version 2
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const mode = WRITING_MODES.find((m) => m.slug === body.modeSlug);
  if (!mode) return NextResponse.json({ error: 'mode_not_found' }, { status: 404 });
  const out = await new WritingService(await getDb())
    .evaluate(session.userId, mode, body.text, body.submissionId);
  return NextResponse.json({
    submissionId: out.submission!.id, evaluation: out.evaluation, score: out.score,
  });
}
