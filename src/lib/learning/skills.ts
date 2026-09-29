import { scheduleReview } from './srs';

// spec §38 learner skill state
export type SkillStatus = 'unseen' | 'learning' | 'practising' | 'stable' | 'mastered' | 'relapsed';

export type SkillState = {
  masteryScore: number;
  confidenceScore: number;
  attemptCount: number;
  successCount: number;
  status: SkillStatus;
  lastPractisedAt?: Date;
  nextReviewAt?: Date;
  intervalIndex: number;
  easeFactor: number;
};

export function newSkillState(): SkillState {
  return {
    masteryScore: 0, confidenceScore: 0, attemptCount: 0, successCount: 0,
    status: 'unseen', intervalIndex: 0, easeFactor: 2.0,
  };
}

const EMA_ALPHA = 0.2;
const MASTERY_THRESHOLD_PRACTISING = 40;
const MASTERY_THRESHOLD_STABLE = 70;
const MASTERY_THRESHOLD_MASTERED = 85;
const RELAPSE_BELOW = 70;
const PREREQ_MASTERY = 60;

export function updateSkillState(state: SkillState, ev: { correct: boolean; at: Date }): SkillState {
  const s: SkillState = { ...state };
  const wasMastered = s.status === 'mastered';

  s.masteryScore = s.masteryScore + EMA_ALPHA * ((ev.correct ? 100 : 0) - s.masteryScore);
  s.attemptCount += 1;
  if (ev.correct) s.successCount += 1;
  s.confidenceScore = Math.min(1, s.attemptCount / 10);
  s.lastPractisedAt = ev.at;

  const srs = scheduleReview({ intervalIndex: s.intervalIndex, easeFactor: s.easeFactor }, ev.correct ? 'pass' : 'fail', ev.at);
  s.intervalIndex = srs.intervalIndex;
  s.easeFactor = srs.easeFactor;
  s.nextReviewAt = srs.nextReviewAt;

  if (s.attemptCount === 1) s.status = 'learning';
  if (wasMastered) {
    // mastered holds until mastery decays below the relapse line
    s.status = s.masteryScore < RELAPSE_BELOW ? 'relapsed' : 'mastered';
  } else {
    if (s.masteryScore >= MASTERY_THRESHOLD_PRACTISING) s.status = 'practising';
    if (s.masteryScore >= MASTERY_THRESHOLD_STABLE && s.attemptCount >= 5) s.status = 'stable';
    if (
      s.masteryScore >= MASTERY_THRESHOLD_MASTERED &&
      s.attemptCount >= 8 &&
      s.confidenceScore >= 0.7
    )
      s.status = 'mastered';
  }
  return s;
}

export function prerequisitesReady(
  skillId: string,
  defs: { id: string; prerequisites: string[] }[],
  states: Record<string, SkillState>,
): boolean {
  const def = defs.find((d) => d.id === skillId);
  if (!def) return true;
  return def.prerequisites.every((p) => (states[p]?.masteryScore ?? 0) >= PREREQ_MASTERY);
}
