import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PREFIXES = ['/login', '/api/auth/', '/icons/', '/_next/', '/icon-', '/apple-touch-icon'];
const PUBLIC_EXACT = ['/manifest.webmanifest', '/favicon.ico', '/sw.js', '/offline'];
const SID_SHAPE = /^[A-Za-z0-9_-]{32,}$/;

// Edge-layer gate: checks cookie presence/shape only. Real DB validation happens
// in requireSession() inside the (app) layout — the proxy cannot share the PGlite
// connection. See docs/architecture.md.
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname === '/api/auth'
  ) {
    return NextResponse.next();
  }
  const sid = req.cookies.get('sid')?.value ?? '';
  if (!SID_SHAPE.test(sid)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
