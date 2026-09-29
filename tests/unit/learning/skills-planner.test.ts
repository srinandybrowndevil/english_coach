import { describe, expect, it } from 'vitest';
import { newSkillState, prerequisitesReady, updateSkillState } from '@/lib/learning/skills';
import { buildDailyPlan, computePriority, type Candidate } from '@/lib/learning/planner';

const at = (d: number) => new Date(d * 86_400_000);

describe('updateSkillState', () => {
  it('first attempt → learning', () => {
    const s = updateSkillState(newSkillState(), { correct: true, at: at(0) });
    expect(s.status).toBe('learning');
    expect(s.attemptCount).toBe(1);
    expect(s.masteryScore).toBeCloseTo(20);
  });

  it('progresses practising → stable → mastered with sustained success', () => {
    let s = newSkillState();
    for (let i = 1; i <= 12; i++) s = updateSkillState(s, { correct: true, at: at(i) });
    expect(s.status).toBe('mastered');
    expect(s.confidenceScore).toBe(1);
  });

  it('mastered skill that decays below 70 becomes relapsed', () => {
    let s = newSkillState();
    for (let i = 1; i <= 12; i++) s = updateSkillState(s, { correct: true, at: at(i) });
    expect(s.status).toBe('mastered');
    // EMA decay: each failure pulls mastery toward 0 by 20%
    for (let i = 13; i <= 16 && s.status === 'mastered'; i++)
      s = updateSkillState(s, { correct: false, at: at(i) });
    expect(s.status).toBe('relapsed');
  });
});

describe('prerequisitesReady', () => {
  const defs = [{ id: 'b', prerequisites: ['a'] }];
  it('true when all prereqs >= 60', () => {
    expect(prerequisitesReady('b', defs, { a: { ...newSkillState(), masteryScore: 65 } })).toBe(true);
    expect(prerequisitesReady('b', defs, { a: { ...newSkillState(), masteryScore: 59 } })).toBe(false);
    expect(prerequisitesReady('x', defs, {})).toBe(true); // unknown skill has no prereqs
  });
});

const cand = (over: Partial<Candidate>): Candidate => ({
  id: Math.random().toString(36).slice(2), domain: 'x', kind: 'lesson', estMinutes: 5,
  weakness: 0.5, importance: 0.8, recurrence: 0, reviewDueHours: 100,
  goalRelevance: 0.5, hoursSinceLastPractised: 10, prerequisitesReady: true, ...over,
});

describe('computePriority', () => {
  it('zero when prerequisites unmet', () => {
    expect(computePriority(cand({ prerequisitesReady: false }))).toBe(0);
  });
  it('overdue reviews outrank fresh items; neglect boosts', () => {
    const due = computePriority(cand({ reviewDueHours: -48 }));
    const notDue = computePriority(cand({ reviewDueHours: 100 }));
    expect(due).toBeGreaterThan(notDue);
    expect(computePriority(cand({ hoursSinceLastPractised: 160 }))).toBeGreaterThan(
      computePriority(cand({ hoursSinceLastPractised: 1 })),
    );
  });
});

describe('buildDailyPlan', () => {
  it('balances domains: hot domain capped at 40% of 45 min', () => {
    const hot = Array.from({ length: 10 }, (_, i) =>
      cand({ id: `hot${i}`, domain: 'grammar', weakness: 1.0, importance: 1, goalRelevance: 1, reviewDueHours: -10, recurrence: 5 }),
    );
    const others = ['speaking', 'vocabulary', 'listening'].flatMap((d) =>
      Array.from({ length: 5 }, (_, i) => cand({ id: `${d}${i}`, domain: d, weakness: 0.3 })),
    );
    const plan = buildDailyPlan({ minutes: 45, candidates: [...hot, ...others] });
    expect(Object.keys(plan.allocation).length).toBeGreaterThanOrEqual(3);
    expect(plan.allocation['grammar']).toBeLessThanOrEqual(18);
    expect(plan.totalMinutes).toBeLessThanOrEqual(45);
  });

  it('includes a conversation item first when minutes >= 15', () => {
    const plan = buildDailyPlan({
      minutes: 45,
      candidates: [cand({ kind: 'conversation', domain: 'speaking', weakness: 0.1 })],
    });
    expect(plan.items[0]!.kind).toBe('conversation');
  });
});
