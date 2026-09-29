import { describe, expect, it } from 'vitest';
import { computeGrammarScore } from '@/lib/scoring/grammar';
import { computePronunciationScore } from '@/lib/scoring/pronunciation';
import { computeVocabularyScore } from '@/lib/scoring/vocabulary';
import { computeWritingScore } from '@/lib/scoring/writing';
import { computeNegotiationScore } from '@/lib/scoring/negotiation';
import { computePresentationScore } from '@/lib/scoring/presentation';
import { estimateCefr } from '@/lib/scoring/cefr';
import samples from '../../fixtures/transcripts/samples.json';

describe('computeGrammarScore', () => {
  it('no errors → ~100 plus complexity bonus', () => {
    const r = computeGrammarScore([], 120, { subordinateClauses: 4, sentences: 8 });
    expect(r.total).toBe(100);
    expect(r.confidence).toBe('high');
  });
  it('severity weights density', () => {
    const heavy = computeGrammarScore([{ severity: 3 }], 20, { subordinateClauses: 0, sentences: 4 });
    const light = computeGrammarScore([{ severity: 1 }], 20, { subordinateClauses: 0, sentences: 4 });
    expect(heavy.total).toBeLessThan(light.total);
  });
  it('complexity bonus only when wordCount >= 20', () => {
    const r = computeGrammarScore([], 10, { subordinateClauses: 3, sentences: 2 });
    expect(r.components['complexityBonus']).toBeUndefined();
  });
  it('confidence scales with wordCount', () => {
    expect(computeGrammarScore([], 10, { subordinateClauses: 0, sentences: 1 }).confidence).toBe('low');
  });
});

describe('computePronunciationScore', () => {
  it('renormalises over present dims and reports coverage', () => {
    const r = computePronunciationScore({
      intelligibility: { score: 80, evidence: 'transcript matches target' },
      wordStress: { score: 60, evidence: 'stress shifts detected' },
    });
    expect(r.coverage).toBeCloseTo(0.45);
    expect(r.confidence).toBe('low');
    expect(r.components['rhythm']).toBeUndefined();
    expect(r.total).toBeCloseTo(73.3, 0); // (80*.3 + 60*.15)/.45 = 73.3
  });
  it('missing intelligibility forces low confidence', () => {
    const r = computePronunciationScore({
      wordStress: { score: 90, evidence: 'x' }, rhythm: { score: 90, evidence: 'x' },
      sentenceStress: { score: 90, evidence: 'x' }, connectedSpeech: { score: 90, evidence: 'x' },
      consistency: { score: 90, evidence: 'x' }, targetSound: { score: 90, evidence: 'x' },
    });
    expect(r.confidence).toBe('low');
  });
});

describe('computeVocabularyScore', () => {
  it('repetitive text scores lower than varied text', () => {
    const rep = computeVocabularyScore('the good good good thing is very very very nice good thing');
    const varied = computeVocabularyScore(samples.cleanB2);
    expect(varied.total).toBeGreaterThan(rep.total);
  });
  it('rated dimensions fold in with evidence', () => {
    const r = computeVocabularyScore(samples.cleanB2, {
      precision: { score: 80, evidence: 'specific verbs used' },
    });
    expect(r.components['precision']!.evidence).toBe('specific verbs used');
  });
});

describe('computeWritingScore', () => {
  const dims = {
    grammar: { score: 80, evidence: 'e' }, clarity: { score: 70, evidence: 'e' },
    coherence: { score: 70, evidence: 'e' }, structure: { score: 60, evidence: 'e' },
    vocabulary: { score: 70, evidence: 'e' }, naturalness: { score: 60, evidence: 'e' },
    register: { score: 80, evidence: 'e' }, conciseness: { score: 50, evidence: 'e' },
    mechanics: { score: 90, evidence: 'e' },
  };
  it('weighted result in range', () => {
    const r = computeWritingScore(dims, { wordCount: 300 });
    expect(r.total).toBeGreaterThan(60);
    expect(r.total).toBeLessThan(80);
    expect(r.confidence).toBe('high');
  });
  it('weight overrides renormalise', () => {
    const r = computeWritingScore(dims, { wordCount: 100, weightOverrides: { grammar: 1, clarity: 0, coherence: 0, structure: 0, vocabulary: 0, naturalness: 0, register: 0, conciseness: 0, mechanics: 0 } });
    expect(r.total).toBe(80);
  });
});

describe('computeNegotiationScore', () => {
  it('keeps language and negotiation separate', () => {
    const r = computeNegotiationScore({
      language: { grammar: { score: 90, evidence: 'e' } },
      negotiation: { closing: { score: 30, evidence: 'e' } },
    });
    expect(r.language.total).toBe(90);
    expect(r.negotiation.total).toBe(30);
    expect('combined' in r).toBe(false);
  });
});

describe('computePresentationScore', () => {
  it('exposes deliverySignals, never a confidence dimension', () => {
    const r = computePresentationScore(
      { opening: { score: 80, evidence: 'e' } },
      { wpm: 140, longPauseCount: 2, fillerCount: 5 },
    );
    expect(r.deliverySignals.wpm).toBe(140);
    expect(r.components['confidenceProxy']).toBeUndefined();
  });
});

describe('estimateCefr', () => {
  it('gates overall at lowest critical domain + 1', () => {
    const all85 = { score: 85, evidenceCount: 5 };
    const r = estimateCefr({
      speaking: all85, listening: all85, reading: all85,
      writing: { score: 45, evidenceCount: 5 }, grammar: all85, vocabulary: all85,
    });
    expect(r.level).toBe('b2');
    expect(r.gate).toContain('writing');
    expect(r.breakdown['writing']!.level).toBe('b1');
  });
  it('no evidence → level null', () => {
    const r = estimateCefr({});
    expect(r.level).toBeNull();
    expect(r.confidence).toBe('low');
  });
  it('low evidence → low confidence; rich evidence → high', () => {
    const r = estimateCefr({ speaking: { score: 70, evidenceCount: 4 } });
    expect(r.confidence).toBe('low');
    const rich = estimateCefr({
      speaking: { score: 70, evidenceCount: 8 }, listening: { score: 70, evidenceCount: 8 },
      reading: { score: 70, evidenceCount: 5 }, writing: { score: 70, evidenceCount: 5 },
      grammar: { score: 70, evidenceCount: 5 }, vocabulary: { score: 70, evidenceCount: 5 },
    });
    expect(rich.confidence).toBe('high');
    expect(rich.level).toBe('c1');
  });
});
