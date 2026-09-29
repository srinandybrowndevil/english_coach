import { describe, expect, it } from 'vitest';
import { updateVocabularyState } from '@/lib/learning/vocabulary-state';

import type { VocabState } from '@/lib/learning/vocabulary-state';

const fresh = (): VocabState => ({
  status: 'new', recognitionScore: 0, recallScore: 0, usageScore: 0, successfulContextUses: 0,
});
const d = (iso: string) => new Date(iso);

describe('updateVocabularyState (§18/§40 mastery gate)', () => {
  it('recall alone never masters', () => {
    let s = fresh();
    for (let i = 0; i < 6; i++) s = updateVocabularyState(s, 'recalled', d(`2026-01-0${i + 1}`), []);
    expect(s.status).not.toBe('mastered');
    expect(s.recallScore).toBe(100);
  });
  it('usage passes on 3 distinct dates + recall ≥60 → mastered', () => {
    let s = fresh();
    for (let i = 0; i < 3; i++) s = updateVocabularyState(s, 'recalled', d(`2026-01-0${i + 1}`), []);
    s = updateVocabularyState(s, 'used_in_context', d('2026-01-05'), ['2026-01-01', '2026-01-02']);
    expect(s.status).toBe('mastered');
  });
  it('three usage passes the SAME day do not master', () => {
    let s = fresh();
    s = updateVocabularyState(s, 'recalled', d('2026-01-01'), []);
    s = updateVocabularyState(s, 'recalled', d('2026-01-01'), []);
    s = updateVocabularyState(s, 'recalled', d('2026-01-01'), []);
    s = updateVocabularyState(s, 'recalled', d('2026-01-01'), []);
    for (let i = 0; i < 3; i++) s = updateVocabularyState(s, 'used_in_context', d('2026-01-02'), []);
    expect(s.status).not.toBe('mastered');
  });
  it('failed review relapses a mastered word', () => {
    const s = updateVocabularyState(
      { status: 'mastered', recognitionScore: 80, recallScore: 80, usageScore: 80, successfulContextUses: 3 },
      'failed', d('2026-01-01'), ['2026-01-01', '2026-01-02', '2026-01-03'],
    );
    expect(s.status).toBe('active');
  });
});
