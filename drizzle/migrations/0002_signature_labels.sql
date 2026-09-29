ALTER TABLE "mistake_patterns" ADD COLUMN "label" text;--> statement-breakpoint
-- Canonical signature form is `${domain}:${rule}` (Phase 5). Duplicate legacy rows
-- (same learner + normalised signature) are merged by `pnpm db:repair-signatures`,
-- an idempotent script — the rewrite needs the canonical rule registry, which is
-- TS, not SQL.