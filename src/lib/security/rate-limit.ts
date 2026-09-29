// ponytail: in-memory token bucket — single-instance ceiling; move to Redis/KV
// if this ever runs multi-instance.
const buckets = new Map<string, { tokens: number; at: number }>();

export function takeTokens(userId: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(userId) ?? { tokens: limit, at: now };
  const refill = ((now - b.at) / windowMs) * limit;
  b.tokens = Math.min(limit, b.tokens + refill);
  b.at = now;
  if (b.tokens < 1) {
    buckets.set(userId, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(userId, b);
  return true;
}

export function resetRateLimits(): void {
  buckets.clear();
}
