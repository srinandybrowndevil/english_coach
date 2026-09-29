import {
  pgTable, uuid, text, integer, boolean, date, jsonb, timestamp, index, uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

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
    plan: jsonb('plan').notNull(), // ordered skill ids + objectives
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
    factors: jsonb('factors'), // §37 generation factors snapshot
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
    domain: text('domain').notNull(),
    description: text('description').notNull(),
    minutes: integer('minutes').notNull().default(5),
    status: text('status').notNull().default('pending'), // pending | done | skipped
    position: integer('position').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => [index('daily_plan_items_plan_idx').on(t.dailyPlanId)],
);
