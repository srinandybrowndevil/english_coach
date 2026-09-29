import { describe, expect, it } from 'vitest';
import { detectFossilised } from '@/lib/memory/fossilised';
import { mergeDetections } from '@/server/services/mistake';
import { normaliseRule } from '@/lib/memory/rules';
import type { GrammarError } from '@/lib/evaluation/schemas';

const err = (rule: string, subcategory: string): GrammarError => ({
  quote: 'x', correction: 'y', category: 'grammar', subcategory,
  rule, severity: 2, explanation: 'z', kind: 'error',
});

describe('normaliseRule', () => {
  it('maps subcategory/alias variants to one canonical rule+domain', () => {
    expect(normaliseRule('lexical', 'discuss-about').ruleId).toBe('discuss-about');
    expect(normaliseRule('lexical', 'discuss-about').domain).toBe('grammar');
    expect(normaliseRule('grammar', 'verb-complementation').ruleId).toBe('discuss-about');
    expect(normaliseRule('lexical', 'verb-complement').ruleId).toBe('discuss-about');
  });
  it('falls back to humanised label for unknown rules', () => {
    const r = normaliseRule('grammar', 'third-conditional-auxiliary');
    expect(r.ruleId).toBe('third-conditional-auxiliary');
    expect(r.domain).toBe('grammar');
    expect(r.label).toBe('Third conditional auxiliary');
  });
});

describe('signature agreement (E2E-11)', () => {
  it('detector and LLM produce IDENTICAL signatures for "didn\'t went"', () => {
    const det = mergeDetections([], 'I didn\'t went there yesterday.')[0]!.signature;
    const llm = mergeDetections([err('did-plus-past-form', 'past tense auxiliary')], 'clean')[0]!.signature;
    const llm2 = mergeDetections([err('did-plus-past-form', 'past-tense-auxiliary-did')], 'clean')[0]!.signature;
    expect(det).toBe('grammar:did-plus-past-form');
    expect(llm).toBe(det);
    expect(llm2).toBe(det);
  });
  it('detector and LLM produce IDENTICAL signatures for "discuss about"', () => {
    const det = mergeDetections([], 'Let us discuss about the project.')[0]!.signature;
    const llm = mergeDetections(
      [{ ...err('discuss-about', 'verb-complement'), category: 'lexical' }], 'clean',
    )[0]!.signature;
    expect(det).toBe('grammar:discuss-about');
    expect(llm).toBe(det);
  });
  it('detector signature IS canonical (no further normalise needed)', () => {
    for (const d of detectFossilised('I didn\'t went and we should discuss about it.')) {
      expect(d.signature.split(':')).toHaveLength(2);
    }
  });
});
