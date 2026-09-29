import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { RoleplayService } from '@/server/services/roleplay';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({ text: z.string().min(1).max(4000) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const body = Body.parse(await req.json());
  try {
    const out = await new RoleplayService(await getDb()).turn(session.userId, id, body.text);
    return NextResponse.json({ reply: out.reply, ended: out.ended, evaluation: out.evaluation?.evaluation ?? null });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 400 });
  }
}
