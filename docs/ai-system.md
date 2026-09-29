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
