import {
  pgTable, uuid, text, integer, boolean, date, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';
import { cefrLevel } from './enums';

// §38 curriculum plan derived from the skill graph
export const curriculumPlans = pgTable(
  'curriculum_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    active: boolean('active').notNull().default(true),
    plan: jsonb('plan').notNull(), // { orderedSkillSlugs: string[], currentPosition }
  },
  (t) => [index('curriculum_plans_learner_idx').on(t.learnerId)],
);

// §37 daily training engine
export const dailyPlans = pgTable(
  'daily_plans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    targetMinutes: integer('target_minutes').notNull().default(45),
    status: text('status').notNull().default('active'), // active | done | abandoned
    factors: jsonb('factors'), // §37 generation factors snapshot (generated_from)
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('daily_plans_learner_date_uq').on(t.learnerId, t.date),
    index('daily_plans_learner_idx').on(t.learnerId),
  ],
);

export const dailyPlanItems = pgTable(
  'daily_plan_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    dailyPlanId: uuid('daily_plan_id')
      .notNull()
      .references(() => dailyPlans.id, { onDelete: 'cascade' }),
    position: integer('position').notNull().default(0),
    kind: text('kind').notNull(), // review | lesson | drill | conversation | scenario
    domain: text('domain').notNull(),
    moduleRoute: text('module_route'), // e.g. /tutor?plan=, /grammar/<slug>
    title: text('title').notNull(),
    estMinutes: integer('est_minutes').notNull().default(5),
    payload: jsonb('payload'), // { skillSlug?, patternId?, vocabIds? }
    status: text('status').notNull().default('pending'), // pending | in_progress | done | skipped
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [index('daily_plan_items_plan_idx').on(t.dailyPlanId)],
);

// §57 CEFR estimate history (authoritative deterministic gate + LLM domain judgement)
export const cefrEstimates = pgTable(
  'cefr_estimates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    level: cefrLevel('level'),
    confidence: text('confidence').notNull().default('low'),
    breakdown: jsonb('breakdown'), // per-domain {level, score, evidenceCount}
    gate: text('gate'),
    source: text('source').notNull().default('initial_assessment'), // initial_assessment | monthly_assessment | rolling
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('cefr_estimates_learner_created_idx').on(t.learnerId, t.createdAt)],
);
