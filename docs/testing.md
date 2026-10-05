# Testing Strategy

## Overview

The project uses **Vitest** for unit and integration tests, and **Playwright** for end-to-end tests. Tests are organized into three categories:

- **Unit tests** (`tests/unit/`) — Test individual functions, utilities, and algorithms in isolation
- **Integration tests** (`tests/integration/`) — Test service-level flows with in-memory PGlite database
- **E2E tests** (`tests/e2e/`) — Browser automation tests for critical user flows (minimal coverage)

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests (requires dev server running)
pnpm test:e2e
```

## Test Database

Integration tests use **in-memory PGlite** (`memory://`) for fast, isolated database testing. Each test:

1. Creates a fresh in-memory database
2. Runs all Drizzle migrations
3. Executes the test
4. Tears down the database

Example setup:

```ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@/lib/db/schema';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}
```

## Unit Test Coverage

### AI & Mock Providers
- `tests/unit/ai/mock.test.ts` — Mock provider deterministic responses, versioned prompts

### Authentication & Security
- `tests/unit/auth/allowlist.test.ts` — Email allowlist validation
- `tests/unit/security/rate-limit.test.ts` — Rate limiting logic
- `tests/unit/env.test.ts` — Environment variable parsing and validation

### Content
- `tests/unit/content/assessment-select.test.ts` — Assessment item selection and rotation

### Evaluation
- `tests/unit/evaluation/schemas.test.ts` — Structured output schemas (SessionSummary, RoleplayTurn, etc.)

### Learning Engines
- `tests/unit/learning/skills-planner.test.ts` — Adaptive daily planner scoring and ranking
- `tests/unit/learning/srs.test.ts` — Spaced repetition interval calculation
- `tests/unit/learning/streak.test.ts` — Streak calculation and validation
- `tests/unit/learning/vocabulary-state.test.ts` — Vocabulary status transitions
- `tests/unit/learning/phase6.test.ts` — Reading level and rapid-naming scoring

### Memory
- `tests/unit/memory/fossilised.test.ts` — Fossilised error detection
- `tests/unit/memory/merge-dedupe.test.ts` — Mistake signature deduplication
- `tests/unit/memory/mistakes.test.ts` — Mistake occurrence lifecycle
- `tests/unit/memory/rules.test.ts` — Canonical rule registry and normalization

### Pronunciation
- `tests/unit/pronunciation/word-diff.test.ts` — Word-level diff for shadowing and minimal pairs

### Scoring
- `tests/unit/scoring/fluency.test.ts` — Fluency score calculation
- `tests/unit/scoring/grammar-pronunciation.test.ts` — Grammar, pronunciation, vocabulary, writing, negotiation, presentation scores
- `tests/unit/scoring/speech-metrics.test.ts` — Speech metrics extraction and scoring

### Speech
- `tests/unit/speech/tts-lru.test.ts` — TTS cache LRU eviction

### Vocabulary
- `tests/unit/vocabulary/collocations.test.ts` — Collocation awkwardness detection

### Voice
- `tests/unit/voice/recorder-reducer.test.ts` — Voice recorder state machine

## Integration Test Coverage

### Assessment
- `tests/integration/assessment.test.ts` — Full assessment flow: onboarding, item selection, submission, grading, CEFR estimation

### Audio Retention
- `tests/integration/audio-retention.test.ts` — Audio file retention policy, purge logic, owner-only access

### Conversation
- `tests/integration/conversation.test.ts` — Tutor session, STT/TTS integration, evaluation event logging, mistake capture

### Database
- `tests/integration/db.test.ts` — Schema constraints, unique keys, foreign keys, migrations

### Phase 6
- `tests/integration/phase6.test.ts` — Roleplay hidden_note storage, real roleplay assessment

### Seed
- `tests/integration/seed.test.ts` — Seed content idempotency, skill graph consistency

### Signature Merge
- `tests/integration/signature-merge.test.ts` — Database repair for duplicate mistake signatures

### Skills & Vocabulary
- `tests/integration/skills-vocab.test.ts` — Skill mastery transitions, vocabulary review scheduling

## E2E Test Coverage

E2E tests are intentionally minimal given the project scope (single-user, private application). Coverage focuses on:

- Authentication flow (magic link request, verification, session creation)
- Onboarding workflow (goal selection, context input)
- Critical error paths (offline recovery, database corruption recovery)

Implementation is planned for Phase 8.

## Quality Gates

Before each phase commit, the following checks are run:

1. **Type check**: `pnpm typecheck` — TypeScript compilation with `--noEmit`
2. **Lint**: `pnpm lint` — ESLint with Next.js config
3. **Unit + integration tests**: `pnpm test` — Vitest with all test files
4. **Build**: `pnpm build --webpack` — Production build (webpack required on this platform; Turbopack not supported)

## Mock AI Provider

All tests use the mock AI provider in `src/lib/ai/mock/` which returns deterministic responses without calling external APIs. This ensures:

- Tests run offline
- No API key requirements
- Consistent test results
- Fast execution

The mock provider implements the same interfaces as the real OpenAI provider (LLM, STT, TTS, pronunciation, embeddings).

## Known Limitations

- **Visual UI testing**: No automated visual regression tests; manual screenshot review per phase
- **Cross-browser testing**: Manual only; Playwright configured for Chromium
- **Load testing**: Not applicable for single-user local application
- **AI quality tests**: LLM output quality is verified through manual review of prompts and sample responses
