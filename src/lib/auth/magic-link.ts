import { and, eq, gt, isNull } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { authTokens, users } from '@/lib/db/schema';
import { generateToken, hashToken } from './tokens';

export const MAGIC_LINK_TTL_MS = 15 * 60 * 1000;

export async function issueMagicLinkToken(db: Db, email: string): Promise<string> {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = existing[0] ?? (await db.insert(users).values({ email }).returning())[0]!;
  const token = generateToken();
  await db.insert(authTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + MAGIC_LINK_TTL_MS),
  });
  return token;
}

/** Marks a valid token consumed and returns its userId; null if invalid/expired/consumed. */
export async function consumeMagicLinkToken(db: Db, token: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(token)),
        isNull(authTokens.consumedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db.update(authTokens).set({ consumedAt: new Date() }).where(eq(authTokens.id, row.id));
  return row.userId;
}
