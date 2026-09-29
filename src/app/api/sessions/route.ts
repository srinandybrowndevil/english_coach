import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { takeTokens } from '@/lib/security/rate-limit';
import { SettingsService } from '@/server/services/settings';
import { SpeechService } from '@/server/services/speech';
import { SessionService } from '@/server/services/session';

const Body = z.object({
  type: z.enum(['tutor_voice', 'tutor_text', 'speak', 'fluency', 'roleplay']),
  tutorMode: z.string().optional(),
  correctionMode: z.string().optional(),
  sessionGoal: z.string().optional(),
  planItemId: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const body = Body.parse(await req.json());
  const db = await getDb();
  // purge expired audio per user's retention setting — piggybacks on session start
  const settings = await new SettingsService(db).get(session.userId);
  if (settings.privacy.audioRetention === '7d' || settings.privacy.audioRetention === '30d') {
    void new SpeechService(db).purgeExpired(session.userId, settings.privacy.audioRetention).catch(() => {});
  }
  const row = await new SessionService(db).start(session.userId, body);
  return NextResponse.json(row);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const rows = await new SessionService(await getDb()).listRecent(session.userId);
  return NextResponse.json(rows);
}
