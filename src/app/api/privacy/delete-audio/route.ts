import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { sessionTurns, learningSessions } from '@/lib/db/schema';
import { SpeechService } from '@/server/services/speech';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { getEnv } from '@/lib/env';

const Body = z.object({ confirm: z.literal('DELETE') });

// §45/§70 — delete all audio files + null audio_path (scores/metrics kept)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  Body.parse(await req.json());
  const db = await getDb();
  const rows = await db.select({ turnId: sessionTurns.id, audioPath: sessionTurns.audioPath })
    .from(sessionTurns)
    .innerJoin(learningSessions, eq(sessionTurns.sessionId, learningSessions.id))
    .where(and(eq(learningSessions.learnerId, session.userId), isNotNull(sessionTurns.audioPath)));
  let deleted = 0;
  const speech = new SpeechService(db);
  for (const r of rows) {
    const abs = speech.audioFilePath(r.audioPath!);
    if (abs) { await unlink(abs).catch(() => {}); deleted++; }
  }
  // wipe anything left under the user dir
  const dir = path.join(getEnv().AUDIO_STORAGE_DIR, session.userId);
  await import('node:fs/promises').then((f) => f.rm(dir, { recursive: true, force: true })).catch(() => {});
  if (rows.length) {
    await db.update(sessionTurns).set({ audioPath: null })
      .where(inArray(sessionTurns.id, rows.map((r) => r.turnId)));
  }
  return NextResponse.json({ deleted });
}
