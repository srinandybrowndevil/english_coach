CREATE TYPE "public"."assessment_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."cefr_level" AS ENUM('a1', 'a2', 'b1', 'b2', 'c1', 'c2');--> statement-breakpoint
CREATE TYPE "public"."mistake_status" AS ENUM('new', 'recurring', 'improving', 'monitoring', 'mastered', 'relapsed');--> statement-breakpoint
CREATE TYPE "public"."skill_status" AS ENUM('unseen', 'learning', 'practising', 'stable', 'mastered', 'relapsed');--> statement-breakpoint
CREATE TYPE "public"."tutor_memory_kind" AS ENUM('episodic', 'learner', 'curriculum');--> statement-breakpoint
CREATE TABLE "ai_evaluation_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"kind" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"ms" integer,
	"evaluator_version" text,
	"prompt_version_id" uuid,
	"confidence" text,
	"input_evidence" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prompt_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "prompt_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"status" "assessment_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"results" jsonb,
	"estimated_level" "cefr_level",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"prompt" jsonb NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"response" jsonb,
	"score" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_hash_unique" UNIQUE("session_hash")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"content_kind" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" integer,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "exercise_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"session_id" uuid,
	"payload" jsonb,
	"score" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exercise_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_definitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"content" text,
	"audio_path" text,
	"prompt" text,
	"analysis" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listening_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"material" jsonb NOT NULL,
	"responses" jsonb,
	"score" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"material" jsonb NOT NULL,
	"responses" jsonb,
	"score" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roleplay_scenarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"persona" jsonb,
	"difficulty" text,
	"opener" text,
	"config" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roleplay_scenarios_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "roleplay_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"scenario_id" uuid NOT NULL,
	"session_id" uuid,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"evaluation" jsonb
);
--> statement-breakpoint
CREATE TABLE "roleplay_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"roleplay_session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tutor_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"kind" "tutor_memory_kind" NOT NULL,
	"content" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "writing_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"mode" text NOT NULL,
	"prompt" text,
	"original_text" text NOT NULL,
	"analysis" jsonb,
	"rewrite_text" text,
	"scores" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_preferences_learner_id_unique" UNIQUE("learner_id")
);
--> statement-breakpoint
CREATE TABLE "learner_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"name" text,
	"native_language" text DEFAULT 'Tamil' NOT NULL,
	"current_level" "cefr_level",
	"target_level" "cefr_level" DEFAULT 'c1' NOT NULL,
	"preferred_learning_style" text,
	"preferred_explanation_language" text DEFAULT 'en',
	"daily_available_minutes" integer DEFAULT 45 NOT NULL,
	"business_context" text,
	"technical_context" text,
	"conversation_interests" jsonb,
	"weak_skills" jsonb,
	"strong_skills" jsonb,
	"recurring_errors" jsonb,
	"pronunciation_challenges" jsonb,
	"filler_words" jsonb,
	"negotiation_weaknesses" jsonb,
	"presentation_weaknesses" jsonb,
	"writing_patterns" jsonb,
	"listening_weaknesses" jsonb,
	"current_curriculum_position" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learner_profiles_learner_id_unique" UNIQUE("learner_id")
);
--> statement-breakpoint
CREATE TABLE "learning_goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"goal" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"tutor" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"voice" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"learning" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"privacy" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_learner_id_unique" UNIQUE("learner_id")
);
--> statement-breakpoint
CREATE TABLE "curriculum_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"plan" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_plan_id" uuid NOT NULL,
	"domain" text NOT NULL,
	"description" text NOT NULL,
	"minutes" integer DEFAULT 5 NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "daily_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"date" date NOT NULL,
	"target_minutes" integer DEFAULT 45 NOT NULL,
	"factors" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_skill_states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	"mastery_score" real DEFAULT 0 NOT NULL,
	"confidence_score" real DEFAULT 0 NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"last_practised_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"interval_index" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2 NOT NULL,
	"status" "skill_status" DEFAULT 'unseen' NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"domain" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"importance" real DEFAULT 0.5 NOT NULL,
	"cefr_relevance" "cefr_level",
	"exercise_types" jsonb,
	"mastery_threshold" real DEFAULT 0.8 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "skill_definitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "skill_prerequisites" (
	"skill_id" uuid NOT NULL,
	"prerequisite_skill_id" uuid NOT NULL,
	CONSTRAINT "skill_prerequisites_skill_id_prerequisite_skill_id_pk" PRIMARY KEY("skill_id","prerequisite_skill_id")
);
--> statement-breakpoint
CREATE TABLE "learning_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"session_type" text NOT NULL,
	"tutor_mode" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"duration_seconds" integer,
	"overall_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pronunciation_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"session_id" uuid,
	"target" text NOT NULL,
	"transcript" text,
	"audio_path" text,
	"confidence" text,
	"notes" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pronunciation_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"dimension" text NOT NULL,
	"score" real,
	"evidence" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_turns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"audio_path" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speech_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_id" uuid,
	"duration" real,
	"word_count" integer,
	"words_per_minute" real,
	"response_latency" real,
	"pause_count" integer,
	"average_pause" real,
	"long_pause_count" integer,
	"filler_count" integer,
	"repetition_count" integer,
	"self_correction_count" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "speech_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"turn_id" uuid,
	"transcript" text NOT NULL,
	"started_ms" integer,
	"ended_ms" integer,
	"words" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_errors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"session_id" uuid,
	"turn_id" uuid,
	"error_text" text NOT NULL,
	"corrected_text" text,
	"category" text,
	"severity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mistake_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mistake_pattern_id" uuid NOT NULL,
	"session_id" uuid,
	"turn_id" uuid,
	"original_text" text,
	"corrected_text" text,
	"context" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mistake_patterns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"error_signature" text NOT NULL,
	"domain" text NOT NULL,
	"subcategory" text,
	"original_example" text,
	"corrected_example" text,
	"explanation" text,
	"recommended_pattern" text,
	"severity" integer DEFAULT 1 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"occurrence_count" integer DEFAULT 1 NOT NULL,
	"contexts_seen" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"successful_review_count" integer DEFAULT 0 NOT NULL,
	"review_streak" integer DEFAULT 0 NOT NULL,
	"interval_index" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2 NOT NULL,
	"success_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"monitoring_since" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"status" "mistake_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mistake_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mistake_pattern_id" uuid NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"successful" boolean NOT NULL,
	"context" text
);
--> statement-breakpoint
CREATE TABLE "collocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"phrase" text NOT NULL,
	"meaning" text,
	"register" text,
	"example" text,
	"awkward_alternatives" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collocations_slug_unique" UNIQUE("slug"),
	CONSTRAINT "collocations_phrase_unique" UNIQUE("phrase")
);
--> statement-breakpoint
CREATE TABLE "idioms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"phrase" text NOT NULL,
	"meaning" text NOT NULL,
	"natural_context" text,
	"formal_suitability" boolean,
	"casual_suitability" boolean,
	"business_suitability" boolean,
	"example" text,
	"misuse_warning" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "idioms_slug_unique" UNIQUE("slug"),
	CONSTRAINT "idioms_phrase_unique" UNIQUE("phrase")
);
--> statement-breakpoint
CREATE TABLE "learner_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"vocabulary_item_id" uuid NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"recognition_score" real DEFAULT 0 NOT NULL,
	"recall_score" real DEFAULT 0 NOT NULL,
	"usage_score" real DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp with time zone,
	"next_review_at" timestamp with time zone,
	"interval_index" integer DEFAULT 0 NOT NULL,
	"ease_factor" real DEFAULT 2 NOT NULL,
	"successful_context_uses" integer DEFAULT 0 NOT NULL,
	"learner_sentence" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phrasal_verbs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"verb" text NOT NULL,
	"particle" text NOT NULL,
	"meaning" text NOT NULL,
	"example" text,
	"separable" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "phrasal_verbs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"word" text NOT NULL,
	"pronunciation" text,
	"ipa" text,
	"part_of_speech" text,
	"meaning" text NOT NULL,
	"tamil_explanation" text,
	"example_simple" text,
	"example_natural" text,
	"example_business" text,
	"synonyms" jsonb,
	"antonyms" jsonb,
	"collocations" jsonb,
	"word_family" jsonb,
	"register" text,
	"common_mistakes" jsonb,
	"category" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vocabulary_items_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "vocabulary_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_vocabulary_id" uuid NOT NULL,
	"reviewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"result" text NOT NULL,
	"context" text
);
--> statement-breakpoint
CREATE TABLE "monthly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"month" date NOT NULL,
	"report" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"report" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_evaluation_events" ADD CONSTRAINT "ai_evaluation_events_prompt_version_id_prompt_versions_id_fk" FOREIGN KEY ("prompt_version_id") REFERENCES "public"."prompt_versions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_template_id_prompt_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."prompt_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_items" ADD CONSTRAINT "assessment_items_section_id_assessment_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."assessment_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_attempt_id_assessment_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."assessment_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_item_id_assessment_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."assessment_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_sections" ADD CONSTRAINT "assessment_sections_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_exercise_id_exercise_definitions_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercise_attempts" ADD CONSTRAINT "exercise_attempts_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_attempts" ADD CONSTRAINT "listening_attempts_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_attempts" ADD CONSTRAINT "reading_attempts_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_scenario_id_roleplay_scenarios_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."roleplay_scenarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_sessions" ADD CONSTRAINT "roleplay_sessions_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roleplay_turns" ADD CONSTRAINT "roleplay_turns_roleplay_session_id_roleplay_sessions_id_fk" FOREIGN KEY ("roleplay_session_id") REFERENCES "public"."roleplay_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tutor_memories" ADD CONSTRAINT "tutor_memories_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "writing_submissions" ADD CONSTRAINT "writing_submissions_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_preferences" ADD CONSTRAINT "learner_preferences_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_goals" ADD CONSTRAINT "learning_goals_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "curriculum_plans" ADD CONSTRAINT "curriculum_plans_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plan_items" ADD CONSTRAINT "daily_plan_items_daily_plan_id_daily_plans_id_fk" FOREIGN KEY ("daily_plan_id") REFERENCES "public"."daily_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_skill_states" ADD CONSTRAINT "learner_skill_states_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_skill_states" ADD CONSTRAINT "learner_skill_states_skill_id_skill_definitions_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_skill_id_skill_definitions_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_prerequisites" ADD CONSTRAINT "skill_prerequisites_prerequisite_skill_id_skill_definitions_id_fk" FOREIGN KEY ("prerequisite_skill_id") REFERENCES "public"."skill_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_attempts" ADD CONSTRAINT "pronunciation_attempts_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pronunciation_metrics" ADD CONSTRAINT "pronunciation_metrics_attempt_id_pronunciation_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."pronunciation_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_turns" ADD CONSTRAINT "session_turns_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_metrics" ADD CONSTRAINT "speech_metrics_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_metrics" ADD CONSTRAINT "speech_metrics_turn_id_session_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."session_turns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_segments" ADD CONSTRAINT "speech_segments_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "speech_segments" ADD CONSTRAINT "speech_segments_turn_id_session_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."session_turns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_errors" ADD CONSTRAINT "grammar_errors_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_errors" ADD CONSTRAINT "grammar_errors_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_errors" ADD CONSTRAINT "grammar_errors_turn_id_session_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."session_turns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_occurrences" ADD CONSTRAINT "mistake_occurrences_mistake_pattern_id_mistake_patterns_id_fk" FOREIGN KEY ("mistake_pattern_id") REFERENCES "public"."mistake_patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_occurrences" ADD CONSTRAINT "mistake_occurrences_session_id_learning_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."learning_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_occurrences" ADD CONSTRAINT "mistake_occurrences_turn_id_session_turns_id_fk" FOREIGN KEY ("turn_id") REFERENCES "public"."session_turns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_patterns" ADD CONSTRAINT "mistake_patterns_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mistake_reviews" ADD CONSTRAINT "mistake_reviews_mistake_pattern_id_mistake_patterns_id_fk" FOREIGN KEY ("mistake_pattern_id") REFERENCES "public"."mistake_patterns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_vocabulary" ADD CONSTRAINT "learner_vocabulary_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_vocabulary" ADD CONSTRAINT "learner_vocabulary_vocabulary_item_id_vocabulary_items_id_fk" FOREIGN KEY ("vocabulary_item_id") REFERENCES "public"."vocabulary_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_reviews" ADD CONSTRAINT "vocabulary_reviews_learner_vocabulary_id_learner_vocabulary_id_fk" FOREIGN KEY ("learner_vocabulary_id") REFERENCES "public"."learner_vocabulary"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_reports" ADD CONSTRAINT "monthly_reports_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_evaluation_events_created_idx" ON "ai_evaluation_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ai_evaluation_events_prompt_version_idx" ON "ai_evaluation_events" USING btree ("prompt_version_id");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_versions_template_version_uq" ON "prompt_versions" USING btree ("template_id","version");--> statement-breakpoint
