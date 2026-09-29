import { and, eq, like } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { exerciseAttempts, exerciseDefinitions, learnerSkillStates, mistakePatterns } from '@/lib/db/schema';
import { IPA_MODULES, SOUND_CONTRASTS } from '@/content/pronunciation';
import type { SkillStatus } from '@/lib/learning/skills';
import { PronunciationClient } from './PronunciationClient';

export const metadata = { title: 'Pronunciation' };

export default async function PronunciationPage() {
  const session = await requireSession();
  const db = await getDb();

  // words the STT repeatedly mis-heard (pronunciation drill attempts with mismatch)
  const attempts = await db
    .select({ slug: exerciseDefinitions.slug, payload: exerciseAttempts.payload })
    .from(exerciseAttempts)
    .innerJoin(exerciseDefinitions, eq(exerciseAttempts.exerciseId, exerciseDefinitions.id))
    .where(and(eq(exerciseAttempts.learnerId, session.userId), like(exerciseDefinitions.slug, 'pron:%')));
  const mismatchCount = new Map<string, number>();
  for (const a of attempts) {
    const p = a.payload as { mismatch?: boolean; target?: string } | null;
    if (p?.mismatch && p.target) mismatchCount.set(p.target, (mismatchCount.get(p.target) ?? 0) + 1);
  }
  const difficult = [...mismatchCount].map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count).slice(0, 20);

  const savedErrors = (await db.query.mistakePatterns.findMany({
    where: and(eq(mistakePatterns.learnerId, session.userId), eq(mistakePatterns.domain, 'pronunciation')),
  })).map((p) => ({ id: p.id, label: p.label ?? p.errorSignature }));

  const defs = await db.query.skillDefinitions.findMany();
  const states = await db.query.learnerSkillStates.findMany({
    where: eq(learnerSkillStates.learnerId, session.userId),
  });
  const slugToDef = new Map(defs.map((d) => [d.slug, d.id]));
  const stateBySkill = new Map(states.map((s) => [s.skillId, s.status]));
  const statuses = Object.fromEntries(
    SOUND_CONTRASTS.map((c) => [c.slug, (slugToDef.get(c.slug) && stateBySkill.get(slugToDef.get(c.slug)!)) ?? 'unseen']),
  ) as Record<string, SkillStatus>;

  return (
    <PronunciationClient
      contrasts={SOUND_CONTRASTS} ipaModules={IPA_MODULES}
      attempts={difficult} savedErrors={savedErrors} statuses={statuses}
    />
  );
}
