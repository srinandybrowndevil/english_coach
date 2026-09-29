import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { writingSubmissions } from '@/lib/db/schema';

// §25 — log that the learner revealed model versions without rewriting
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const db = await getDb();
  await db.update(writingSubmissions).set({
    analysis: sql`jsonb_set(coalesce(analysis,'{}'::jsonb), '{revealedWithoutRewrite}', 'true'::jsonb)`,
  }).where(and(eq(writingSubmissions.id, id), eq(writingSubmissions.learnerId, session.userId)));
  return NextResponse.json({ ok: true });
}
