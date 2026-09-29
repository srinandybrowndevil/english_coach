import {
  pgTable, uuid, text, integer, jsonb, timestamp, index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { assessmentStatus, cefrLevel } from './enums';

// spec §58/§59
export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  kind: text('kind').notNull(), // 'initial' | 'monthly'
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentSections = pgTable(
  'assessment_sections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    domain: text('domain').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('assessment_sections_assessment_idx').on(t.assessmentId)],
);

export const assessmentItems = pgTable(
  'assessment_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sectionId: uuid('section_id')
      .notNull()
      .references(() => assessmentSections.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    prompt: jsonb('prompt').notNull(),
    position: integer('position').notNull().default(0),
  },
  (t) => [index('assessment_items_section_idx').on(t.sectionId)],
);

export const assessmentAttempts = pgTable(
  'assessment_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => assessments.id, { onDelete: 'cascade' }),
    status: assessmentStatus('status').notNull().default('in_progress'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    results: jsonb('results'), // CEFR estimate, domain scores, strengths/weaknesses
    estimatedLevel: cefrLevel('estimated_level'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('assessment_attempts_learner_idx').on(t.learnerId)],
);

export const assessmentResponses = pgTable(
  'assessment_responses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: 'cascade' }),
    itemId: uuid('item_id')
      .notNull()
      .references(() => assessmentItems.id, { onDelete: 'cascade' }),
    response: jsonb('response'),
    score: jsonb('score'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('assessment_responses_attempt_idx').on(t.attemptId),
    index('assessment_responses_item_idx').on(t.itemId),
  ],
);
