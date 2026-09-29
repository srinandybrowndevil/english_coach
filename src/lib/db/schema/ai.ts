import {
  pgTable, uuid, text, integer, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';

export const promptTemplates = pgTable('prompt_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// §67 — evaluator/prompt versioning for re-evaluation
export const promptVersions = pgTable(
  'prompt_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    templateId: uuid('template_id')
      .notNull()
      .references(() => promptTemplates.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('prompt_versions_template_version_uq').on(t.templateId, t.version),
    index('prompt_versions_template_idx').on(t.templateId),
  ],
);

// §74 usage tracking + §67 evaluator evidence
export const aiEvaluationEvents = pgTable(
  'ai_evaluation_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    provider: text('provider').notNull(),
    model: text('model').notNull(),
    kind: text('kind').notNull(), // complete | stream | structured | stt | tts | pronunciation | embedding
    inputTokens: integer('input_tokens'),
    outputTokens: integer('output_tokens'),
    ms: integer('ms'),
    evaluatorVersion: text('evaluator_version'),
    promptVersionId: uuid('prompt_version_id').references(() => promptVersions.id, {
      onDelete: 'set null',
    }),
    confidence: text('confidence'),
    inputEvidence: jsonb('input_evidence'),
    error: text('error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('ai_evaluation_events_created_idx').on(t.createdAt),
    index('ai_evaluation_events_prompt_version_idx').on(t.promptVersionId),
  ],
);

export type AiEvaluationEventInsert = typeof aiEvaluationEvents.$inferInsert;
