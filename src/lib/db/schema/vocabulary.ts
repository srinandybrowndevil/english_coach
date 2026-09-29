import {
  pgTable, uuid, text, integer, real, boolean, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

// spec §18 vocabulary object
export const vocabularyItems = pgTable(
  'vocabulary_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    word: text('word').notNull(),
    pronunciation: text('pronunciation'),
    ipa: text('ipa'),
    partOfSpeech: text('part_of_speech'),
    meaning: text('meaning').notNull(),
    tamilExplanation: text('tamil_explanation'),
    exampleSimple: text('example_simple'),
    exampleNatural: text('example_natural'),
    exampleBusiness: text('example_business'),
    synonyms: jsonb('synonyms'),
    antonyms: jsonb('antonyms'),
    collocations: jsonb('collocations'),
    wordFamily: jsonb('word_family'),
    register: text('register'),
    commonMistakes: jsonb('common_mistakes'),
    category: text('category'), // §18 sections: business, idioms, phrasal-verbs...
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('vocabulary_items_word_pos_uq').on(t.word, t.partOfSpeech)],
);

// spec §64 + SRS (§40)
export const learnerVocabulary = pgTable(
  'learner_vocabulary',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    vocabularyItemId: uuid('vocabulary_item_id')
      .notNull()
      .references(() => vocabularyItems.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('new'), // new | learning | active | mastered
    recognitionScore: real('recognition_score').notNull().default(0),
    recallScore: real('recall_score').notNull().default(0),
    usageScore: real('usage_score').notNull().default(0),
    lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
    nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
    intervalIndex: integer('interval_index').notNull().default(0),
    easeFactor: real('ease_factor').notNull().default(2.0),
    successfulContextUses: integer('successful_context_uses').notNull().default(0),
    learnerSentence: text('learner_sentence'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('learner_vocabulary_learner_item_uq').on(t.learnerId, t.vocabularyItemId),
    index('learner_vocabulary_review_idx').on(t.learnerId, t.nextReviewAt),
    index('learner_vocabulary_item_idx').on(t.vocabularyItemId),
  ],
);

export const vocabularyReviews = pgTable(
  'vocabulary_reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerVocabularyId: uuid('learner_vocabulary_id')
      .notNull()
      .references(() => learnerVocabulary.id, { onDelete: 'cascade' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }).notNull().defaultNow(),
    result: text('result').notNull(), // recalled | recognised | failed | used_in_context
    context: text('context'),
  },
  (t) => [index('vocabulary_reviews_lv_idx').on(t.learnerVocabularyId)],
);

// §21 collocations
export const collocations = pgTable('collocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  phrase: text('phrase').notNull().unique(),
  meaning: text('meaning'),
  register: text('register'),
  example: text('example'),
  awkwardAlternatives: jsonb('awkward_alternatives'), // §21 wrong/near-miss forms for detection
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// §20 idioms
export const idioms = pgTable('idioms', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  phrase: text('phrase').notNull().unique(),
  meaning: text('meaning').notNull(),
  naturalContext: text('natural_context'),
  formalSuitability: boolean('formal_suitability'),
  casualSuitability: boolean('casual_suitability'),
  businessSuitability: boolean('business_suitability'),
  example: text('example'),
  misuseWarning: text('misuse_warning'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// §19 phrasal verbs
export const phrasalVerbs = pgTable('phrasal_verbs', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  verb: text('verb').notNull(),
  particle: text('particle').notNull(),
  meaning: text('meaning').notNull(),
  example: text('example'),
  separable: boolean('separable'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
