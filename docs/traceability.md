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
| 9 | Page: My Tutor | Not started | No | No | — | — |  |
| 10 | Page: Speak | Not started | No | No | — | — |  |
| 11 | Page: Pronunciation | Not started | No | No | — | — |  |
| 12 | IPA module | Not started | No | No | — | — |  |
| 13 | Page: Tongue Twisters | Not started | No | No | — | — |  |
| 14 | Page: Fluency | Not started | No | No | — | — |  |
| 15 | Page: Listening | Not started | No | No | — | — |  |
| 16 | Shadowing system | Not started | No | No | — | — |  |
| 17 | Page: Grammar | Not started | No | No | — | — |  |
| 18 | Page: Vocabulary | Not started | No | No | — | — |  |
| 19 | Phrasal verb system | Not started | No | No | — | — |  |
| 20 | Idiom system | Not started | No | No | — | — |  |
| 21 | Collocation system | Not started | No | No | — | — |  |
| 22 | Modern/Gen-Z English | Not started | No | No | — | — |  |
| 23 | Register switching | Not started | No | No | — | — |  |
| 24 | Page: Reading | Not started | No | No | — | — |  |
| 25 | Page: Writing | Not started | No | No | — | — |  |
| 26 | Page: Business English | Not started | No | No | — | — |  |
| 27 | Page: Negotiation | Not started | No | No | — | — |  |
| 28 | Page: Presentation | Not started | No | No | — | — |  |
| 29 | Public speaking training | Not started | No | No | — | — |  |
| 30 | Page: Debate | Not started | No | No | — | — |  |
| 31 | Page: Real-Life Simulator | Not started | No | No | — | — |  |
| 32 | Tamil -> English lab | Not started | No | No | — | — |  |
| 33 | Think in English lab | Not started | No | No | — | — |  |
| 34 | Conversation recovery training | Not started | No | No | — | — |  |
| 35 | Precision English | Not started | No | No | — | — |  |
| 36 | Journal | Not started | No | No | — | — |  |
| 37 | Daily training engine | Not started | No | No | — | — |  |
| 38 | Curriculum engine | Partial (skill tables + status enum) | No | No | src/lib/db/schema/skills.ts | — | Phase 1 |
| 39 | Adaptive planning algorithm | Not started | No | No | — | — |  |
| 40 | Spaced repetition | Not started | No | No | — | — |  |
| 41 | Mistake memory engine | Partial (mistake tables + status enum + unique signature) | No | No | src/lib/db/schema/mistakes.ts | — | Phase 1 |
| 42 | Fossilised error detection | Not started | No | No | — | — |  |
| 43 | Tutor memory | Partial (tutor_memories kinds) | No | No | src/lib/db/schema/content.ts | — | Phase 1 |
| 44 | Voice architecture | Not started | No | No | — | — |  |
| 45 | Audio privacy | Not started | No | No | — | — |  |
| 46 | AI tutor orchestrator | Not started | No | No | — | — |  |
| 47 | Core tutor system behaviour | Not started | No | No | — | — |  |
| 48 | Correction modes | Not started | No | No | — | — |  |
| 49 | Speaking analysis | Not started | No | No | — | — |  |
| 50 | Fluency score | Not started | No | No | — | — |  |
| 51 | Grammar score | Not started | No | No | — | — |  |
| 52 | Pronunciation score | Partial (pronunciation provider: no fabricated phoneme scores) | No | No | src/lib/ai/openai/pronunciation.ts | — | Phase 1 |
| 53 | Vocabulary score | Not started | No | No | — | — |  |
| 54 | Writing score | Not started | No | No | — | — |  |
| 55 | Negotiation score | Not started | No | No | — | — |  |
| 56 | Presentation score | Not started | No | No | — | — |  |
| 57 | CEFR estimation | Partial (cefr_level enum) | No | No | src/lib/db/schema/enums.ts | — | Phase 1 |
| 58 | Initial assessment | Not started | No | No | — | — |  |
| 59 | Monthly assessment | Not started | No | No | — | — |  |
| 60 | Progress page | Not started | No | No | — | — |  |
| 61 | Weekly report | Not started | No | No | — | — |  |
| 62 | Monthly report | Not started | No | No | — | — |  |
| 63 | Database schema | Implemented (all tables) | Yes (migration applied in tests) | Yes | src/lib/db/schema/*, drizzle/migrations/ | tests/integration/db.test.ts | Phase 1 |
| 64 | Important database details | Implemented (§64 columns verbatim) | Yes (unique constraint test) | Yes | src/lib/db/schema/{mistakes,skills,vocabulary,sessions}.ts | tests/integration/db.test.ts | Phase 1 |
| 65 | API/service boundaries | Partial (services index only) | No | No | src/server/services/index.ts | — | Phase 1 |
| 66 | AI structured output | Partial (structured() zod validation + responders) | No | No | src/lib/ai/types.ts, mock/responders.ts | tests/unit/ai/mock.test.ts | Phase 1 |
| 67 | AI evaluation safeguards | Partial (prompt_versions + ai_evaluation_events) | No | No | src/lib/db/schema/ai.ts | — | Phase 1 |
| 68 | Design system | Partial (tokens, palette, layout shell) | No | No | src/app/globals.css | — | Phase 1 |
| 69 | Accessibility | Not started | No | No | — | — |  |
| 70 | Settings | Not started | No | No | — | — |  |
| 71 | Personal data export | Not started | No | No | — | — |  |
| 72 | Security | Partial (auth, CSRF, headers, rate limit, secure cookies) | Yes (allowlist/token tests) | Yes | src/lib/auth/*, src/proxy.ts, src/lib/security/*, next.config.ts | tests/unit/auth/allowlist.test.ts, tests/unit/env.test.ts | Phase 1 |
| 73 | Observability | Partial (AI event logging) | No | No | src/lib/ai/usage.ts | — | Phase 1 |
| 74 | Cost controls | Partial (ai_evaluation_events usage rows) | No | No | src/lib/ai/usage.ts | — | Phase 1 |
| 75 | Failure behaviour | Not started | No | No | — | — |  |
| 76 | Repository structure | Implemented | No | No | repository root | — | Phase 1 |
| 77 | Seed content | Not started | No | No | — | — |  |
| 78 | Required workflows | Not started | No | No | — | — |  |
| 79 | Session summary | Not started | No | No | — | — |  |
| 80 | Gamification | Not started | No | No | — | — |  |
| 81 | Required test strategy | Not started | No | No | — | — |  |
| 82 | Critical unit tests | Not started | No | No | — | — |  |
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
