import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { AssessmentService } from '@/server/services/assessment';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const body = z.object({ itemSlug: z.string(), response: z.record(z.string(), z.unknown()) })
    .parse(await req.json());
  return NextResponse.json(
    await new AssessmentService(await getDb()).submit(id, body.itemSlug, body.response),
  );
}
