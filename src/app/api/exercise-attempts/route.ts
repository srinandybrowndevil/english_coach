import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { exerciseAttempts, exerciseDefinitions } from '@/lib/db/schema';
import { assertSameOrigin } from '@/lib/security/origin';

const Body = z.object({
  exerciseSlug: z.string(), title: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

async function exerciseId(db: Awaited<ReturnType<typeof getDb>>, slug: string, title?: string) {
  const [row] = await db.insert(exerciseDefinitions).values({
    slug, domain: 'fluency', kind: 'fluency_drill', title: title ?? slug, payload: {},
  }).onConflictDoUpdate({ target: exerciseDefinitions.slug, set: { title: title ?? slug } }).returning();
  return row!.id;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const db = await getDb();
  const [row] = await db.insert(exerciseAttempts).values({
    learnerId: session.userId,
    exerciseId: await exerciseId(db, body.exerciseSlug, body.title),
    payload: (body.payload ?? {}) as never,
  }).returning();
  return NextResponse.json(row);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const slug = new URL(req.url).searchParams.get('exercise');
  const db = await getDb();
  const rows = await db
    .select({ slug: exerciseDefinitions.slug, payload: exerciseAttempts.payload, createdAt: exerciseAttempts.createdAt })
    .from(exerciseAttempts)
    .innerJoin(exerciseDefinitions, eq(exerciseAttempts.exerciseId, exerciseDefinitions.id))
    .where(eq(exerciseAttempts.learnerId, session.userId))
    .orderBy(exerciseAttempts.createdAt)
    .limit(500);
  return NextResponse.json(slug ? rows.filter((r) => r.slug === slug) : rows);
}
