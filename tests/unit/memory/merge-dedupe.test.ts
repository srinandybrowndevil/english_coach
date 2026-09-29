import { describe, expect, it } from 'vitest';
import { mergeDetections } from '@/server/services/mistake';
import type { GrammarError } from '@/lib/evaluation/schemas';

const err = (rule: string, quote = 'x'): GrammarError => ({
  quote, correction: 'y', category: 'grammar', subcategory: 'past-tense',
  rule, severity: 2, explanation: 'z', kind: 'error',
});

describe('mergeDetections (LLM + fossilised, dedupe by signature)', () => {
  it('one row per signature even when LLM repeats it', () => {
    const items = mergeDetections([err('did-plus-past-form'), err('did-plus-past-form', 'a')], 'clean text');
    expect(items).toHaveLength(1);
  });

  it('fossilised detection fills gaps the LLM missed', () => {
    const items = mergeDetections([], 'We need to discuss about the roadmap.');
    expect(items.map((i) => i.signature)).toContain('lexical:verb-complement:discuss-about');
  });

  it('LLM error wins over fossilised for the same signature', () => {
    const items = mergeDetections(
      [{ ...err('discuss-about', 'discuss about it'), category: 'lexical', subcategory: 'verb-complement' }],
      'We need to discuss about it.',
    );
    expect(items).toHaveLength(1);
    expect(items[0]!.kind).toBe('error');
  });
});
