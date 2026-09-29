import { describe, expect, it } from 'vitest';
import { wordDiff } from '@/lib/pronunciation/word-diff';

describe('wordDiff', () => {
  it('perfect match', () => {
    const d = wordDiff('she sells sea shells', 'She sells sea shells.');
    expect(d.accuracy).toBe(1);
  });
  it('dropped word', () => {
    const d = wordDiff('she sells sea shells', 'she sells shells');
    expect(d.skipped).toContain('sea');
    expect(d.accuracy).toBe(3 / 4);
  });
  it('extra word', () => {
    const d = wordDiff('she sells', 'she really sells');
    expect(d.extra).toContain('really');
    expect(d.matched).toBe(2);
  });
  it('substituted word', () => {
    const d = wordDiff('thin thread', 'sin thread');
    expect(d.substituted).toContainEqual({ expected: 'thin', heard: 'sin' });
  });
  it('case/punctuation-insensitive', () => {
    const d = wordDiff('I think, therefore.', 'i think therefore');
    expect(d.accuracy).toBe(1);
  });
  it('empty heard → all skipped', () => {
    const d = wordDiff('a b c', '');
    expect(d.skipped).toEqual(['a', 'b', 'c']);
    expect(d.accuracy).toBe(0);
  });
});
