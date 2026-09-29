# Traceability Matrix

Status per spec section after **Phase 1** (scaffold, auth, DB, AI layer).

| § | Title | Implemented | Tested | Verified | Files | Tests | Notes |
|---|---|---|---|---|---|---|---|
| 0 | Your role | Not started | No | No | — | — |  |
| 1 | Non-negotiable product principles | Implemented (private app, allowlist, no public signup) | Yes | Yes | src/app/api/auth/*, src/proxy.ts | — | Phase 1 |
| 2 | Primary outcome | Not started | No | No | — | — |  |
| 3 | User model | Implemented | Yes | Yes | src/lib/db/schema/core.ts, src/app/(app)/onboarding | tests/integration/assessment.test.ts | Phase 4 — profile jsonb columns, onboarding sets goals/context |
| 4 | Application form | Not started | No | No | — | — |  |
| 5 | Recommended technical architecture | Implemented (stack + provider abstraction + private auth) | No | No | src/lib/ai/*, docs/ai-system.md | — | Phase 1 |
| 6 | System architecture | Not started | No | No | — | — |  |
| 7 | Main navigation | Partial (nav structure only) | No | No | src/app/(app)/layout.tsx | — | Phase 1 |
| 8 | Page: Home | Implemented | Yes | Yes | src/app/(app)/page.tsx, src/server/services/progress.ts | tests/unit/learning/streak.test.ts | Phase 4 — real dashboard, skill radar, streak, improvement (null-safe) |
| 9 | Page: My Tutor | Implemented | Yes | Pending UI polish | src/app/(app)/tutor/, src/server/services/tutor.ts | tests/integration/conversation.test.ts | Phase 3 — all 10 modes, voice+text, insight panel |
| 10 | Page: Speak | Implemented | Yes | Pending UI polish | src/app/(app)/speak/, src/app/api/turns/[id]/evaluate | tests/unit/evaluation/schemas.test.ts | Phase 3 — 10 modes incl. picture description; rapid/timed auto-stop |
| 11 | Page: Pronunciation | Implemented | Yes | Yes | src/app/(app)/pronunciation/, src/content/pronunciation.ts | tests/unit/pronunciation/word-diff.test.ts | Phase 5C |
| 12 | IPA module | Implemented | Yes | Yes | src/content/pronunciation.ts (IPA_MODULES), PronunciationClient IPA tab (gated) | — | Phase 5C |
| 13 | Page: Tongue Twisters | Implemented | Yes | Yes | src/app/(app)/tongue-twisters/ | tests/unit/pronunciation/word-diff.test.ts | Phase 5C |
| 14 | Page: Fluency | Implemented | Yes | Pending UI polish | src/app/(app)/fluency/, src/app/api/exercise-attempts | — | Phase 3 — 10 drills + personal best in exercise_attempts |
| 15 | Page: Listening | Implemented | Yes | Yes | src/app/(app)/listening/, src/content/listening-scripts.ts | — | Phase 5D |
| 16 | Shadowing system | Partial | Yes | Yes | ListeningClient shadow block, SHADOWING_SETS | — | Phase 5D (lite: word-diff + listen/record/compare) |
| 17 | Page: Grammar | Implemented | Yes | Yes | src/app/(app)/grammar/, lesson-rules.ts | tests/integration/skills-vocab.test.ts | Phase 5B |
| 18 | Page: Vocabulary | Implemented | Yes | Yes | src/app/(app)/vocabulary/ | tests/unit/learning/vocabulary-state.test.ts | Phase 5B |
| 19 | Phrasal verb system | Implemented | Yes | Yes | VocabBrowser Phrasal Verbs tab, src/content/phrasal-verbs.ts | — | Phase 5B |
| 20 | Idiom system | Implemented | Yes | Yes | VocabBrowser Idioms tab, src/content/idioms.ts | — | Phase 5B |
| 21 | Collocation system | Implemented | Yes | Yes | VocabBrowser Collocations tab + detectAwkwardCollocations | tests/unit/vocabulary/collocations.test.ts | Phase 5B |
| 22 | Modern/Gen-Z English | Implemented | Yes | Yes | VocabBrowser Modern English tab (register caution shown) | — | Phase 5B |
| 23 | Register switching | Implemented | Yes | Yes | VocabBrowser Register tab (self-marked transforms) | — | Phase 5B |
| 24 | Page: Reading | Not started | No | No | — | — |  |
| 25 | Page: Writing | Not started | No | No | — | — |  |
| 26 | Page: Business English | Partial (content/logic) | No | Pending UI | src/content/scenarios.ts | — | Phase 2 |
| 27 | Page: Negotiation | Partial (content/logic) | No | Pending UI | src/content/scenarios.ts | — | Phase 2 |
| 28 | Page: Presentation | Partial (content/logic) | No | Pending UI | src/content/presentation-topics.ts | — | Phase 2 |
| 29 | Public speaking training | Partial (content/logic) | No | Pending UI | src/content/public-speaking.ts | — | Phase 2 |
| 30 | Page: Debate | Partial (content/logic) | No | Pending UI | src/content/debate-topics.ts | — | Phase 2 |
| 31 | Page: Real-Life Simulator | Partial (content/logic) | No | Pending UI | src/content/scenarios.ts | — | Phase 2 |
| 32 | Tamil -> English lab | Not started | No | No | — | — |  |
| 33 | Think in English lab | Not started | No | No | — | — |  |
| 34 | Conversation recovery training | Implemented | Yes | Yes | VocabBrowser Recovery tab | — | Phase 5B |
| 35 | Precision English | Implemented | Yes | Yes | VocabBrowser Precision tab | — | Phase 5B |
| 36 | Journal | Not started | No | No | — | — |  |
| 37 | Daily training engine | Implemented | Yes | Yes | src/server/services/curriculum.ts, src/app/(app)/daily | tests/integration/assessment.test.ts | Phase 4 — daily plan engine + runner + summary |
| 38 | Curriculum engine | Implemented | Yes | Yes | src/server/services/curriculum.ts | tests/integration/assessment.test.ts | Phase 4 — skill state seeding + curriculum_plans ordering |
| 39 | Adaptive planning algorithm | Implemented | Yes | Pending UI | src/lib/learning/planner.ts | tests/unit/learning/skills-planner.test.ts | Phase 2 |
| 40 | Spaced repetition | Implemented | Yes | Yes | srs.ts + vocabulary-state.ts + /vocabulary/review | tests/unit/learning/*.test.ts | Phase 5B |
| 41 | Mistake memory engine | Implemented | Yes | Yes | mistakes.ts + rules.ts + /mistakes Vault | tests/unit/memory/, tests/integration/signature-merge.test.ts | Phase 5A — canonical domain:rule signatures |
| 42 | Fossilised error detection | Implemented | Yes | Yes | fossilised.ts → CANONICAL_RULES | tests/unit/memory/fossilised.test.ts | Phase 5A |
| 43 | Tutor memory | Implemented | Yes | Pending UI | src/server/services/memory.ts | tests/integration/conversation.test.ts | Phase 3 — sha256 dedupe, keyword-overlap recall; embeddings deferred |
| 44 | Voice architecture | Deferred | No | No | docs/voice.md | — | requires provider realtime credentials + ephemeral-token flow; STT/TTS provider interfaces keep it pluggable |
| 45 | Audio privacy | Implemented | Yes | Yes | src/server/services/speech.ts, src/app/api/audio/[turnId] | tests/integration/audio-retention.test.ts | Phase 3 — retention off/7d/30d, owner-only streaming, purgeExpired |
| 46 | AI tutor orchestrator | Implemented | Yes | Pending UI | src/server/services/tutor.ts, src/lib/ai/prompts/tutor.ts | tests/integration/conversation.test.ts | Phase 3 — targeted retrieval + TutorTurnSchema frontier call |
| 47 | Core tutor system behaviour | Implemented | Yes | Pending UI | src/app/(app)/tutor/TutorClient.tsx | — | Phase 3 — TUTOR_MODES all present |
| 48 | Correction modes | Implemented | Yes | Pending UI | src/lib/ai/prompts/tutor.ts, src/app/(app)/tutor/TutorClient.tsx | — | Phase 3 — live-vs-finish toggle maps to balanced/fluency |
| 49 | Speaking analysis | Implemented | Yes | Yes | src/lib/scoring/speech-metrics.ts, speech_metrics rows | tests/unit/scoring/speech-metrics.test.ts | Phase 3 — now persisted per evaluated turn |
| 50 | Fluency score | Implemented | Yes | Pending UI | src/lib/scoring/fluency.ts | tests/unit/scoring/fluency.test.ts | Phase 2 |
| 51 | Grammar score | Implemented | Yes | Pending UI | src/lib/scoring/grammar.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 52 | Pronunciation score | Implemented | Yes | Pending UI | src/lib/scoring/pronunciation.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 53 | Vocabulary score | Implemented | Yes | Pending UI | src/lib/scoring/vocabulary.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 54 | Writing score | Implemented | Yes | Pending UI | src/lib/scoring/writing.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 55 | Negotiation score | Implemented | Yes | Pending UI | src/lib/scoring/negotiation.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 56 | Presentation score | Implemented | Yes | Pending UI | src/lib/scoring/presentation.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 57 | CEFR estimation | Implemented | Yes | Yes | src/server/services/assessment.ts, cefr_estimates | tests/integration/assessment.test.ts | deterministic gate authoritative over LLM band |
| 58 | Initial assessment | Implemented | Yes | Yes | src/content/assessment.ts, src/app/(app)/assessment/[kind] | tests/integration/assessment.test.ts | 12-section runner, resume, hidden grades until finish |
| 59 | Monthly assessment | Implemented | Yes | Yes | selectItems monthIndex rotation | tests/unit/content/assessment-select.test.ts | ≥2 variants per group, deterministic rotation |
| 60 | Progress page | Not started | No | No | — | — |  |
| 61 | Weekly report | Not started | No | No | — | — |  |
| 62 | Monthly report | Not started | No | No | — | — |  |
| 63 | Database schema | Implemented (all tables) | Yes (migration applied in tests) | Yes | src/lib/db/schema/*, drizzle/migrations/ | tests/integration/db.test.ts | Phase 1 |
| 64 | Important database details | Implemented (§64 columns verbatim) | Yes (unique constraint test) | Yes | src/lib/db/schema/{mistakes,skills,vocabulary,sessions}.ts | tests/integration/db.test.ts | Phase 1 |
| 65 | API/service boundaries | Implemented | Yes | Yes | src/lib/ai/prompts/, src/server/services/prompt-version.ts | — | Phase 3 — versioned prompt text registered in prompt_versions |
| 66 | AI structured output | Implemented | Yes | Pending UI | src/lib/evaluation/schemas.ts | tests/unit/evaluation/schemas.test.ts | + SessionSummary/RoleplayTurn/TamilToEnglish |
| 67 | AI evaluation safeguards | Implemented | Yes | Yes | ai_evaluation_events.prompt_version_id, input_evidence | tests/integration/conversation.test.ts | Phase 3 — every tutor/evaluator call records version + evidence |
| 68 | Design system | Partial (tokens, palette, layout shell) | No | No | src/app/globals.css | — | Phase 1 |
| 69 | Accessibility | Not started | No | No | — | — |  |
| 70 | Settings | Not started | No | No | — | — |  |
| 71 | Personal data export | Not started | No | No | — | — |  |
| 72 | Security | Partial (auth, CSRF, headers, rate limit, secure cookies) | Yes (allowlist/token tests) | Yes | src/lib/auth/*, src/proxy.ts, src/lib/security/*, next.config.ts | tests/unit/auth/allowlist.test.ts, tests/unit/env.test.ts | Phase 1 |
| 73 | Observability | Partial (AI event logging) | No | No | src/lib/ai/usage.ts | — | Phase 1 |
| 74 | Cost controls | Partial | Yes | Pending UI | src/lib/ai/usage.ts | — | events recorded with tokens+ms+cost fields; dashboard UI later |
| 75 | Failure behaviour | Implemented | Yes | Partial | src/app/api/sessions/[id]/turn, src/hooks/usePendingTurn.ts | tests/integration/* | stt_failed/tutor_failed/evaluation_status=failed paths; IndexedDB pending-turn restore |
| 76 | Repository structure | Implemented | No | No | repository root | — | Phase 1 |
| 77 | Seed content | Implemented | Yes | Pending UI | src/lib/db/seed.ts, src/content/* | tests/integration/seed.test.ts | Phase 2 |
| 78 | Required workflows | Implemented | Yes | Yes | onboarding,daily,/mistakes vault+review,/grammar,/vocabulary/review | tests/integration/*.ts | A+B Phase 4; D/F Phase 5 |
| 79 | Session summary | Implemented | Yes | Yes | src/server/services/session.ts, src/app/(app)/sessions/[id] | tests/integration/conversation.test.ts | Phase 3 — SessionSummarySchema on overall_summary |
| 80 | Gamification | Implemented | Yes | Yes | src/server/services/progress.ts | tests/unit/learning/streak.test.ts | streak + minutes only; no coins/leaderboards |
| 81 | Required test strategy | Not started | No | No | — | — |  |
| 82 | Critical unit tests | Implemented | Yes | Yes | tests/unit/*, tests/fixtures/* | vitest 100+ tests | Phase 2 — engines tested; UI paths pending |
| 83 | Critical integration tests | Not started | No | No | — | — |  |
| 84 | End-to-end tests | Not started | No | No | — | — |  |
| 85 | AI quality tests | Not started | No | No | — | — |  |
| 86 | No fake demo data | Implemented | Yes | Yes | src/app/(app)/page.tsx, src/server/services/progress.ts | tests/integration/assessment.test.ts | null when <2 sessions/window; empty states everywhere |
| 87 | Quality gates | Not started | No | No | — | — |  |
| 88 | Browser QA | Not started | No | No | — | — |  |
| 89 | Performance | Not started | No | No | — | — |  |
| 90 | Implementation order | Not started | No | No | — | — |  |
| 91 | Agent working rules | Not started | No | No | — | — |  |
| 92 | Failure modes to avoid | Not started | No | No | — | — |  |
| 93 | Definition of done | Not started | No | No | — | — |  |
| 94 | Final delivery requirements | Not started | No | No | — | — |  |
| 95 | Requirement traceability | Not started | No | No | — | — |  |
| 96 | Final product standard | Not started | No | No | — | — |  |
| 97 | Start execution | Not started | No | No | — | — |  |

## Phase 6
| Spec | Where |
|---|---|
| §24 Reading | `src/content/reading.ts`, `/reading`, `/api/reading/grade`, `src/lib/learning/reading-level.ts` |
| §25 Writing | `/writing`, `src/server/services/writing.ts`, `/api/writing/evaluate` |
| §26 Business | `/business`, `src/server/services/roleplay.ts`, `RoleplayRunner` |
| §27 Negotiation | `/negotiation`, negotiation-evaluation responder, separate ScoreCards |
| §28–29 Presentation/Public speaking | `/presentation`, `/presentation/techniques`, `computePresentationScore`, `deriveSpeechMetrics` |
| §30 Debate | `/debate`, ad-hoc `debate:*` scenarios, DEBATE_EVALUATOR_SYSTEM |
| §31 Simulator | `/simulator`, hiddenScript gating in `RoleplayService.get` |
| §32 Tamil→English | `src/content/tamil-english.ts` (60 items), `/practice/tamil-english`, `/api/labs/tamil-english` |
| §33 Think-in-English | `/practice/think-english`, `distinctNouns`, `containsTamil` |
| §34–36 Recovery/Journal | recovery phrases via vocab sections; `/journal` + `JournalService` |
| §55 | `computeNegotiationScore` separate totals; no combined number in evaluation JSON |
| §56 | `computePresentationScore` + speech-metrics pauses/fillers/wpm |
| §78 E register grading | `REGISTER_EVALUATOR_SYSTEM` + `RegisterEvaluationSchema` in vault drill + §23 register exercise + `/api/register/evaluate` |
