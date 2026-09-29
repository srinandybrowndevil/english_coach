import path from 'node:path';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PgliteDatabase } from 'drizzle-orm/pglite';
import type * as schema from './schema';

const MIGRATIONS_DIR = path.join(process.cwd(), 'drizzle', 'migrations');

const g = globalThis as unknown as { __migrate?: Promise<unknown> };

/** Idempotent: runs once per process via a globalThis promise. */
export function runMigrations(
  db: NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>,
  driver: 'pg' | 'pglite',
): Promise<unknown> {
  g.__migrate ??=
    driver === 'pglite'
      ? import('drizzle-orm/pglite/migrator').then(({ migrate }) =>
          migrate(db as PgliteDatabase<typeof schema>, { migrationsFolder: MIGRATIONS_DIR }),
        )
      : import('drizzle-orm/node-postgres/migrator').then(({ migrate }) =>
          migrate(db as NodePgDatabase<typeof schema>, { migrationsFolder: MIGRATIONS_DIR }),
        );
  return g.__migrate;
}
