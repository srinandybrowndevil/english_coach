import { getEnv } from '@/lib/env';
import { runMigrations } from './migrate';
import * as schema from './schema';
import type { PgliteDatabase } from 'drizzle-orm/pglite';

// NodePgDatabase and PgliteDatabase share the same runtime API; we normalise on
// the pglite type (dev default) and cast the pg branch — unioned driver types
// produce incompatible query-builder generics otherwise.
export type Db = PgliteDatabase<typeof schema>;

// globalThis survives Next dev HMR; a second PGlite on the same dir would fail.
const g = globalThis as unknown as { __db?: Db; __dbInit?: Promise<Db> };

async function init(): Promise<Db> {
  const env = getEnv();
  let db: Db;
  let driver: 'pg' | 'pglite';
  if (env.DATABASE_URL) {
    const { drizzle } = await import('drizzle-orm/node-postgres');
    const { Pool } = await import('pg');
    db = drizzle(new Pool({ connectionString: env.DATABASE_URL }), { schema }) as unknown as Db;
    driver = 'pg';
  } else {
    const { drizzle } = await import('drizzle-orm/pglite');
    const { PGlite } = await import('@electric-sql/pglite');
    db = drizzle(new PGlite(env.PGLITE_DIR), { schema });
    driver = 'pglite';
  }
  await runMigrations(db, driver);
  g.__db = db;
  return db;
}

export function getDb(): Promise<Db> {
  if (g.__db) return Promise.resolve(g.__db);
  g.__dbInit ??= init();
  return g.__dbInit;
}
