import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { learningSessions, sessionTurns } from '@/lib/db/schema';
import { SpeechService } from '@/server/services/speech';

// §45 private-audio equivalent: retained audio served only to the session owner.
export async function GET(_req: Request, { params }: { params: Promise<{ turnId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { turnId } = await params;
  const db = await getDb();
  const turn = await db.query.sessionTurns.findFirst({ where: eq(sessionTurns.id, turnId) });
  if (!turn?.audioPath) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const owner = await db.query.learningSessions.findFirst({ where: eq(learningSessions.id, turn.sessionId) });
  if (owner?.learnerId !== session.userId) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const abs = new SpeechService(db).audioFilePath(turn.audioPath);
  if (!abs) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    const bytes = await readFile(abs);
    const ext = path.extname(abs).slice(1);
    const mime = { webm: 'audio/webm', m4a: 'audio/mp4', mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg' }[ext] ?? 'application/octet-stream';
    return new Response(bytes as unknown as BodyInit, { headers: { 'Content-Type': mime, 'Cache-Control': 'private, max-age=300' } });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
