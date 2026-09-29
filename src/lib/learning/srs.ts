// spec §40 spaced repetition ladder.
export const LADDER_DAYS = [0, 1, 3, 7, 14, 30, 60] as const;
const SAME_SESSION_MINUTES = 10;
const MIN_EASE = 1.3;
const MAX_EASE = 2.5;

export type SrsState = { intervalIndex: number; easeFactor: number };
export type SrsOutcome = 'pass' | 'hard' | 'fail';
export type SrsResult = SrsState & { nextReviewAt: Date; intervalDays: number };

export function scheduleReview(state: SrsState, outcome: SrsOutcome, now: Date): SrsResult {
  let { intervalIndex, easeFactor } = state;
  if (outcome === 'pass') {
    intervalIndex += 1;
    easeFactor = Math.min(MAX_EASE, easeFactor + 0.1);
  } else if (outcome === 'hard') {
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
  } else {
    intervalIndex = Math.max(0, intervalIndex - 2);
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  }

  let intervalDays: number;
  if (intervalIndex < LADDER_DAYS.length) {
    intervalDays = LADDER_DAYS[intervalIndex]!;
  } else {
    // past the ladder: stretch by ease factor
    intervalDays = Math.round(LADDER_DAYS[LADDER_DAYS.length - 1]! * easeFactor * (intervalIndex - LADDER_DAYS.length + 1));
  }

  const nextReviewAt =
    intervalIndex === 0
      ? new Date(now.getTime() + SAME_SESSION_MINUTES * 60_000)
      : new Date(now.getTime() + intervalDays * 86_400_000);

  return { intervalIndex, easeFactor, nextReviewAt, intervalDays };
}
