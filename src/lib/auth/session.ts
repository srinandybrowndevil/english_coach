import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq, gt, and } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { sessions, users } from '@/lib/db/schema';
import { generateToken, hashToken } from './tokens';

export const SESSION_COOKIE = 'sid';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const LAST_SEEN_UPDATE_MS = 60 * 60 * 1000;

export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  const sid = generateToken();
  await db.insert(sessions).values({
    userId,
    sessionHash: hashToken(sid),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return sid;
}

export type Session = { userId: string; email: string };

export const getSession = cache(async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (!sid || sid.length < 32) return null;
  const db = await getDb();
  const rows = await db
    .select({ userId: sessions.userId, sessionId: sessions.id, lastSeenAt: sessions.lastSeenAt, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.sessionHash, hashToken(sid)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  if (Date.now() - row.lastSeenAt.getTime() > LAST_SEEN_UPDATE_MS) {
    await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, row.sessionId));
  }
  return { userId: row.userId, email: row.email };
});

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function destroySession(sid: string): Promise<void> {
  const db = await getDb();
  await db.delete(sessions).where(eq(sessions.sessionHash, hashToken(sid)));
}
