import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { RoleplayService } from '@/server/services/roleplay';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const { id } = await ctx.params;
  const got = await new RoleplayService(await getDb()).get(session.userId, id);
  if (!got) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const { rp, scenario, turns } = got;
  return NextResponse.json({
    id: rp.id, ended: !!rp.endedAt, evaluation: rp.evaluation,
    scenario: scenario ? {
      slug: scenario.slug, title: scenario.title, domain: scenario.domain,
      description: scenario.description, persona: scenario.persona, config: scenario.config,
    } : null,
    turns: turns.map((t) => ({ role: t.role, content: t.content.replace(/\n<!--internalNote:[^>]*-->/, ''), createdAt: t.createdAt })),
  });
}
