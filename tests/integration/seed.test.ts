import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import { seedContent } from '@/lib/db/seed';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}

const TABLES = [
  'skill_definitions', 'skill_prerequisites', 'vocabulary_items',
  'collocations', 'idioms', 'phrasal_verbs', 'roleplay_scenarios', 'content_items',
] as const;

async function counts(db: Awaited<ReturnType<typeof testDb>>) {
  const out: Record<string, number> = {};
  for (const t of TABLES)
    out[t] = Number((await db.execute(sql.raw(`select count(*)::int as n from ${t}`))).rows[0]!['n']);
  return out;
}

describe('content seeder', () => {
  it('seeds all content and is idempotent on re-run', async () => {
    const db = await testDb();
    await seedContent(db);
    const first = await counts(db);
    expect(first['skill_definitions']).toBeGreaterThanOrEqual(80);
    expect(first['vocabulary_items']).toBeGreaterThanOrEqual(250);
    expect(first['phrasal_verbs']).toBeGreaterThanOrEqual(45);
    expect(first['idioms']).toBeGreaterThanOrEqual(45);
    expect(first['collocations']).toBeGreaterThanOrEqual(60);
    expect(first['roleplay_scenarios']).toBeGreaterThanOrEqual(50); // 22 biz + 8 neg + 20 sim
    expect(first['content_items']).toBeGreaterThan(250);

    await seedContent(db); // run twice
    expect(await counts(db)).toEqual(first);
  });
});
