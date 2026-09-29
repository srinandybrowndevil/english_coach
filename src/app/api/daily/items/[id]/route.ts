import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { CurriculumService } from '@/server/services/curriculum';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const { status } = z.object({
    status: z.enum(['pending', 'in_progress', 'done', 'skipped']),
  }).parse(await req.json());
  await new CurriculumService(await getDb()).markItem(id, status);
  return NextResponse.json({ ok: true });
}
