import { defineConfig } from 'drizzle-kit';

const url = process.env.DATABASE_URL;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema/*.ts',
  out: './drizzle/migrations',
  ...(url
    ? { dbCredentials: { url } }
    : { driver: 'pglite', dbCredentials: { url: process.env.PGLITE_DIR ?? './.data/pglite' } }),
});
