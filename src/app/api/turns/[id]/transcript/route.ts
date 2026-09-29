import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { sessionTurns } from '@/lib/db/schema';
import { assertSameOrigin } from '@/lib/security/origin';

// §75 manual transcript override after STT failure.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { id } = await params;
  const body = z.object({ transcript: z.string().min(1).max(20_000) }).parse(await req.json());
  const db = await getDb();
  const [row] = await db.update(sessionTurns).set({ content: body.transcript })
    .where(eq(sessionTurns.id, id)).returning();
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ id: row.id, text: row.content });
}
