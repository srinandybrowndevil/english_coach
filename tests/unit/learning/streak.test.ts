import { describe, expect, it } from 'vitest';
import { computeStreak } from '@/server/services/progress';

const d = (daysAgo: number, from = '2026-09-30') =>
  new Date(Date.parse(from + 'T00:00:00Z') - daysAgo * 86_400_000).toISOString().slice(0, 10);

describe('streak', () => {
  it('counts today + consecutive back', () => {
    expect(computeStreak([d(0), d(1), d(2)], d(0))).toBe(3);
  });
  it('yesterday counts when today not practised yet', () => {
    expect(computeStreak([d(1), d(2), d(3)], d(0))).toBe(3);
  });
  it('gap breaks the streak', () => {
    expect(computeStreak([d(0), d(2), d(3)], d(0))).toBe(1);
    expect(computeStreak([d(2), d(3)], d(0))).toBe(0);
  });
  it('empty → 0', () => expect(computeStreak([], d(0))).toBe(0));
});
