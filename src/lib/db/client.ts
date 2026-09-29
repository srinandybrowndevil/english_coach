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

// PGlite loads its wasm/data assets via `new URL("file://…", import.meta.url)`,
// which inside Next's bundled server realm fails `instanceof URL` in real fs
// (ERR_INVALID_ARG_TYPE). Load them ourselves through createRequire's real fs
// and pass the compiled modules / fs bundle in via PGliteOptions.
let pgliteAssets: Promise<{
  pgliteWasmModule: WebAssembly.Module;
  initdbWasmModule: WebAssembly.Module;
  fsBundle: Blob;
}> | null = null;

function loadPgliteAssets() {
  pgliteAssets ??= (async () => {
    const { createRequire } = await import('node:module');
    const path = await import('node:path');
    const req = createRequire(process.cwd() + '/noop.js');
    const fs = req('fs') as typeof import('node:fs');
    const dist = path.dirname(req.resolve('@electric-sql/pglite')); // → dist/index.*
    const read = (f: string) => fs.readFileSync(path.join(dist, f));
    const [pgliteWasmModule, initdbWasmModule] = await Promise.all([
      WebAssembly.compile(read('pglite.wasm')),
      WebAssembly.compile(read('initdb.wasm')),
    ]);
    return { pgliteWasmModule, initdbWasmModule, fsBundle: new Blob([read('pglite.data')]) };
  })();
  return pgliteAssets;
}

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
    const assets = await loadPgliteAssets();
    db = drizzle(new PGlite(env.PGLITE_DIR, assets), { schema });
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
