ALTER TABLE "session_turns" ADD COLUMN "hidden_note" text;--> statement-breakpoint
ALTER TABLE "session_turns" ADD COLUMN "keep_audio" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "roleplay_turns" ADD COLUMN "hidden_note" text;
--> statement-breakpoint
ALTER TABLE "learning_sessions" ADD COLUMN "plan_item_id" uuid;
