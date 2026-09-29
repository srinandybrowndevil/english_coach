import {
  pgTable, uuid, text, integer, real, jsonb, timestamp, index, uniqueIndex, primaryKey,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { cefrLevel, skillStatus } from './enums';

// spec §38 skill graph
export const skillDefinitions = pgTable('skill_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  domain: text('domain').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  difficulty: integer('difficulty').notNull().default(1),
  importance: integer('importance').notNull().default(1),
  cefrRelevance: cefrLevel('cefr_relevance'),
  exerciseTypes: jsonb('exercise_types'),
  masteryThreshold: real('mastery_threshold').notNull().default(0.8),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const skillPrerequisites = pgTable(
  'skill_prerequisites',
  {
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skillDefinitions.id, { onDelete: 'cascade' }),
    prerequisiteSkillId: uuid('prerequisite_skill_id')
      .notNull()
      .references(() => skillDefinitions.id, { onDelete: 'cascade' }),
  },
  (t) => [
    primaryKey({ columns: [t.skillId, t.prerequisiteSkillId] }),
    index('skill_prereq_skill_idx').on(t.skillId),
    index('skill_prereq_prerequisite_idx').on(t.prerequisiteSkillId),
  ],
);

// spec §64
export const learnerSkillStates = pgTable(
  'learner_skill_states',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skillDefinitions.id, { onDelete: 'cascade' }),
    masteryScore: real('mastery_score').notNull().default(0),
    confidenceScore: real('confidence_score').notNull().default(0),
    attemptCount: integer('attempt_count').notNull().default(0),
    successCount: integer('success_count').notNull().default(0),
    lastPractisedAt: timestamp('last_practised_at', { withTimezone: true }),
    nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
    status: skillStatus('status').notNull().default('unseen'),
    evidenceCount: integer('evidence_count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('learner_skill_states_learner_skill_uq').on(t.learnerId, t.skillId),
    index('learner_skill_states_review_idx').on(t.learnerId, t.nextReviewAt),
    index('learner_skill_states_skill_idx').on(t.skillId),
  ],
);
