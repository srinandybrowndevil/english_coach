import { scheduleReview } from '../learning/srs';

// spec §41 — canonical mistake patterns with spaced review and relapse.

export type MistakeStatus = 'new' | 'recurring' | 'improving' | 'monitoring' | 'mastered' | 'relapsed';

export type MistakePatternState = {
  errorSignature: string;
  domain: string;
  subcategory: string;
  severity: number;
  status: MistakeStatus;
  occurrenceCount: number;
  contextsSeen: string[];
  successfulReviewCount: number;
  reviewStreak: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  nextReviewAt: Date | null;
  intervalIndex: number;
  easeFactor: number;
  successHistory: { at: Date; context: string }[];
  monitoringSince?: Date;
};

/** Signature derives from the canonical rule — never the learner's sentence.
 *  Form: `${domain}:${rule}` (kebab). Subcategory is descriptive metadata only —
 *  different spellings of it MUST NOT create separate patterns (E2E-11). */
export function buildSignature(parts: { domain: string; rule: string }): string {
  const kebab = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return [parts.domain, parts.rule].map(kebab).join(':');
}

export function newMistakePattern(input: {
  signature: string;
  domain: string;
  subcategory: string;
  severity: number;
  context: string;
  at: Date;
}): MistakePatternState {
  return {
    errorSignature: input.signature,
    domain: input.domain,
    subcategory: input.subcategory,
    severity: input.severity,
    status: 'new',
    occurrenceCount: 1,
    contextsSeen: [input.context],
    successfulReviewCount: 0,
    reviewStreak: 0,
    firstSeenAt: input.at,
    lastSeenAt: input.at,
    nextReviewAt: scheduleReview({ intervalIndex: 0, easeFactor: 2.0 }, 'hard', input.at).nextReviewAt,
    intervalIndex: 0,
    easeFactor: 2.0,
    successHistory: [],
  };
}

const DAY_MS = 86_400_000;

export function applyOccurrence(
  state: MistakePatternState | null,
  ev: { context: string; at: Date; severity?: number; signature?: string; domain?: string; subcategory?: string },
): MistakePatternState {
  if (!state) {
    if (!ev.signature || !ev.domain || !ev.subcategory) {
      throw new Error('new mistake pattern requires signature, domain and subcategory');
    }
    return newMistakePattern({
      signature: ev.signature, domain: ev.domain, subcategory: ev.subcategory,
      severity: ev.severity ?? 1, context: ev.context, at: ev.at,
    });
  }

  const s: MistakePatternState = {
    ...state,
    contextsSeen: [...state.contextsSeen],
    successHistory: [...state.successHistory],
  };
  s.occurrenceCount += 1;
  s.lastSeenAt = ev.at;
  if (!s.contextsSeen.includes(ev.context)) s.contextsSeen.push(ev.context);

  // status transitions on recurrence — a relapsed pattern must re-earn mastery
  if (s.status === 'new') s.status = 'recurring';
  else if (s.status === 'mastered' || s.status === 'monitoring') s.status = 'relapsed';
  else if (s.status === 'improving') s.status = 'recurring';
  // 'relapsed'/'recurring' stay as-is
  s.reviewStreak = 0;
  s.monitoringSince = undefined;

  // re-enter review at the front of the ladder
  s.intervalIndex = 0;
  s.nextReviewAt = scheduleReview({ intervalIndex: 0, easeFactor: s.easeFactor }, 'hard', ev.at).nextReviewAt;
  return s;
}

const MONITORING_MIN_DAYS = 3;
const MONITORING_MIN_CONTEXTS = 2;
const MONITORING_MIN_STREAK = 3;
const MASTERY_AFTER_MONITORING_DAYS = 7;

export function applyReview(
  state: MistakePatternState,
  ev: { success: boolean; context: string; at: Date },
): MistakePatternState {
  const s: MistakePatternState = {
    ...state,
    contextsSeen: [...state.contextsSeen],
    successHistory: [...state.successHistory],
  };

  if (!ev.success) {
    s.reviewStreak = 0;
    if (s.status === 'mastered' || s.status === 'monitoring') s.status = 'relapsed';
    else s.status = 'recurring';
    s.monitoringSince = undefined;
    const srs = scheduleReview({ intervalIndex: s.intervalIndex, easeFactor: s.easeFactor }, 'fail', ev.at);
    s.intervalIndex = srs.intervalIndex;
    s.easeFactor = srs.easeFactor;
    s.nextReviewAt = srs.nextReviewAt;
    return s;
  }

  s.successfulReviewCount += 1;
  s.reviewStreak += 1;
  s.successHistory.push({ at: ev.at, context: ev.context });
  const srs = scheduleReview({ intervalIndex: s.intervalIndex, easeFactor: s.easeFactor }, 'pass', ev.at);
  s.intervalIndex = srs.intervalIndex;
  s.easeFactor = srs.easeFactor;
  s.nextReviewAt = srs.nextReviewAt;

  const distinctContexts = new Set(s.successHistory.map((h) => h.context)).size;
  const firstSuccess = s.successHistory[0]!.at.getTime();
  const spanDays = (ev.at.getTime() - firstSuccess) / DAY_MS;

  if (s.status === 'monitoring' && s.monitoringSince) {
    if ((ev.at.getTime() - s.monitoringSince.getTime()) / DAY_MS >= MASTERY_AFTER_MONITORING_DAYS) {
      s.status = 'mastered';
      s.monitoringSince = undefined;
    }
  } else if (
    s.reviewStreak >= MONITORING_MIN_STREAK &&
    distinctContexts >= MONITORING_MIN_CONTEXTS &&
    spanDays >= MONITORING_MIN_DAYS
  ) {
    s.status = 'monitoring';
    s.monitoringSince = ev.at;
  } else if (s.status !== 'mastered') {
    s.status = 'improving';
  }
  return s;
}