CREATE INDEX "prompt_versions_template_idx" ON "prompt_versions" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "assessment_attempts_learner_idx" ON "assessment_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "assessment_items_section_idx" ON "assessment_items" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "assessment_responses_attempt_idx" ON "assessment_responses" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "assessment_responses_item_idx" ON "assessment_responses" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "assessment_sections_assessment_idx" ON "assessment_sections" USING btree ("assessment_id");--> statement-breakpoint
CREATE INDEX "auth_tokens_user_id_idx" ON "auth_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "content_items_kind_idx" ON "content_items" USING btree ("content_kind");--> statement-breakpoint
CREATE INDEX "exercise_attempts_learner_idx" ON "exercise_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "exercise_attempts_exercise_idx" ON "exercise_attempts" USING btree ("exercise_id");--> statement-breakpoint
CREATE INDEX "journal_entries_learner_idx" ON "journal_entries" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "listening_attempts_learner_idx" ON "listening_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "reading_attempts_learner_idx" ON "reading_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "roleplay_sessions_learner_idx" ON "roleplay_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "roleplay_sessions_scenario_idx" ON "roleplay_sessions" USING btree ("scenario_id");--> statement-breakpoint
CREATE INDEX "roleplay_turns_session_idx" ON "roleplay_turns" USING btree ("roleplay_session_id");--> statement-breakpoint
CREATE INDEX "tutor_memories_learner_kind_idx" ON "tutor_memories" USING btree ("learner_id","kind");--> statement-breakpoint
CREATE INDEX "writing_submissions_learner_idx" ON "writing_submissions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "learning_goals_learner_id_idx" ON "learning_goals" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "curriculum_plans_learner_idx" ON "curriculum_plans" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "daily_plan_items_plan_idx" ON "daily_plan_items" USING btree ("daily_plan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_plans_learner_date_uq" ON "daily_plans" USING btree ("learner_id","date");--> statement-breakpoint
CREATE INDEX "daily_plans_learner_idx" ON "daily_plans" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_skill_states_learner_skill_uq" ON "learner_skill_states" USING btree ("learner_id","skill_id");--> statement-breakpoint
CREATE INDEX "learner_skill_states_review_idx" ON "learner_skill_states" USING btree ("learner_id","next_review_at");--> statement-breakpoint
CREATE INDEX "learner_skill_states_skill_idx" ON "learner_skill_states" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "skill_prereq_skill_idx" ON "skill_prerequisites" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "skill_prereq_prerequisite_idx" ON "skill_prerequisites" USING btree ("prerequisite_skill_id");--> statement-breakpoint
CREATE INDEX "learning_sessions_learner_idx" ON "learning_sessions" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "pronunciation_attempts_learner_idx" ON "pronunciation_attempts" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "pronunciation_metrics_attempt_idx" ON "pronunciation_metrics" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "session_turns_session_idx" ON "session_turns" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "speech_metrics_session_idx" ON "speech_metrics" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "speech_segments_session_idx" ON "speech_segments" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "speech_segments_turn_idx" ON "speech_segments" USING btree ("turn_id");--> statement-breakpoint
CREATE INDEX "grammar_errors_learner_idx" ON "grammar_errors" USING btree ("learner_id");--> statement-breakpoint
CREATE INDEX "mistake_occurrences_pattern_idx" ON "mistake_occurrences" USING btree ("mistake_pattern_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mistake_patterns_learner_signature_uq" ON "mistake_patterns" USING btree ("learner_id","error_signature");--> statement-breakpoint
CREATE INDEX "mistake_patterns_review_idx" ON "mistake_patterns" USING btree ("learner_id","next_review_at");--> statement-breakpoint
CREATE INDEX "mistake_reviews_pattern_idx" ON "mistake_reviews" USING btree ("mistake_pattern_id");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_vocabulary_learner_item_uq" ON "learner_vocabulary" USING btree ("learner_id","vocabulary_item_id");--> statement-breakpoint
CREATE INDEX "learner_vocabulary_review_idx" ON "learner_vocabulary" USING btree ("learner_id","next_review_at");--> statement-breakpoint
CREATE INDEX "learner_vocabulary_item_idx" ON "learner_vocabulary" USING btree ("vocabulary_item_id");--> statement-breakpoint
CREATE UNIQUE INDEX "vocabulary_items_word_pos_uq" ON "vocabulary_items" USING btree ("word","part_of_speech");--> statement-breakpoint
CREATE INDEX "vocabulary_reviews_lv_idx" ON "vocabulary_reviews" USING btree ("learner_vocabulary_id");--> statement-breakpoint
CREATE UNIQUE INDEX "monthly_reports_learner_month_uq" ON "monthly_reports" USING btree ("learner_id","month");--> statement-breakpoint
CREATE INDEX "monthly_reports_learner_idx" ON "monthly_reports" USING btree ("learner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "weekly_reports_learner_week_uq" ON "weekly_reports" USING btree ("learner_id","week_start");--> statement-breakpoint
CREATE INDEX "weekly_reports_learner_idx" ON "weekly_reports" USING btree ("learner_id");