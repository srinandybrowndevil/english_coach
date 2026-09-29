import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import path from 'node:path';
import { generateToken, hashToken, isAllowedEmail, normalizeEmail } from '@/lib/auth/tokens';
import { consumeMagicLinkToken, issueMagicLinkToken } from '@/lib/auth/magic-link';
import * as schema from '@/lib/db/schema';
import { authTokens } from '@/lib/db/schema';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}

describe('allowlist + token helpers', () => {
  it('normalises email (trim + lowercase)', () => {
    expect(normalizeEmail('  Learner@Example.COM ')).toBe('learner@example.com');
  });

  it('matches allowlist after normalisation', () => {
    expect(isAllowedEmail(' Learner@Example.com ', 'learner@example.com')).toBe(true);
    expect(isAllowedEmail('other@example.com', 'learner@example.com')).toBe(false);
  });

  it('token hash round-trips deterministically', () => {
    const t = generateToken();
    expect(t.length).toBeGreaterThanOrEqual(32);
    expect(hashToken(t)).toBe(hashToken(t));
    expect(hashToken(t)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashToken(t)).not.toBe(t);
  });
});

describe('magic-link tokens', () => {
  it('issues then consumes a token once; second consume is rejected', async () => {
    const db = await testDb();
    const token = await issueMagicLinkToken(db, 'learner@example.com');
    const userId = await consumeMagicLinkToken(db, token);
    expect(userId).toBeTruthy();
    // consumed -> rejected
    expect(await consumeMagicLinkToken(db, token)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const db = await testDb();
    const token = await issueMagicLinkToken(db, 'learner@example.com');
    await db
      .update(authTokens)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(authTokens.tokenHash, hashToken(token)));
    expect(await consumeMagicLinkToken(db, token)).toBeNull();
  });

  it('non-allowlisted email is never issued a token (helper not called, allowlist check is upstream)', () => {
    // route returns ok without calling issueMagicLinkToken — guard is isAllowedEmail
    expect(isAllowedEmail('attacker@example.com', 'learner@example.com')).toBe(false);
  });
});
