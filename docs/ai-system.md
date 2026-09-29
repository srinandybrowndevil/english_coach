# AI System

Provider abstraction (spec §5/Appendix A). Core logic never touches OpenAI
directly — everything goes through `src/lib/ai/types.ts`:

`LLMProvider` · `SpeechToTextProvider` · `TextToSpeechProvider` ·
`PronunciationAnalysisProvider` · `EmbeddingProvider`

`getAI()` (`src/lib/ai/index.ts`) returns a singleton `{ llm, stt, tts, pronunciation, embeddings }`.
`isMockAI()` is true when `OPENAI_API_KEY` is absent → deterministic mock providers.

## Model tiers (env-overridable)

| Tier | Env | Default | Use |
|---|---|---|---|
| frontier | `AI_MODEL_FRONTIER` | `gpt-6-astra` | tutoring, complex evaluation |
| balanced | `AI_MODEL_BALANCED` | `gpt-6.1-sol` | most evaluator calls |
| fast | `AI_MODEL_FAST` | `gpt-6-luna` | cheap evaluators |
| STT | `STT_MODEL` | `gpt-transcribe` | default transcripts |
| STT timestamps | `STT_TIMESTAMP_MODEL` | `whisper-1` | word timings (pause/fluency metrics) — only whisper-1 supports `timestamp_granularities:['word']` |
| TTS | `TTS_MODEL` / `TTS_VOICE` | `gpt-4o-mini-tts` / `alloy` | voice output |

## OpenAI implementation (`src/lib/ai/openai/`)

- LLM: Responses API — `responses.create` (text), `responses.stream` (`response.output_text.delta` events), `responses.parse` + `zodTextFormat` for `structured<T>` (spec §66 validated output).
- STT: `audio.transcriptions.create`; `wordTimestamps: true` → whisper-1 `verbose_json` + word granularities.
- TTS: `audio.speech.create` (`response_format: 'mp3'`, `instructions` supported).
- Pronunciation: LLM transcript-vs-target analysis only. Always `confidence: 'low'`, `phonemeEvidence: false` — spec §52 forbids fabricated phoneme scores.
- Embeddings: `text-embedding-3-small`.

## Mock providers (`src/lib/ai/mock/`)

Deterministic, zero-cost, used in dev (no key) and tests.

- `MockLLM.complete/stream`: canned tutor line. `structured()` calls the responder
  registry `mockResponders[name](messages)` and validates with the caller's zod
  schema. Unknown name → `MockResponderMissing` — later phases must register one
  via `registerMockResponder(name, fn)` or add a fixture in `responders.ts`.
- `MockSTT`: `[mock transcript]`, empty words.
- `MockTTS`: valid 0.5s silent WAV (44-byte header).
- Pronunciation/embeddings: deterministic stubs.

## Usage events (`src/lib/ai/usage.ts`)

Every provider call records `{provider, model, kind, inputTokens?, outputTokens?, ms, error?}`
into `ai_evaluation_events` — best-effort, never throws. Powers the §74 usage
dashboard and §67 evaluator evidence later.

## Adding a provider

Implement the interface(s) in `src/lib/ai/<vendor>/`, wire into `getAI()`
selection, register mock responders for any `structured()` name you introduce,
add tests against the mock.

## Orchestrator (Phase 3)

`TutorService.respond` (src/server/services/tutor.ts) is the §46 orchestrator.
Per learner turn it does *targeted* retrieval only — settings, learner profile,
8 due mistake patterns, 6 due vocabulary rows, last session summary, 5 learner
memories, last 12 turns — builds `TutorContext`, renders
`buildTutorSystemPrompt` (`src/lib/ai/prompts/tutor.ts`, `TUTOR_PROMPT_VERSION =
'tutor.v1'`), calls `llm.structured` tier `frontier` against `TutorTurnSchema`,
persists both turns, applies `memoryCandidates` and `corrections`, and clamps
`difficultyAdjustment` to 1–5 on the session.

`EvaluationService.evaluateTurn` runs `SPEECH_EVALUATOR_SYSTEM`
(`evaluators.v1`, tier `balanced`) + deterministic `computeFluency/Grammar/
VocabularyScore`, stores `{evaluation, scores}` on the turn, a `speech_metrics`
row, and an `ai_evaluation_events` row carrying `evaluatorVersion`, the resolved
`promptVersionId` (`prompt_templates`/`prompt_versions`, registered lazily by
`ensurePromptVersion`), `confidence` and `inputEvidence`. Failure leaves
`evaluation_status='failed'` (retryable, §75).

`SessionService.end` generates `SessionSummarySchema` via
`SESSION_SUMMARY_SYSTEM` into `learning_sessions.overall_summary` (jsonb).

Mock responders registered in `src/lib/ai/mock/responders.ts`: `tutor-turn`
(echoes `detectFossilised` hits as corrections), `speech-evaluation` (real
detector → GrammarError, all ratings 50 marked "mock provider — no model
judgement"), `session-summary`. They are honest by construction — a clean
transcript produces zero corrections.

`ChatMessage.content` also accepts `ContentPart[]` (`{type:'image', dataUrl}`)
for §10 picture description; the OpenAI impl maps to `input_image`/`input_text`,
mock providers ignore images.

## Roleplay engine (Phase 6)

`src/server/services/roleplay.ts` (`RoleplayService`) backs Business (`/business`), Negotiation (`/negotiation`), Simulator (`/simulator`), Debate (`/debate`) and the assessment Conversation/Roleplay items. `start` links a `learning_sessions` row (goal JSON stores persona/difficulty) and inserts the scenario opener as the first AI turn; `turn` saves the learner turn first, calls `llm.structured({name:'roleplay-turn', schema:RoleplayTurnSchema, system:ROLEPLAY_PERSONA_SYSTEM({...})})` with the rolling transcript, and stores `internalNote` inside the AI turn as an HTML comment stripped by the GET API. `evaluate` picks by `domain`: `negotiation` → NEGOTIATION_EVALUATOR_SYSTEM + `computeNegotiationScore` (two ScoreResults — language/negotiation, never combined, §55); `debate` → DEBATE_EVALUATOR_SYSTEM; other domains → speech-evaluation over learner turns + objectives self-check + revealed counterpart notes. `hiddenScript` is stripped from `GET /api/roleplay/:id` until `ended_at` is set (§31). Mistakes are recorded with context `roleplay:<slug>`; each evaluation writes an ai_event with the evaluators prompt version.

Mock responders for offline/dev: `roleplay-turn`, `negotiation-evaluation`, `presentation-evaluation`, `debate-evaluation`, `writing-evaluation`, `reading-evaluation`, `journal-analysis`, `tamil-to-english`, `register-evaluation`. Mock STT returns word timings only when the filename contains `timed`.
