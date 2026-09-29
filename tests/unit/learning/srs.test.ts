import { describe, expect, it } from 'vitest';
import { LADDER_DAYS, scheduleReview } from '@/lib/learning/srs';

const now = new Date('2026-01-01T00:00:00Z');
const day = 86_400_000;

describe('scheduleReview', () => {
  it('index 0 = same session (+10 minutes)', () => {
    const r = scheduleReview({ intervalIndex: 0, easeFactor: 2.0 }, 'hard', now);
    expect(r.nextReviewAt.getTime()).toBe(now.getTime() + 10 * 60_000);
  });

  it('pass climbs the ladder and bumps ease', () => {
    const r = scheduleReview({ intervalIndex: 0, easeFactor: 2.0 }, 'pass', now);
    const s = { intervalIndex: r.intervalIndex, easeFactor: r.easeFactor, intervalDays: r.intervalDays };
    expect(s.intervalIndex).toBe(1);
    expect(s.intervalDays).toBe(LADDER_DAYS[1]);
    expect(s.easeFactor).toBeCloseTo(2.1);
  });

  it('hard keeps index, lowers ease (floor 1.3)', () => {
    const r = scheduleReview({ intervalIndex: 3, easeFactor: 1.3 }, 'hard', now);
    expect(r.intervalIndex).toBe(3);
    expect(r.easeFactor).toBe(1.3);
  });

  it('fail drops two rungs (floor 0)', () => {
    const r = scheduleReview({ intervalIndex: 4, easeFactor: 2.0 }, 'fail', now);
    expect(r.intervalIndex).toBe(2);
    expect(r.intervalDays).toBe(LADDER_DAYS[2]);
    const floor = scheduleReview({ intervalIndex: 1, easeFactor: 2.0 }, 'fail', now);
    expect(floor.intervalIndex).toBe(0);
  });

  it('beyond the ladder stretches by ease factor', () => {
    const r = scheduleReview({ intervalIndex: LADDER_DAYS.length, easeFactor: 2.0 }, 'pass', now);
    expect(r.intervalIndex).toBe(LADDER_DAYS.length + 1);
    expect(r.intervalDays).toBeGreaterThan(LADDER_DAYS[LADDER_DAYS.length - 1]!);
    expect(r.nextReviewAt.getTime() - now.getTime()).toBeGreaterThan(60 * day);
  });
});
