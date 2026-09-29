import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { sessionTurns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { assertSameOrigin } from '@/lib/security/origin';
import { takeTokens } from '@/lib/security/rate-limit';
import { EvaluationService } from '@/server/services/evaluation';

const Body = z.object({ taskPrompt: z.string().optional(), register: z.string().optional() });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const { id } = await params;
  const body = Body.parse(await req.json().catch(() => ({})));
  const db = await getDb();
  const turn = await db.query.sessionTurns.findFirst({ where: eq(sessionTurns.id, id) });
  if (!turn) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    const out = await new EvaluationService(db).evaluateTurn(id, body);
    return NextResponse.json(out);
  } catch (err) {
    console.error('[evaluate] failed:', err);
    return NextResponse.json({ error: 'evaluation_failed' }, { status: 502 });
  }
}
