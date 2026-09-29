import { describe, expect, it } from 'vitest';
import { deriveSpeechMetrics } from '@/lib/scoring/speech-metrics';
import samples from '../../fixtures/transcripts/samples.json';

const words = (text: string, gapAt?: number) => {
  const toks = text.split(/\s+/);
  let t = 0;
  return toks.map((w, i) => {
    const start = t;
    const end = t + 0.4;
    t = end + (i === gapAt ? 2.0 : 0.2);
    return { word: w, start, end };
  });
};

describe('deriveSpeechMetrics', () => {
  it('counts words, duration, wpm from timings', () => {
    const m = deriveSpeechMetrics(words('the cat sat on the mat'), 'the cat sat on the mat');
    expect(m.wordCount).toBe(6);
    expect(m.durationSec).toBeGreaterThan(0);
    expect(m.wordsPerMinute).toBeGreaterThan(0);
  });

  it('detects pauses and long pauses', () => {
    const m = deriveSpeechMetrics(words('hello world goodbye now', 1), 'hello world goodbye now');
    expect(m.pauseCount).toBe(1);
    expect(m.longPauseCount).toBe(1);
    expect(m.totalPauseSec).toBeCloseTo(2.0);
  });

  it('counts fillers per phrase, case-insensitive, whole-token', () => {
    const m = deriveSpeechMetrics([], samples.fillerHeavy.transcript);
    expect(m.fillerCount).toBeGreaterThanOrEqual(samples.fillerHeavy.expectedMinFillers);
    expect(m.fillers['basically']).toBeGreaterThanOrEqual(2);
    expect(m.fillers['like']).toBeGreaterThanOrEqual(2);
    // "kind of stuck" — 'kind'/'of' are not fillers; 'likely' must not count as 'like'
    const clean = deriveSpeechMetrics([], 'I will likely finish the summary today.');
    expect(clean.fillerCount).toBe(0);
  });

  it('counts immediate repetitions', () => {
    const m = deriveSpeechMetrics([], 'the the answer is is here');
    expect(m.repetitionCount).toBe(2);
  });

  it('falls back to token-count duration when no timings', () => {
    const m = deriveSpeechMetrics([], samples.cleanB2);
    expect(m.durationSec).toBeCloseTo(m.wordCount / 2.5);
  });

  it('passes through responseLatencySec', () => {
    const m = deriveSpeechMetrics([], 'yes', { responseLatencySec: 2.5 });
    expect(m.responseLatencySec).toBe(2.5);
  });
});
