# Voice pipeline (spec §44–45, §75)

## Architecture decision — turn-based, not full-duplex

Chosen: **turn-based voice**. Realtime WebSocket transport is deferred because it
requires provider realtime credentials and an ephemeral-token flow we don't yet
have; the STT/TTS provider interfaces keep it pluggable (see `src/lib/ai/types.ts`).

Pipeline per learner turn:

1. **Record** — browser `MediaRecorder`. MIME picked by first
   `MediaRecorder.isTypeSupported` match: `audio/webm;codecs=opus` → `audio/webm`
   → `audio/mp4` (iOS Safari fallback).
2. **Level meter + VAD** — `AnalyserNode` RMS (0–1) drives the meter; optional
   "auto-finish" stops recording after 1.5 s of silence once ≥0.7 s of speech has
   been detected (threshold RMS 0.015).
3. **Upload** — `POST /api/sessions/:id/turn` multipart (`audio` blob or `text`,
   `responseLatencyMs`).
4. **STT** — server-side via `getAI().stt` with word timestamps (whisper-1 on
   OpenAI; mock returns `[mock transcript]`).
5. **Persist first** — the learner turn row is written *before* the tutor runs,
   so the transcript is never lost (§75). Audio bytes are written to
   `AUDIO_STORAGE_DIR/<userId>/<turnId>.<ext>` only when
   `settings.privacy.audioRetention !== 'off'`; `audio_path` is set on the turn.
6. **Tutor** — `TutorService.respond` → structured `TutorTurn` JSON → assistant
   turn saved.
7. **TTS** — client fetches `POST /api/speech/tts`, plays via `<audio>` at
   `playbackSpeed`. Pressing Record stops any playing TTS (interruption model).

## Recorder state machine (`src/hooks/useRecorder.ts`)

`idle → requesting → recording ⇄ paused → stopped → (reset → idle)`
side states: `denied` (permission), `unsupported` (no MediaRecorder/webm+mp4),
`error` (device unplug via `track.onended` or recorder error).
Only one `MediaRecorder` can exist at a time (guarded in `start`).
Pure `recorderReducer` is unit-tested without browser APIs.

## Failure behaviour (§75)

| failure | result |
|---|---|
| mic denied | `denied` state + "Retry permission" action |
| STT fails | `502 {error:'stt_failed'}` → UI offers manual transcript entry (`POST /api/turns/:id/transcript`) |
| tutor fails after learner turn saved | `502 {error:'tutor_failed', learnerTurnId}` → client Retry; recording preserved |
| evaluation fails | turn gets `evaluation_status='failed'`; retry via `POST /api/turns/:id/evaluate` |
| TTS fails | `speak()` resolves `{spoken:false}` → text-only display |
| network drop mid-send | unsent blob/transcript kept in IndexedDB (`usePendingTurn`) → "Send / Discard" on reload |

## Retained audio & privacy

- `audioRetention`: `off` (default) | `7d` | `30d`.
- `GET /api/audio/:turnId` streams the file only to the session owner — the
  private "signed URL" equivalent (§45).
- `SpeechService.purgeExpired(userId, retention)` deletes files past the window
  and nulls `audio_path`.

## TTS cache

In-memory LRU, 50 entries, key `sha256(model|voice|speed|text)`
(`ponytail:` restart loses it — acceptable at single-user scale).

## Rate limits

AI routes share a token bucket: 60 calls/min/user (`src/lib/security/rate-limit.ts`,
single-instance; `ponytail:` noted in code). Magic-link route keeps its own
5/15-min/IP limit from Phase 1.
