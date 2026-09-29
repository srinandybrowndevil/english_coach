import { pgTable, uuid, date, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

// §61
export const weeklyReports = pgTable(
  'weekly_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    weekStart: date('week_start').notNull(),
    report: jsonb('report').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('weekly_reports_learner_week_uq').on(t.learnerId, t.weekStart),
    index('weekly_reports_learner_idx').on(t.learnerId),
  ],
);

// §62
export const monthlyReports = pgTable(
  'monthly_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    learnerId: uuid('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    month: date('month').notNull(), // first day of month
    report: jsonb('report').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('monthly_reports_learner_month_uq').on(t.learnerId, t.month),
    index('monthly_reports_learner_idx').on(t.learnerId),
  ],
);
