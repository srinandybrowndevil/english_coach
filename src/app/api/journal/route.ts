import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { journalEntries } from '@/lib/db/schema';

const Body = z.object({ content: z.string().max(30000), prompt: z.string().optional() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const [row] = await (await getDb()).insert(journalEntries).values({
    learnerId: session.userId, content: body.content, prompt: body.prompt,
  }).returning();
  return NextResponse.json({ id: row!.id });
}
