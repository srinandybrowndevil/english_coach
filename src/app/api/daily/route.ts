import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { CurriculumService } from '@/server/services/curriculum';
import { SettingsService } from '@/server/services/settings';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json(await new CurriculumService(await getDb()).todayPlan(session.userId));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const db = await getDb();
  const { minutes } = z.object({ minutes: z.number().int().min(5).max(120).optional() })
    .parse(await req.json().catch(() => ({})));
  const target = minutes ?? (await new SettingsService(db).get(session.userId)).learning.dailyTargetMinutes;
  return NextResponse.json(
    await new CurriculumService(db).generateDailyPlan(session.userId, target),
  );
}
