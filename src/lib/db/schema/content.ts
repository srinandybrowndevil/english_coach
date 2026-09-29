import {
  pgTable, uuid, text, integer, jsonb, timestamp, index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { learningSessions } from './sessions';
import { tutorMemoryKind } from './enums';

// generic exercise catalogue — kind/domain-specific payload in jsonb
// generic curated-content store for categories without a dedicated table
// (tongue twisters, pronunciation sounds, IPA progression, listening/writing
// templates, debate/presentation topics, modern English, register sets, recovery
// phrases, precision maps — seeded by src/content/)
export const contentItems = pgTable(
  'content_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    contentKind: text('content_kind').notNull(),
    title: text('title').notNull(),
    difficulty: integer('difficulty'),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('content_items_kind_idx').on(t.contentKind)],
);

export const exerciseDefinitions = pgTable('exercise_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').notNull(),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  difficulty: integer('difficulty').notNull().default(1),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exerciseAttempts = pgTable(
  'exercise_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exerciseDefinitions.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => learningSessions.id, { onDelete: 'set null' }),
    payload: jsonb('payload'),
    score: jsonb('score'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('exercise_attempts_learner_idx').on(t.learnerId),
    index('exercise_attempts_exercise_idx').on(t.exerciseId),
  ],
);

// §26 business modules, §27 negotiation personas, §31 real-life scenarios, §30 debate
export const roleplayScenarios = pgTable('roleplay_scenarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  domain: text('domain').notNull(), // business | negotiation | simulator | debate | presentation
  title: text('title').notNull(),
  description: text('description'),
  persona: jsonb('persona'), // §27 AI personas
  difficulty: text('difficulty'),
  opener: text('opener'),
  config: jsonb('config'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const roleplaySessions = pgTable(
  'roleplay_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    scenarioId: uuid('scenario_id')
      .notNull()
      .references(() => roleplayScenarios.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => learningSessions.id, { onDelete: 'set null' }),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    evaluation: jsonb('evaluation'), // §27/§55 separate language + skill scores
  },
  (t) => [
    index('roleplay_sessions_learner_idx').on(t.learnerId),
    index('roleplay_sessions_scenario_idx').on(t.scenarioId),
  ],
);

export const roleplayTurns = pgTable(
  'roleplay_turns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roleplaySessionId: uuid('roleplay_session_id')
      .notNull()
      .references(() => roleplaySessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    content: text('content').notNull(),
    hiddenNote: text('hidden_note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('roleplay_turns_session_idx').on(t.roleplaySessionId)],
);

// §25 writing workflow
export const writingSubmissions = pgTable(
  'writing_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(),
    prompt: text('prompt'),
    originalText: text('original_text').notNull(),
    analysis: jsonb('analysis'),
    rewriteText: text('rewrite_text'),
    scores: jsonb('scores'), // §54 component scores
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('writing_submissions_learner_idx').on(t.learnerId)],
);

export const readingAttempts = pgTable(
  'reading_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    material: jsonb('material').notNull(),
    responses: jsonb('responses'),
    score: jsonb('score'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('reading_attempts_learner_idx').on(t.learnerId)],
);

export const listeningAttempts = pgTable(
  'listening_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    mode: text('mode').notNull(),
    material: jsonb('material').notNull(),
    responses: jsonb('responses'),
    score: jsonb('score'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('listening_attempts_learner_idx').on(t.learnerId)],
);

// §36 journal
export const journalEntries = pgTable(
  'journal_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content'),
    audioPath: text('audio_path'),
    prompt: text('prompt'),
    analysis: jsonb('analysis'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('journal_entries_learner_idx').on(t.learnerId)],
);

// §43 memory kinds; embedding table deferred (no pgvector in PGlite)
export const tutorMemories = pgTable(
  'tutor_memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: tutorMemoryKind('kind').notNull(),
    content: jsonb('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tutor_memories_learner_kind_idx').on(t.learnerId, t.kind)],
);
