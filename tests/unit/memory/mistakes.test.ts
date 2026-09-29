import { describe, expect, it } from 'vitest';
import { applyOccurrence, applyReview, buildSignature } from '@/lib/memory/mistakes';

const d = (n: number) => new Date(n * 86_400_000);
const sig = buildSignature({ domain: 'Grammar', subcategory: 'Past tense', rule: 'did + past form' });
const ev = { context: 'conversation', at: d(0), signature: sig, domain: 'grammar', subcategory: 'past-tense' };

describe('buildSignature', () => {
  it('produces lowercase kebab triples', () => {
    expect(sig).toBe('grammar:past-tense:did-past-form');
  });
});

describe('applyOccurrence', () => {
  it('creates a new pattern then increments', () => {
    const s = applyOccurrence(null, ev)!;
    expect(s.occurrenceCount).toBe(1);
    expect(s.status).toBe('new');
    const s2 = applyOccurrence(s, { context: 'writing', at: d(1) })!;
    expect(s2.occurrenceCount).toBe(2);
    expect(s2.status).toBe('recurring');
    expect(s2.contextsSeen).toContain('writing');
  });
});

describe('applyReview mastery gates', () => {
  const fresh = () => applyOccurrence(null, ev)!;

  it('one correct review does NOT master', () => {
    const s = applyReview(fresh(), { success: true, context: 'a', at: d(1) });
    expect(s.status).not.toBe('mastered');
    expect(s.status).not.toBe('monitoring');
  });

  it('three same-day successes do NOT master (needs date separation)', () => {
    let s = fresh();
    for (const c of ['a', 'b', 'c']) s = applyReview(s, { success: true, context: c, at: d(1) });
    expect(s.status).toBe('improving');
  });

  it('3 successes across 4 days in 2 contexts → monitoring', () => {
    let s = fresh();
    s = applyReview(s, { success: true, context: 'speaking', at: d(1) });
    s = applyReview(s, { success: true, context: 'writing', at: d(2) });
    s = applyReview(s, { success: true, context: 'speaking', at: d(5) });
    expect(s.status).toBe('monitoring');
  });

  it('monitoring + success ≥7 days later → mastered', () => {
    let s = fresh();
    s = applyReview(s, { success: true, context: 'speaking', at: d(1) });
    s = applyReview(s, { success: true, context: 'writing', at: d(2) });
    s = applyReview(s, { success: true, context: 'speaking', at: d(5) });
    expect(s.status).toBe('monitoring');
    s = applyReview(s, { success: true, context: 'writing', at: d(13) });
    expect(s.status).toBe('mastered');
  });

  it('mastered + new occurrence → relapsed, same signature, count up', () => {
    let s = fresh();
    s = applyReview(s, { success: true, context: 'speaking', at: d(1) });
    s = applyReview(s, { success: true, context: 'writing', at: d(2) });
    s = applyReview(s, { success: true, context: 'speaking', at: d(5) });
    s = applyReview(s, { success: true, context: 'writing', at: d(13) });
    expect(s.status).toBe('mastered');
    const r = applyOccurrence(s, { context: 'negotiation', at: d(20) })!;
    expect(r.status).toBe('relapsed');
    expect(r.occurrenceCount).toBe(2);
    expect(r.errorSignature).toBe(sig);
  });

  it('failed review resets streak and reschedules', () => {
    let s = fresh();
    s = applyReview(s, { success: true, context: 'a', at: d(1) });
    s = applyReview(s, { success: true, context: 'b', at: d(2) });
    expect(s.reviewStreak).toBe(2);
    s = applyReview(s, { success: false, context: 'c', at: d(3) });
    expect(s.reviewStreak).toBe(0);
    expect(s.status).toBe('recurring');
  });
});
