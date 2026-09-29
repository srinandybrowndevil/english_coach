import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { consumeMagicLinkToken } from '@/lib/auth/magic-link';
import { createSession, SESSION_COOKIE } from '@/lib/auth/session';

export async function GET(req: Request) {
  const env = getEnv();
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const loginUrl = (path: string) => NextResponse.redirect(`${env.APP_URL}${path}`);

  if (!token) return loginUrl('/login?error=invalid');

  const db = await getDb();
  const userId = await consumeMagicLinkToken(db, token);
  if (!userId) return loginUrl('/login?error=invalid');

  const sid = await createSession(userId);
  const res = loginUrl('/');
  res.cookies.set(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
