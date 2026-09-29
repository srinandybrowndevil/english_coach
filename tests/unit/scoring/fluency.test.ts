import { describe, expect, it } from 'vitest';
import { computeFluencyScore } from '@/lib/scoring/fluency';
import type { SpeechMetrics } from '@/lib/scoring/speech-metrics';

const base = (over: Partial<SpeechMetrics> = {}): SpeechMetrics => ({
  durationSec: 60, wordCount: 140, wordsPerMinute: 140,
  pauses: [], pauseCount: 0, averagePauseSec: 0, longPauseCount: 0, totalPauseSec: 5,
  fillers: {}, fillerCount: 1, repetitionCount: 0, selfCorrectionCount: 0,
  ...over,
});

describe('computeFluencyScore', () => {
  it('clean speech scores high with all components present', () => {
    const r = computeFluencyScore(base(), { sentenceCount: 8, completedSentenceCount: 8 });
    expect(r.total).toBeGreaterThan(85);
    expect(r.confidence).toBe('high');
    expect(r.components['repair']!.evidence).toBe('no repairs observed');
  });

  it('many long pauses tank continuity', () => {
    const r = computeFluencyScore(base({ longPauseCount: 7, durationSec: 60 }), { sentenceCount: 8, completedSentenceCount: 8 });
    expect(r.components['continuity']!.score).toBe(0);
    expect(r.total).toBeLessThan(80);
  });

  it('omits latency component when undefined and renormalises', () => {
    const withL = computeFluencyScore(base({ responseLatencySec: 1 }), { sentenceCount: 8, completedSentenceCount: 8 });
    const without = computeFluencyScore(base(), { sentenceCount: 8, completedSentenceCount: 8 });
    expect(without.components['responseLatency']).toBeUndefined();
    expect(withL.components['responseLatency']!.score).toBe(100);
  });

  it('confidence low under 20s', () => {
    const r = computeFluencyScore(base({ durationSec: 10, wordCount: 25 }), { sentenceCount: 2, completedSentenceCount: 2 });
    expect(r.confidence).toBe('low');
  });

  it('repair score uses successfulRepairs ratio', () => {
    const r = computeFluencyScore(base({ selfCorrectionCount: 4 }), { sentenceCount: 8, completedSentenceCount: 8, successfulRepairs: 2 });
    expect(r.components['repair']!.score).toBe(50);
  });
});
