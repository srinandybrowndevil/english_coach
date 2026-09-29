import {
  pgTable, uuid, text, integer, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { assessmentStatus } from './enums';

// spec §58/§59 — a per-learner assessment run (initial or monthly)
export const assessments = pgTable(
  'assessments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(), // 'initial' | 'monthly'
    status: assessmentStatus('status').notNull().default('in_progress'),
    currentSectionIndex: integer('current_section_index').notNull().default(0),
    monthIndex: integer('month_index').notNull().default(0), // variant rotation seed (§59)
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    result: jsonb('result'), // §58 output list, populated at finish
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('assessments_learner_idx').on(t.learnerId)],
);

// item bank lives in src/content/assessment.ts; responses keyed by item slug
export const assessmentResponses = pgTable(
  'assessment_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    itemSlug: text('item_slug').notNull(),
    section: text('section').notNull(),
    response: jsonb('response'), // { text } | { turnId } | { selected }
    grade: jsonb('grade'),
    gradedAt: timestamp('graded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('assessment_responses_item_uq').on(t.assessmentId, t.itemSlug),
    index('assessment_responses_assessment_idx').on(t.assessmentId),
  ],
);
