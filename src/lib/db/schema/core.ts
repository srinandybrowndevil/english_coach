import { pgTable, uuid, text, integer, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { cefrLevel } from './enums';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

// spec §3 learner model
export const learnerProfiles = pgTable('learner_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerId: uuid('learner_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name'),
  nativeLanguage: text('native_language').notNull().default('Tamil'),
  currentLevel: cefrLevel('current_level'),
  targetLevel: cefrLevel('target_level').notNull().default('c1'),
  preferredLearningStyle: text('preferred_learning_style'),
  preferredExplanationLanguage: text('preferred_explanation_language').default('en'),
  dailyAvailableMinutes: integer('daily_available_minutes').notNull().default(45),
  businessContext: text('business_context'),
  technicalContext: text('technical_context'),
  conversationInterests: jsonb('conversation_interests'),
  weakSkills: jsonb('weak_skills'),
  strongSkills: jsonb('strong_skills'),
  recurringErrors: jsonb('recurring_errors'),
  pronunciationChallenges: jsonb('pronunciation_challenges'),
  fillerWords: jsonb('filler_words'),
  negotiationWeaknesses: jsonb('negotiation_weaknesses'),
  presentationWeaknesses: jsonb('presentation_weaknesses'),
  writingPatterns: jsonb('writing_patterns'),
  listeningWeaknesses: jsonb('listening_weaknesses'),
  learningGoals: jsonb('learning_goals'), // jsonb copy of chosen goals for §3 model
  activeVocabulary: jsonb('active_vocabulary'),
  passiveVocabulary: jsonb('passive_vocabulary'),
  masteredVocabulary: jsonb('mastered_vocabulary'),
  skillMasteryMap: jsonb('skill_mastery_map'),
  currentCurriculumPosition: jsonb('current_curriculum_position'),
  onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
  ...timestamps,
});

export const learnerPreferences = pgTable('learner_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerId: uuid('learner_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  data: jsonb('data').notNull().default({}),
  ...timestamps,
});

export const learningGoals = pgTable(
  'learning_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    goal: text('goal').notNull(),
    priority: integer('priority').notNull().default(0),
    active: boolean('active').notNull().default(true),
    ...timestamps,
  },
  (t) => [index('learning_goals_learner_id_idx').on(t.learnerId)],
);

// spec §70 — tutor / voice / learning / privacy settings kept as jsonb groups
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  learnerId: uuid('learner_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  tutor: jsonb('tutor').notNull().default({}),
  voice: jsonb('voice').notNull().default({}),
  learning: jsonb('learning').notNull().default({}),
  privacy: jsonb('privacy').notNull().default({}),
  ...timestamps,
});
