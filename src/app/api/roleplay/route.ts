import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { RoleplayService } from '@/server/services/roleplay';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  scenarioSlug: z.string(), difficulty: z.string().optional(), mode: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const { rpSession, scenario, opener } = await new RoleplayService(await getDb())
    .start(session.userId, body);
  return NextResponse.json({ id: rpSession.id, opener, title: scenario.title, domain: scenario.domain });
}
