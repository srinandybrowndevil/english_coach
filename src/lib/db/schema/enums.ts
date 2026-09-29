import { pgEnum } from 'drizzle-orm/pg-core';

export const cefrLevel = pgEnum('cefr_level', ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']);

// spec §38
export const skillStatus = pgEnum('skill_status', [
  'unseen',
  'learning',
  'practising',
  'stable',
  'mastered',
  'relapsed',
]);

// spec §41
export const mistakeStatus = pgEnum('mistake_status', [
  'new',
  'recurring',
  'improving',
  'monitoring',
  'mastered',
  'relapsed',
]);

export const assessmentStatus = pgEnum('assessment_status', [
  'in_progress',
  'completed',
  'abandoned',
]);

// spec §43 memory separation
export const tutorMemoryKind = pgEnum('tutor_memory_kind', [
  'episodic',
  'learner',
  'curriculum',
]);
