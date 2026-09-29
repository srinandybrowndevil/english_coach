// spec §37/§39 adaptive daily planning.
export type Candidate = {
  id: string;
  domain: string;
  kind: 'review' | 'lesson' | 'drill' | 'conversation' | 'scenario';
  estMinutes: number;
  weakness: number; // 0–1
  importance: number; // 0–1
  recurrence: number;
  reviewDueHours: number; // negative = overdue
  goalRelevance: number; // 0–1
  hoursSinceLastPractised: number;
  prerequisitesReady: boolean;
};

export type PlannedItem = Candidate & { priority: number };
export type DailyPlan = {
  items: PlannedItem[];
  totalMinutes: number;
  allocation: Record<string, number>;
};

export function computePriority(c: Candidate): number {
  if (!c.prerequisitesReady) return 0;
  const weaknessWeight = 0.2 + 0.8 * c.weakness;
  const recurrenceFactor = 1 + Math.min(c.recurrence, 10) / 5;
  let reviewDueFactor = 1;
  if (c.reviewDueHours < 0) reviewDueFactor = 1.5 + Math.min(-c.reviewDueHours, 72) / 72;
  else if (c.reviewDueHours <= 24) reviewDueFactor = 1.2;
  const goalRelevance = 0.3 + 0.7 * c.goalRelevance;
  const neglectFactor = 1 + Math.min(c.hoursSinceLastPractised, 168) / 168;
  return (
    weaknessWeight * c.importance * recurrenceFactor * reviewDueFactor * goalRelevance * neglectFactor
  );
}

const DOMAIN_CAP = 0.4;
const REVIEW_CAP = 0.25;

export function buildDailyPlan(input: {
  minutes: number;
  candidates: Candidate[];
}): DailyPlan {
  const { minutes } = input;
  const domainCap = minutes * DOMAIN_CAP;
  const reviewCap = minutes * REVIEW_CAP;

  const sorted = [...input.candidates]
    .map((c) => ({ ...c, priority: computePriority(c) }))
    .filter((c) => c.priority > 0 && c.estMinutes > 0)
    .sort((a, b) => b.priority - a.priority);

  const items: PlannedItem[] = [];
  const allocation: Record<string, number> = {};
  let total = 0;
  let reviewTotal = 0;

  const room = (c: PlannedItem) => {
    const domainRoom = domainCap - (allocation[c.domain] ?? 0);
    const reviewRoom = c.kind === 'review' ? reviewCap - reviewTotal : Infinity;
    return Math.min(domainRoom, reviewRoom, c.estMinutes);
  };

  // reviews get first pick (up to 25% of the session)
  for (const c of sorted) {
    if (c.kind !== 'review') continue;
    const take = room(c);
    if (take >= c.estMinutes) {
      items.push(c);
      total += take;
      reviewTotal += take;
      allocation[c.domain] = (allocation[c.domain] ?? 0) + take;
    }
  }

  // one conversation item first when the session is long enough
  if (minutes >= 15) {
    const conv = sorted.find((c) => c.kind === 'conversation' && !items.includes(c));
    if (conv && room(conv) >= conv.estMinutes) {
      items.push(conv);
      total += conv.estMinutes;
      allocation[conv.domain] = (allocation[conv.domain] ?? 0) + conv.estMinutes;
    }
  }

  for (const c of sorted) {
    if (items.includes(c)) continue;
    const take = room(c);
    if (take >= c.estMinutes && total + take <= minutes) {
      items.push(c);
      total += take;
      if (c.kind === 'review') reviewTotal += take;
      allocation[c.domain] = (allocation[c.domain] ?? 0) + take;
    }
  }

  return { items, totalMinutes: total, allocation };
}
