process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://';

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { eq } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import {
  exerciseAttempts, learnerSkillStates, learnerVocabulary, skillDefinitions, users,
  vocabularyItems, vocabularyReviews,
} from '@/lib/db/schema';
import { CurriculumService } from '@/server/services/curriculum';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  (globalThis as unknown as { __db?: unknown }).__db = db;
  return db;
}

describe('grammar quiz → skill state + exercise_attempts (§17)', () => {
  it('recordSkillAttempt updates learner_skill_states and writes an attempt', async () => {
    const db = await testDb();
    const [u] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    const [def] = await db.insert(skillDefinitions).values({
      slug: 'past-simple', domain: 'grammar', name: 'Past simple', description: 'x', cefrRelevance: 'a2',
    }).returning();
    const svc = new CurriculumService(db);
    const row = await svc.recordSkillAttempt(u!.id, 'past-simple', true, 'grammar-quiz:test');
    expect(row!.status).not.toBe('unseen');
    expect(row!.attemptCount).toBe(1);
    const att = await db.select().from(exerciseAttempts).where(eq(exerciseAttempts.learnerId, u!.id));
    expect(att).toHaveLength(1);
    const states = await db.select().from(learnerSkillStates).where(eq(learnerSkillStates.learnerId, u!.id));
    expect(states[0]!.masteryScore).toBeGreaterThan(0);
  });
});

describe('vocabulary review (§40)', () => {
  it('used_in_context advances next_review_at + writes vocabulary_reviews', async () => {
    const db = await testDb();
    const [u] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    const [v] = await db.insert(vocabularyItems).values({
      slug: 'revenue', word: 'revenue', meaning: 'income',
    }).returning();
    const [lv] = await db.insert(learnerVocabulary).values({
      learnerId: u!.id, vocabularyItemId: v!.id,
    }).returning();
    const svc = new CurriculumService(db);
    const upd = await svc.recordVocabularyReview(u!.id, lv!.id, 'used_in_context', 'Our revenue grew.');
    expect(upd!.status).toBe('active');
    expect(upd!.nextReviewAt).toBeTruthy();
    expect(upd!.successfulContextUses).toBe(1);
    const reviews = await db.select().from(vocabularyReviews);
    expect(reviews).toHaveLength(1);
    expect(reviews[0]!.result).toBe('used_in_context');
  });
});
