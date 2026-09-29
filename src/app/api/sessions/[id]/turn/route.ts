import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { takeTokens } from '@/lib/security/rate-limit';
import { SessionService } from '@/server/services/session';
import { SettingsService } from '@/server/services/settings';
import { SpeechService } from '@/server/services/speech';
import { TutorService } from '@/server/services/tutor';

// §75: transcript is saved before anything can fail; failures return typed errors.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  const { id } = await params;
  const db = await getDb();
  const sessions = new SessionService(db);
  const existing = await sessions.get(id);
  if (!existing || existing.learnerId !== session.userId)
    return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const form = await req.formData();
  const audio = form.get('audio');
  const textField = z.string().max(20_000).optional().parse(form.get('text') ?? undefined);
  const latencyMs = Number(form.get('responseLatencyMs') ?? 0) || undefined;
  const metrics = latencyMs ? { responseLatencySec: latencyMs / 1000 } : undefined;

  let text = textField ?? '';
  let words: unknown;
  let audioBytes: Uint8Array | null = null;
  let mime = '';

  if (!text) {
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'audio_or_text_required' }, { status: 400 });
    }
    audioBytes = new Uint8Array(await audio.arrayBuffer());
    mime = audio.type || 'audio/webm';
    try {
      const stt = await new SpeechService(db).transcribe(audioBytes, mime, audio.name || 'audio.webm');
      text = stt.text;
      words = stt.words;
    } catch (err) {
      console.error('[turn] stt failed:', err);
      return NextResponse.json({ error: 'stt_failed' }, { status: 502 });
    }
  }

  // transcript is never lost — save the learner turn before anything else can fail
  const learnerTurn = await sessions.addTurn(id, { role: 'learner', text, words, metrics });

  if (audioBytes && text) {
    const settings = await new SettingsService(db).get(session.userId);
    if (settings.privacy.audioRetention !== 'off') {
      try {
        const rel = await new SpeechService(db).persistAudio(session.userId, learnerTurn.id, audioBytes, mime);
        if (rel) {
          const { sessionTurns } = await import('@/lib/db/schema');
          const { eq } = await import('drizzle-orm');
          await db.update(sessionTurns).set({ audioPath: rel }).where(eq(sessionTurns.id, learnerTurn.id));
        }
      } catch (err) {
        console.warn('[turn] audio persist failed:', err);
      }
    }
  }

  try {
    const out = await new TutorService(db).respond(id, text, { metrics, persistedTurnId: learnerTurn.id });
    return NextResponse.json({
      learnerTurn: { id: learnerTurn.id, text, words: words ?? null, tutorTurnId: out.tutorTurnId },
      tutorTurn: out.tutorTurn,
    });
  } catch (err) {
    console.error('[turn] tutor failed:', err);
    return NextResponse.json({ error: 'tutor_failed', learnerTurnId: learnerTurn.id }, { status: 502 });
  }
}
