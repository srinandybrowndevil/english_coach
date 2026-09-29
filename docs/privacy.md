# Privacy

- Single-learner app; nothing is public, indexed, or shared.
- **Audio**: recorded audio is stored under `AUDIO_STORAGE_DIR/<userId>/` only when retention is enabled (`settings.privacy.audioRetention`: `off` (default), `7d`, `30d`, `manual`). Purge runs on session start via `SpeechService.purgeExpired`; `session_turns.keep_audio` opts a turn out of purging.
- **Delete audio**: `POST /api/privacy/delete-audio` removes files and nulls `audio_path`. Scores/metrics stay (they contain no transcript).
- **Delete transcripts**: `POST /api/privacy/delete-transcripts` nulls `session_turns.content`/`words`. Metrics and evaluations remain.
- **Reset**: `POST /api/privacy/reset` deletes every learner-generated row in one transaction (sessions, turns, metrics, mistakes, vocabulary/skill states, plans, assessments, journal, reports, memories, CEFR estimates, AI events). Keeps the user account, settings, and seeded content. All destructive endpoints require `{"confirm":"DELETE"}` + same-origin header.
- **Export**: `GET /api/export` (JSON) and `GET /api/export?entity=…` (CSV). Never includes raw audio.
- Roleplay counterpart `hidden_note` and scenario `hidden_script` are never serialised to the client before `ended_at`.
