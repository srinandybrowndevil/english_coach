import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { SessionService } from '@/server/services/session';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { id } = await params;
  const svc = new SessionService(await getDb());
  const existing = await svc.get(id);
  if (!existing || existing.learnerId !== session.userId)
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const summary = await svc.end(id);
  return NextResponse.json({ summary });
}
