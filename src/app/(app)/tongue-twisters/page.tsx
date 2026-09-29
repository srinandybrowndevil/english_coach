import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { exerciseAttempts, exerciseDefinitions } from '@/lib/db/schema';
import { TONGUE_TWISTERS } from '@/content/tongue-twisters';
import { TwisterClient } from './TwisterClient';

export const metadata = { title: 'Tongue twisters' };

export default async function TongueTwistersPage() {
  const session = await requireSession();
  const db = await getDb();
  const attempts = await db
    .select({ slug: exerciseDefinitions.slug, payload: exerciseAttempts.payload })
    .from(exerciseAttempts)
    .innerJoin(exerciseDefinitions, eq(exerciseAttempts.exerciseId, exerciseDefinitions.id))
    .where(eq(exerciseAttempts.learnerId, session.userId));
  const best = new Map<string, number>();
  for (const a of attempts) {
    const m = a.slug.match(/^twister:(.+)$/);
    if (!m) continue;
    const acc = (a.payload as { accuracy?: number } | null)?.accuracy ?? 0;
    if (acc > (best.get(m[1]!) ?? 0)) best.set(m[1]!, acc);
  }
  return <TwisterClient twisters={TONGUE_TWISTERS} bests={Object.fromEntries(best)} />;
}
