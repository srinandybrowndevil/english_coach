import { createHash, randomBytes } from 'node:crypto';

export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAllowedEmail(email: string, allowed: string): boolean {
  return normalizeEmail(email) === normalizeEmail(allowed);
}
