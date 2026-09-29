import {
  pgTable, uuid, text, integer, real, boolean, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { mistakeStatus } from './enums';
import { learningSessions, sessionTurns } from './sessions';

// raw error log feeding the canonical patterns (spec §41)
export const grammarErrors = pgTable(
  'grammar_errors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => learningSessions.id, { onDelete: 'set null' }),
    turnId: uuid('turn_id').references(() => sessionTurns.id, { onDelete: 'set null' }),
    errorText: text('error_text').notNull(),
    correctedText: text('corrected_text'),
    category: text('category'),
    severity: integer('severity').notNull().default(1), // §51 severity weights 1-3
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('grammar_errors_learner_idx').on(t.learnerId)],
);

// spec §41 + §64
export const mistakePatterns = pgTable(
  'mistake_patterns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    errorSignature: text('error_signature').notNull(),
    label: text('label'),
    domain: text('domain').notNull(),
    subcategory: text('subcategory'),
    originalExample: text('original_example'),
    correctedExample: text('corrected_example'),
    explanation: text('explanation'),
    recommendedPattern: text('recommended_pattern'),
    severity: integer('severity').notNull().default(1),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
    occurrenceCount: integer('occurrence_count').notNull().default(1),
    contextsSeen: jsonb('contexts_seen').$type<string[]>().notNull().default([]),
    successfulReviewCount: integer('successful_review_count').notNull().default(0),
    reviewStreak: integer('review_streak').notNull().default(0),
    intervalIndex: integer('interval_index').notNull().default(0),
    easeFactor: real('ease_factor').notNull().default(2.0),
    successHistory: jsonb('success_history').$type<{ at: string; context: string }[]>().notNull().default([]),
    monitoringSince: timestamp('monitoring_since', { withTimezone: true }),
    nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
    status: mistakeStatus('status').notNull().default('new'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('mistake_patterns_learner_signature_uq').on(t.learnerId, t.errorSignature),
    index('mistake_patterns_review_idx').on(t.learnerId, t.nextReviewAt),
  ],
);

// spec §64
export const mistakeOccurrences = pgTable(
  'mistake_occurrences',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mistakePatternId: uuid('mistake_pattern_id')
      .notNull()
      .references(() => mistakePatterns.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => learningSessions.id, { onDelete: 'set null' }),
    turnId: uuid('turn_id').references(() => sessionTurns.id, { onDelete: 'set null' }),
    originalText: text('original_text'),
    correctedText: text('corrected_text'),
    context: text('context'),
    detectedAt: timestamp('detected_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('mistake_occurrences_pattern_idx').on(t.mistakePatternId)],
);

// spaced review of mistake patterns (§40/§41)
export const mistakeReviews = pgTable(
  'mistake_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    mistakePatternId: uuid('mistake_pattern_id')
      .notNull()
      .references(() => mistakePatterns.id, { onDelete: 'cascade' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
    successful: boolean('successful').notNull(),
    context: text('context'),
  },
  (t) => [index('mistake_reviews_pattern_idx').on(t.mistakePatternId)],
);
