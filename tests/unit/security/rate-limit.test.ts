import { describe, expect, it, vi } from 'vitest';
import { resetRateLimits, takeTokens } from '@/lib/security/rate-limit';

describe('token-bucket rate limit', () => {
  it('allows up to the limit then blocks', () => {
    resetRateLimits();
    for (let i = 0; i < 60; i++) expect(takeTokens('u')).toBe(true);
    expect(takeTokens('u')).toBe(false);
    expect(takeTokens('u')).toBe(false);
  });

  it('separate users have separate buckets; refills over time', () => {
    resetRateLimits();
    for (let i = 0; i < 60; i++) takeTokens('a');
    expect(takeTokens('a')).toBe(false);
    expect(takeTokens('b')).toBe(true);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 61_000);
    expect(takeTokens('a')).toBe(true);
    vi.useRealTimers();
  });
});
