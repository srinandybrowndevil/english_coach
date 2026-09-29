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
import { mistakePatterns, users } from '@/lib/db/schema';
import { MistakeService } from '@/server/services/mistake';
import type { GrammarError } from '@/lib/evaluation/schemas';
import { repairSignatures } from '@/lib/db/repair-signatures';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  (globalThis as unknown as { __db?: unknown }).__db = db;
  return db;
}

const llmError = (rule: string, subcategory: string): GrammarError => ({
  quote: 'didn\'t went', correction: 'didn\'t go', category: 'grammar',
  subcategory, rule, severity: 2, explanation: 'z', kind: 'error',
});

describe('signature drift (E2E-11)', () => {
  it('fossilised + LLM with different subcategory → ONE pattern row, count 2', async () => {
    const db = await testDb();
    const [u] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    const svc = new MistakeService(db);
    await svc.recordDetected(u!.id, [], 'I didn\'t went.', { context: 'tutor:friendly' });
    await svc.recordDetected(u!.id, [llmError('did-plus-past-form', 'past-tense-auxiliary-did')],
      'He didn\'t went again.', { context: 'evaluation' });
    const rows = await db.select().from(mistakePatterns).where(eq(mistakePatterns.learnerId, u!.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.errorSignature).toBe('grammar:did-plus-past-form');
    expect(rows[0]!.occurrenceCount).toBe(2);
    expect(rows[0]!.label).toContain('did + past form');
  });

  it('repairSignatures merges legacy triple-form duplicates', async () => {
    const db = await testDb();
    const [u] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    // simulate legacy duplicate rows as observed pre-fix
    const [a] = await db.insert(mistakePatterns).values({
      learnerId: u!.id, errorSignature: 'grammar:past-tense:did-plus-past-form',
      domain: 'grammar', subcategory: 'past-tense', occurrenceCount: 3,
    }).returning();
    const [b] = await db.insert(mistakePatterns).values({
      learnerId: u!.id, errorSignature: 'grammar:past-tense-auxiliary-did:did-plus-past-form',
      domain: 'grammar', subcategory: 'past-tense-auxiliary-did', occurrenceCount: 2,
    }).returning();
    await db.insert(schema.mistakeOccurrences).values([
      { mistakePatternId: a!.id, originalText: 'x', correctedText: 'y', context: 't' },
      { mistakePatternId: b!.id, originalText: 'x2', correctedText: 'y2', context: 't' },
    ]);
    const res = await repairSignatures(db);
    expect(res.merged).toBe(1);
    const rows = await db.select().from(mistakePatterns).where(eq(mistakePatterns.learnerId, u!.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]!.occurrenceCount).toBe(5);
    const occs = await db.query.mistakeOccurrences.findMany();
    expect(occs.every((o) => o.mistakePatternId === rows[0]!.id)).toBe(true);
    // idempotent
    const again = await repairSignatures(db);
    expect(again.merged).toBe(0);
  });
});
