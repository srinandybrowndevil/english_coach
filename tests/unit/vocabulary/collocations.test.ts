import { describe, expect, it } from 'vitest';
import { detectAwkwardCollocations } from '@/lib/vocabulary/collocations';

const seed = [
  { phrase: 'make a decision', awkwardAlternatives: ['take a decision', 'do a decision'], note: null },
  { phrase: 'strong coffee', awkwardAlternatives: ['powerful coffee'], note: null },
];

describe('detectAwkwardCollocations (§21)', () => {
  it('flags seeded awkward forms with the natural alternative', () => {
    const notes = detectAwkwardCollocations('We need to take a decision today.', seed);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toMatchObject({ quote: 'take a decision', natural: 'make a decision', kind: 'unnatural' });
  });
  it('clean text → no notes', () => {
    expect(detectAwkwardCollocations('We need to make a decision today.', seed)).toHaveLength(0);
  });
  it('does not flag substrings inside other words', () => {
    expect(detectAwkwardCollocations('He drank powerful coffee flavoured syrup.', seed)).toHaveLength(1);
    expect(detectAwkwardCollocations('take a decisionmaking approach', seed)).toHaveLength(0);
  });
});
