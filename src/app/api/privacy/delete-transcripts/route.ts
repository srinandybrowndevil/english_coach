import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { sessionTurns, learningSessions } from '@/lib/db/schema';

const Body = z.object({ confirm: z.literal('DELETE') });

// §45 — nulls turn content/words; metrics, scores and timings stay (they contain no transcript)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  Body.parse(await req.json());
  const db = await getDb();
  const sess = await db.query.learningSessions.findMany({
    where: eq(learningSessions.learnerId, session.userId), columns: { id: true },
  });
  const ids = sess.map((s) => s.id);
  let n = 0;
  if (ids.length) {
    const done = await db.update(sessionTurns)
      .set({ content: '[deleted]', words: null })
      .where(inArray(sessionTurns.sessionId, ids));
    n = (done as unknown as { length?: number })?.length ?? 0;
  }
  return NextResponse.json({ cleared: n });
}
