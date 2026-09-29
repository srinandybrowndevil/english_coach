import { describe, expect, it } from 'vitest';
import { nextReadingLevel } from '@/lib/learning/reading-level';
import { containsTamil, distinctNouns } from '@/lib/learning/tamil';
import { deriveSpeechMetrics } from '@/lib/scoring/speech-metrics';
import { RegisterEvaluationSchema } from '@/lib/evaluation/schemas';

describe('reading level stepper (§24)', () => {
  it('steps up on 2/3 ≥80', () => { expect(nextReadingLevel('B1', [80, 90, 40])).toBe('B2'); });
  it('steps down on 2/3 <50', () => { expect(nextReadingLevel('B2', [20, 30, 90])).toBe('B1'); });
  it('holds with <3 attempts', () => { expect(nextReadingLevel('B1', [95])).toBe('B1'); });
  it('holds on mixed', () => { expect(nextReadingLevel('B2', [60, 70, 80])).toBe('B2'); });
});

describe('Tamil detection', () => {
  it('flags Tamil script', () => { expect(containsTamil('நான் வந்தேன்')).toBe(true); });
  it('passes plain English', () => { expect(containsTamil('I came yesterday')).toBe(false); });
});

describe('distinctNouns (rapid naming)', () => {
  it('counts unique content words only', () => {
    expect(distinctNouns('cup cup plate the spoon and fork knife')).toBe(5);
  });
});

describe('pause markers from word timings', () => {
  it('long pause detected between words', () => {
    const m = deriveSpeechMetrics([
      { word: 'hello', start: 0, end: 0.4 },
      { word: 'there', start: 2.2, end: 2.6 }, // 1.8 s gap
      { word: 'again', start: 2.7, end: 3.1 },
    ], 'hello there again');
    expect(m.longPauseCount).toBe(1);
    expect(m.wordsPerMinute).toBeGreaterThan(0);
  });
});

describe('RegisterEvaluationSchema', () => {
  it('validates the mock shape', () => {
    const ok = RegisterEvaluationSchema.safeParse({
      registerFit: { score: 50, evidence: 'mock' },
      detectedRegister: 'neutral',
      meaningPreserved: { value: true, reason: 'ok' },
      grammarErrors: [], modelVersion: 'x', oneAdjustment: 'y',
    });
    expect(ok.success).toBe(true);
  });
});
