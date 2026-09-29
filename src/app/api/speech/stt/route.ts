import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { SpeechService } from '@/server/services/speech';

// onboarding mic test + generic ad-hoc transcription (not tied to a session)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const form = await req.formData();
  const file = form.get('audio');
  if (!(file instanceof File)) return NextResponse.json({ error: 'audio required' }, { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const out = await new SpeechService(await getDb()).transcribe(bytes, file.type, file.name);
  return NextResponse.json(out);
}
