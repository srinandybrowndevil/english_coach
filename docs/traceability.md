# Traceability Matrix

Status per spec section after **Phase 1** (scaffold, auth, DB, AI layer).

| § | Title | Implemented | Tested | Verified | Files | Tests | Notes |
|---|---|---|---|---|---|---|---|
| 0 | Your role | Not started | No | No | — | — |  |
| 1 | Non-negotiable product principles | Implemented (private app, allowlist, no public signup) | Yes | Yes | src/app/api/auth/*, src/proxy.ts | — | Phase 1 |
| 2 | Primary outcome | Not started | No | No | — | — |  |
| 3 | User model | Partial (learner_profiles columns only) | No | No | src/lib/db/schema/core.ts | — | Phase 1 |
| 4 | Application form | Not started | No | No | — | — |  |
| 5 | Recommended technical architecture | Implemented (stack + provider abstraction + private auth) | No | No | src/lib/ai/*, docs/ai-system.md | — | Phase 1 |
| 6 | System architecture | Not started | No | No | — | — |  |
| 7 | Main navigation | Partial (nav structure only) | No | No | src/app/(app)/layout.tsx | — | Phase 1 |
| 8 | Page: Home | Not started | No | No | — | — |  |
| 9 | Page: My Tutor | Implemented | Yes | Pending UI polish | src/app/(app)/tutor/, src/server/services/tutor.ts | tests/integration/conversation.test.ts | Phase 3 — all 10 modes, voice+text, insight panel |
| 10 | Page: Speak | Implemented | Yes | Pending UI polish | src/app/(app)/speak/, src/app/api/turns/[id]/evaluate | tests/unit/evaluation/schemas.test.ts | Phase 3 — 10 modes incl. picture description; rapid/timed auto-stop |
| 11 | Page: Pronunciation | Partial (content/logic) | No | Pending UI | src/content/pronunciation.ts | — | Phase 2 |
| 12 | IPA module | Partial (content/logic) | No | Pending UI | src/content/pronunciation.ts (ipa_modules) | — | Phase 2 |
| 13 | Page: Tongue Twisters | Partial (content/logic) | No | Pending UI | src/content/tongue-twisters.ts | — | Phase 2 |
| 14 | Page: Fluency | Implemented | Yes | Pending UI polish | src/app/(app)/fluency/, src/app/api/exercise-attempts | — | Phase 3 — 10 drills + personal best in exercise_attempts |
| 15 | Page: Listening | Not started | No | No | — | — |  |
| 16 | Shadowing system | Not started | No | No | — | — |  |
| 17 | Page: Grammar | Partial (content/logic) | No | Pending UI | src/content/grammar-lessons.ts | — | Phase 2 |
| 18 | Page: Vocabulary | Partial (content/logic) | No | Pending UI | src/content/vocabulary.ts | — | Phase 2 |
| 19 | Phrasal verb system | Partial (content/logic) | No | Pending UI | src/content/phrasal-verbs.ts | — | Phase 2 |
| 20 | Idiom system | Partial (content/logic) | No | Pending UI | src/content/idioms.ts | — | Phase 2 |
| 21 | Collocation system | Partial (content/logic) | No | Pending UI | src/content/collocations.ts | — | Phase 2 |
| 22 | Modern/Gen-Z English | Partial (content/logic) | No | Pending UI | src/content/modern-english.ts | — | Phase 2 |
| 23 | Register switching | Partial (content/logic) | No | Pending UI | src/content/register.ts | — | Phase 2 |
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
| 34 | Conversation recovery training | Partial (content/logic) | No | Pending UI | src/content/recovery.ts | — | Phase 2 |
| 35 | Precision English | Partial (content/logic) | No | Pending UI | src/content/precision.ts | — | Phase 2 |
| 36 | Journal | Not started | No | No | — | — |  |
| 37 | Daily training engine | Implemented | Yes | Pending UI | src/lib/learning/planner.ts | tests/unit/learning/skills-planner.test.ts | Phase 2 |
| 38 | Curriculum engine | Implemented | Yes | Pending UI | src/lib/learning/skills.ts, src/content/skills.ts | tests/unit/learning/skills-planner.test.ts | Phase 2 |
| 39 | Adaptive planning algorithm | Implemented | Yes | Pending UI | src/lib/learning/planner.ts | tests/unit/learning/skills-planner.test.ts | Phase 2 |
| 40 | Spaced repetition | Implemented | Yes | Pending UI | src/lib/learning/srs.ts | tests/unit/learning/srs.test.ts | Phase 2 |
| 41 | Mistake memory engine | Implemented | Yes | Pending UI | src/lib/memory/mistakes.ts | tests/unit/memory/mistakes.test.ts | Phase 2 |
| 42 | Fossilised error detection | Implemented | Yes | Pending UI | src/lib/memory/fossilised.ts | tests/unit/memory/fossilised.test.ts | Phase 2 |
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
| 57 | CEFR estimation | Implemented | Yes | Pending UI | src/lib/scoring/cefr.ts | tests/unit/scoring/grammar-pronunciation.test.ts | Phase 2 |
| 58 | Initial assessment | Not started | No | No | — | — |  |
| 59 | Monthly assessment | Not started | No | No | — | — |  |
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
| 78 | Required workflows | Not started | No | No | — | — |  |
| 79 | Session summary | Implemented | Yes | Yes | src/server/services/session.ts, src/app/(app)/sessions/[id] | tests/integration/conversation.test.ts | Phase 3 — SessionSummarySchema on overall_summary |
| 80 | Gamification | Not started | No | No | — | — |  |
| 81 | Required test strategy | Not started | No | No | — | — |  |
| 82 | Critical unit tests | Implemented | Yes | Yes | tests/unit/*, tests/fixtures/* | vitest 100+ tests | Phase 2 — engines tested; UI paths pending |
| 83 | Critical integration tests | Not started | No | No | — | — |  |
| 84 | End-to-end tests | Not started | No | No | — | — |  |
| 85 | AI quality tests | Not started | No | No | — | — |  |
| 86 | No fake demo data | Not started | No | No | — | — |  |
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
