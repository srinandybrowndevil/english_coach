# Deployment

Target: Vercel + hosted Postgres (e.g. Supabase/Neon). Set `DATABASE_URL` to switch off PGlite; run `pnpm db:migrate` (drizzle-kit migrate) at deploy time; migrations 0000→0004 must apply in order (snapshot-of-record: `meta/0004_snapshot.json`).

Env vars: `DATABASE_URL`, `AUTH_SECRET`, `ALLOWED_EMAIL`, `APP_URL`, `RESEND_API_KEY`/`RESEND_FROM` (magic link email), `OPENAI_API_KEY` (optional — mock provider otherwise), `TTS_VOICE`.

Known gap: `SpeechService.persistAudio` writes to local filesystem (`AUDIO_STORAGE_DIR`) — ephemeral on serverless. Production needs an object-storage implementation of the same interface (e.g. Supabase Storage with signed URLs); not implemented — flagged as the single deployment blocker for voice features.
