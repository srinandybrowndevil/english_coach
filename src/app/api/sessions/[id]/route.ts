import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { SessionService } from '@/server/services/session';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await params;
  const row = await new SessionService(await getDb()).getWithTurns(id);
  if (!row || row.learnerId !== session.userId)
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(row);
}
