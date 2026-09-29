# Database

PostgreSQL via Drizzle ORM. Local dev uses embedded **PGlite**; hosted Postgres is
used when `DATABASE_URL` is set. Identical migrations for both.

## Driver selection (`src/lib/db/client.ts`)

| `DATABASE_URL` set? | Driver |
|---|---|
| yes | `drizzle-orm/node-postgres` + `pg.Pool` |
| no | `drizzle-orm/pglite` + `new PGlite(PGLITE_DIR)` (default `./.data/pglite`) |

The instance lives on `globalThis` so Next dev HMR cannot open a second PGlite on
the same directory (single-connection — a second open fails).

## Migrations

- Schema lives in `src/lib/db/schema/*.ts` (one file per domain), re-exported via `schema/index.ts`.
- `pnpm db:generate` → SQL into `drizzle/migrations/` (committed).
- `pnpm db:migrate` → `drizzle-kit migrate` (pg driver from `DATABASE_URL`, else PGlite dir).
- In dev the app **self-migrates**: `runMigrations()` runs once lazily inside `getDb()` (idempotent, guarded by a `globalThis` promise).

## Tables by domain (spec §63)

| Domain | Tables |
|---|---|
| auth | `users` · `auth_tokens` (sha256 token hash, 15-min expiry, consumed_at) · `sessions` (sha256 sid, 30-day, last_seen_at) |
| core/learner | `learner_profiles` (§3 profile model) · `learner_preferences` · `learning_goals` · `user_settings` (§70) |
| skills | `skill_definitions` · `skill_prerequisites` · `learner_skill_states` (§38/§64, `skill_status` enum) |
| assessment | `assessments` · `assessment_sections` · `assessment_items` · `assessment_attempts` · `assessment_responses` (§58–59) |
| sessions/speech | `learning_sessions` · `session_turns` · `speech_segments` (word timings) · `speech_metrics` (§49/§64) · `pronunciation_attempts` · `pronunciation_metrics` (§52) |
| mistakes | `grammar_errors` · `mistake_patterns` (UNIQUE `(learner_id, error_signature)`, `mistake_status` enum, §41/§64) · `mistake_occurrences` · `mistake_reviews` |
| vocabulary | `vocabulary_items` (§18 fields) · `learner_vocabulary` (§64 + SRS) · `vocabulary_reviews` · `collocations` · `idioms` · `phrasal_verbs` |
| curriculum | `curriculum_plans` · `daily_plans` · `daily_plan_items` (§37–39) |
| content | `exercise_definitions`/`exercise_attempts` (generic jsonb payloads) · `roleplay_scenarios`/`roleplay_sessions`/`roleplay_turns` (§26/27/31) · `writing_submissions` (§25/54) · `reading_attempts` · `listening_attempts` · `journal_entries` · `tutor_memories` (`kind`: episodic/learner/curriculum, §43) |
| reports | `weekly_reports` · `monthly_reports` (§61–62) |
| ai | `prompt_templates` · `prompt_versions` · `ai_evaluation_events` (usage + evaluator evidence, §67/§74) |

Conventions: `uuid` PK `defaultRandom()`; `created_at`/`updated_at` timestamptz;
FK indexes everywhere; `(learner_id, next_review_at)` indexes on all SRS tables;
CEFR `a1`–`c2` pg enum (§57).

## Deferred: memory embeddings

`memory_embeddings` is intentionally **not** implemented — PGlite has no pgvector
by default. `tutor_memories` (kind enum + jsonb content) covers the §43 memory
kinds; add the embedding table when running on hosted Postgres with pgvector.

## Migration rule

Append-only migrations. Always regenerate the snapshot after changing schema files:
`pnpm db:generate` must produce no diff when the schema is already migrated — if it
proposes changes, generate the migration (never edit the snapshot by hand). The chain
0000→0004 must apply cleanly on a fresh PGlite; integration tests enforce this.
