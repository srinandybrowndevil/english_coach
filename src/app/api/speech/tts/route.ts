import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { takeTokens } from '@/lib/security/rate-limit';
import { SpeechService } from '@/server/services/speech';

const Body = z.object({ text: z.string().min(1).max(4000), voice: z.string().optional(), speed: z.number().min(0.5).max(2).optional() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const body = Body.parse(await req.json());
  const res = await new SpeechService(await getDb()).synthesize(body.text, body);
  return new Response(res.bytes as unknown as BodyInit, {
    headers: {
      'Content-Type': res.mimeType,
      'Cache-Control': 'private, max-age=86400',
    },
  });
}
