import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import { mistakePatterns, users } from '@/lib/db/schema';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}

describe('db migrations + constraints', () => {
  it('migrations apply cleanly and mistake_patterns enforces (learner_id, error_signature) unique', async () => {
    const db = await testDb();
    const [user] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    expect(user).toBeTruthy();

    const pattern = {
      learnerId: user!.id,
      errorSignature: 'did + past-tense verb',
      domain: 'grammar',
      subcategory: 'past tense > auxiliary did',
    };
    await db.insert(mistakePatterns).values(pattern);
    await expect(db.insert(mistakePatterns).values(pattern)).rejects.toThrow();
  });
});
