import { NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';
import { assertSameOrigin } from '@/lib/security/origin';
import { destroySession, SESSION_COOKIE } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const sid = (await cookies()).get(SESSION_COOKIE)?.value;
  if (sid) await destroySession(sid);
  const res = NextResponse.redirect(`${getEnv().APP_URL}/login`, 303);
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
