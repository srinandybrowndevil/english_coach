import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { AssessmentService } from '@/server/services/assessment';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const svc = new AssessmentService(await getDb());
  const id = new URL(req.url).searchParams.get('id');
  if (id) return NextResponse.json(await svc.currentStep(id));
  return NextResponse.json(await svc.list(session.userId));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { kind } = z.object({ kind: z.enum(['initial', 'monthly']).default('initial') })
    .parse(await req.json().catch(() => ({})));
  const a = await new AssessmentService(await getDb()).startOrResume(session.userId, kind);
  return NextResponse.json(a);
}
