// §18/§40 — learner_vocabulary state transitions. Recognition/recall alone can
// never produce `mastered`; mastery requires recall pass AND usage pass on
// ≥3 distinct dates.

export type VocabStatus = 'new' | 'learning' | 'active' | 'mastered';
export type ReviewResult = 'recalled' | 'recognised' | 'used_in_context' | 'failed';

export type VocabState = {
  status: VocabStatus;
  recognitionScore: number;
  recallScore: number;
  usageScore: number;
  successfulContextUses: number;
};

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export function updateVocabularyState(
  state: VocabState,
  result: ReviewResult,
  at: Date,
  usageDates: string[], // distinct ISO dates with a prior usage pass (from vocabulary_reviews)
): VocabState & { masteredNow: boolean } {
  const s: VocabState = { ...state };
  const bump = (v: number, up: boolean) => Math.min(100, Math.max(0, v + (up ? 20 : -25)));

  if (result === 'recalled') {
    s.recallScore = bump(s.recallScore, true);
    if (s.status === 'new') s.status = 'learning';
  } else if (result === 'recognised') {
    s.recognitionScore = bump(s.recognitionScore, true);
    if (s.status === 'new') s.status = 'learning';
  } else if (result === 'used_in_context') {
    s.usageScore = bump(s.usageScore, true);
    s.successfulContextUses += 1;
    if (s.status !== 'mastered') s.status = 'active';
  } else {
    s.recallScore = bump(s.recallScore, false);
    if (s.status === 'mastered') s.status = 'active'; // relapse
  }

  const dates = new Set(usageDates);
  if (result === 'used_in_context') dates.add(dayKey(at));
  // mastery = recall holds up AND the word was used in context on ≥3 distinct days
  const masteredNow =
    s.status !== 'mastered' &&
    dates.size >= 3 &&
    s.recallScore >= 60;
  if (masteredNow) s.status = 'mastered';
  return { ...s, masteredNow };
}
