ALTER TABLE "assessment_attempts" DROP CONSTRAINT "assessment_attempts_learner_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_attempts" DROP CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_items" DROP CONSTRAINT "assessment_items_section_id_assessment_sections_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_responses" DROP CONSTRAINT "assessment_responses_attempt_id_assessment_attempts_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_responses" DROP CONSTRAINT "assessment_responses_item_id_assessment_items_id_fk";--> statement-breakpoint
ALTER TABLE "assessment_sections" DROP CONSTRAINT "assessment_sections_assessment_id_assessments_id_fk";--> statement-breakpoint
DROP TABLE "assessment_attempts";--> statement-breakpoint
DROP TABLE "assessment_items";--> statement-breakpoint
DROP TABLE "assessment_responses";--> statement-breakpoint
DROP TABLE "assessment_sections";--> statement-breakpoint
DROP TABLE "assessments";--> statement-breakpoint
DROP TABLE "daily_plan_items";--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"status" "assessment_status" DEFAULT 'in_progress' NOT NULL,
	"current_section_index" integer DEFAULT 0 NOT NULL,
	"month_index" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"item_slug" text NOT NULL,
	"section" text NOT NULL,
	"response" jsonb,
	"grade" jsonb,
	"graded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cefr_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"level" "cefr_level",
	"confidence" text DEFAULT 'low' NOT NULL,
	"breakdown" jsonb,
	"gate" text,
	"source" text DEFAULT 'initial_assessment' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_plan_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"kind" text NOT NULL,
	"domain" text NOT NULL,
	"module_route" text,
	"title" text NOT NULL,
	"est_minutes" integer DEFAULT 5 NOT NULL,
	"payload" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cefr_estimates" ADD CONSTRAINT "cefr_estimates_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plan_items" ADD CONSTRAINT "daily_plan_items_daily_plan_id_daily_plans_id_fk" FOREIGN KEY ("daily_plan_id") REFERENCES "public"."daily_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assessments_learner_idx" ON "assessments" ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_responses_item_uq" ON "assessment_responses" ("assessment_id","item_slug");--> statement-breakpoint
CREATE INDEX "assessment_responses_assessment_idx" ON "assessment_responses" ("assessment_id");--> statement-breakpoint
CREATE INDEX "cefr_estimates_learner_created_idx" ON "cefr_estimates" ("learner_id","created_at");--> statement-breakpoint
CREATE INDEX "daily_plan_items_plan_idx" ON "daily_plan_items" ("daily_plan_id");--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "learning_goals" jsonb;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "active_vocabulary" jsonb;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "passive_vocabulary" jsonb;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "mastered_vocabulary" jsonb;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "skill_mastery_map" jsonb;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD COLUMN "onboarding_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD COLUMN "status" text DEFAULT 'active' NOT NULL;