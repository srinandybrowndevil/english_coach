import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getEnv } from '@/lib/env';
import { getDb } from '@/lib/db/client';
import { issueMagicLinkToken } from '@/lib/auth/magic-link';
import { assertSameOrigin } from '@/lib/security/origin';
import { isAllowedEmail, normalizeEmail } from '@/lib/auth/tokens';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 5;
// ponytail: single-instance in-memory ceiling; move to DB/KV if ever multi-instance.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
  } catch {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (rateLimited(ip)) return NextResponse.json({ ok: true }); // same response, no leak

  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = normalizeEmail(body?.email ?? '');
  const env = getEnv();

  // Never reveal whether the address is allowlisted.
  if (!email || !isAllowedEmail(email, env.ALLOWED_EMAIL)) {
    return NextResponse.json({ ok: true });
  }

  const db = await getDb();
  const token = await issueMagicLinkToken(db, email);

  const link = `${env.APP_URL}/api/auth/verify?token=${token}`;
  if (env.RESEND_API_KEY && env.RESEND_FROM) {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: email,
      subject: 'Your sign-in link',
      text: `Sign in to English Mastery OS: ${link}\n\nThis link expires in 15 minutes.`,
    });
  } else {
    console.info('[auth] magic link (dev):', link);
  }

  return NextResponse.json({ ok: true });
}
