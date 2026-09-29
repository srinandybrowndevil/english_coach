import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { learnerProfiles, learningGoals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const Body = z.object({
  goals: z.array(z.string()).min(1),
  dailyAvailableMinutes: z.number().int().min(15).max(90).default(45),
  businessContext: z.string().nullable().optional(),
  technicalContext: z.string().nullable().optional(),
  conversationInterests: z.array(z.string()).default([]),
  explanationLanguage: z.enum(['en', 'en_ta']).default('en_ta'),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  const body = Body.parse(await req.json());
  const db = await getDb();

  await db.insert(learnerProfiles).values({ learnerId: session.userId, name: 'Srinivash' })
    .onConflictDoNothing();
  await db.update(learnerProfiles).set({
    learningGoals: body.goals,
    dailyAvailableMinutes: body.dailyAvailableMinutes,
    businessContext: body.businessContext ?? null,
    technicalContext: body.technicalContext ?? null,
    conversationInterests: body.conversationInterests,
    preferredExplanationLanguage: body.explanationLanguage,
    onboardingCompletedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(learnerProfiles.learnerId, session.userId));

  await db.delete(learningGoals).where(eq(learningGoals.learnerId, session.userId));
  for (const [i, g] of body.goals.entries()) {
    await db.insert(learningGoals).values({ learnerId: session.userId, goal: g, priority: i });
  }
  return NextResponse.json({ ok: true });
}
