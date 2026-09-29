import { describe, expect, it } from 'vitest';
import { detectFossilised } from '@/lib/memory/fossilised';
import fixtures from '../../fixtures/transcripts/fossilised.json';

describe('detectFossilised', () => {
  for (const c of fixtures.cases) {
    it(`detects ${c.id}`, () => {
      const sigs = detectFossilised(c.text).map((d) => d.signature);
      for (const expected of c.expected) expect(sigs).toContain(expected);
    });
  }

  it('clean international English yields nothing', () => {
    for (const text of fixtures.clean) {
      expect(detectFossilised(text), text).toHaveLength(0);
    }
  });

  it('reports span + offsets + teaching fields', () => {
    const [d0] = detectFossilised("I didn't went there.");
    expect(d0!.span.toLowerCase()).toContain("didn't went");
    expect(d0!.start).toBe(2);
    expect(d0!.explanation.length).toBeGreaterThan(10);
    expect(d0!.professionalAlternative.length).toBeGreaterThan(0);
  });

  it('one of my friends (plural) is not flagged', () => {
    expect(detectFossilised('One of my friends called.')).toHaveLength(0);
  });
});
