import {
  pgTable, uuid, text, integer, real, jsonb, timestamp, index, boolean,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const learningSessions = pgTable(
  'learning_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionType: text('session_type').notNull(),
    tutorMode: text('tutor_mode'),
    correctionMode: text('correction_mode'),
    sessionGoal: text('session_goal'),
    planItemId: uuid('plan_item_id'),
    difficulty: integer('difficulty'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    durationSeconds: integer('duration_seconds'),
    overallSummary: jsonb('overall_summary'), // §79 SessionSummary
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('learning_sessions_learner_idx').on(t.learnerId)],
);

export const sessionTurns = pgTable(
  'session_turns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => learningSessions.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // learner | tutor | system
    content: text('content').notNull(),
    audioPath: text('audio_path'),
    words: jsonb('words'), // word timings for learner turns
    metrics: jsonb('metrics'), // §49 SpeechMetrics snapshot
    evaluation: jsonb('evaluation'), // {evaluation, scores} from §50 evaluator
    evaluationStatus: text('evaluation_status').notNull().default('pending'), // pending | done | failed | none
    hiddenNote: text('hidden_note'), // AI counterpart private note — never client-visible pre-end
    keepAudio: boolean('keep_audio').default(false), // §70 retention override
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('session_turns_session_idx').on(t.sessionId)],
);

export const speechSegments = pgTable(
  'speech_segments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => learningSessions.id, { onDelete: 'cascade' }),
    turnId: uuid('turn_id').references(() => sessionTurns.id, { onDelete: 'cascade' }),
    transcript: text('transcript').notNull(),
    startedMs: integer('started_ms'),
    endedMs: integer('ended_ms'),
    words: jsonb('words'), // word timings from whisper-1
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('speech_segments_session_idx').on(t.sessionId),
    index('speech_segments_turn_idx').on(t.turnId),
  ],
);

// spec §64 — observable speaking metrics (§49)
export const speechMetrics = pgTable(
  'speech_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => learningSessions.id, { onDelete: 'cascade' }),
    turnId: uuid('turn_id').references(() => sessionTurns.id, { onDelete: 'cascade' }),
    duration: real('duration'),
    wordCount: integer('word_count'),
    wordsPerMinute: real('words_per_minute'),
    responseLatency: real('response_latency'),
    pauseCount: integer('pause_count'),
    averagePause: real('average_pause'),
    longPauseCount: integer('long_pause_count'),
    fillerCount: integer('filler_count'),
    repetitionCount: integer('repetition_count'),
    selfCorrectionCount: integer('self_correction_count'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('speech_metrics_session_idx').on(t.sessionId)],
);

export const pronunciationAttempts = pgTable(
  'pronunciation_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id').references(() => learningSessions.id, { onDelete: 'set null' }),
    target: text('target').notNull(),
    transcript: text('transcript'),
    audioPath: text('audio_path'),
    confidence: text('confidence'), // low | medium | high — spec §52, no fabricated phoneme scores
    notes: jsonb('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('pronunciation_attempts_learner_idx').on(t.learnerId)],
);

// spec §52 — per-dimension scores, only where technical evidence exists
export const pronunciationMetrics = pgTable(
  'pronunciation_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => pronunciationAttempts.id, { onDelete: 'cascade' }),
    dimension: text('dimension').notNull(),
    score: real('score'),
    evidence: jsonb('evidence'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('pronunciation_metrics_attempt_idx').on(t.attemptId)],
);
