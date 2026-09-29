import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { RoleplayService } from '@/server/services/roleplay';
import { takeTokens } from '@/lib/security/rate-limit';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const { evaluation } = await new RoleplayService(await getDb()).evaluate(session.userId, id);
  return NextResponse.json(evaluation);
}
