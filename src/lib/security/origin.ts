import { getEnv } from '@/lib/env';

/** CSRF guard for mutating API routes: Origin must match APP_URL. */
export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get('origin');
  if (!origin) return; // non-browser clients (curl, same-origin form posts may omit)
  if (origin !== new URL(getEnv().APP_URL).origin) {
    throw new Error('Forbidden origin');
  }
}
