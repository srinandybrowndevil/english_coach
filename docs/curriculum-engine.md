# Curriculum engine (spec §37–40)

Deterministic logic in `src/lib/learning/`; seed content in `src/content/`;
seeded rows in `skill_definitions`, `skill_prerequisites`, `content_items`,
`roleplay_scenarios`, `vocabulary_items`, `phrasal_verbs`, `idioms`, `collocations`.

## Spaced repetition — `learning/srs.ts` (§40)

```ts
LADDER_DAYS = [0, 1, 3, 7, 14, 30, 60]
scheduleReview({ intervalIndex, easeFactor }, outcome, now)
// pass: index+1; beyond ladder end → days = prevDays × ease; ease += 0.1 (cap 2.5)
// hard: same index;                    ease −= 0.15 (floor 1.3)
// fail: index = max(0, index−2);       ease −= 0.20 (floor 1.3)
// index 0 = "same session" → nextReviewAt = now + 10 minutes
```

Stored per item: `learner_vocabulary.interval_index`/`ease_factor`,
`mistake_patterns.interval_index`/`ease_factor`, `learner_skill_states` likewise.

## Skill graph — `learning/skills.ts` (§38)

Seed graph in `src/content/skills.ts` (89 skills, 109 prerequisite edges; e.g.
`basic-verb-forms → past-simple → narrative-consistency → storytelling →
advanced-speaking`).

`updateSkillState(state, {correct, at})`:
- `masteryScore` EMA α=0.2 toward 100/0.
- `confidenceScore = min(1, attemptCount/10)`.
- Status ladder: attempt 1 → `learning`; mastery≥40 → `practising`; ≥70 & ≥5
  attempts → `stable`; ≥85 & ≥8 attempts & confidence≥0.7 → `mastered`; a
  mastered skill decaying below 70 → `relapsed`.
- `nextReviewAt` via SRS pass/fail.

`prerequisitesReady(skillId, defs, states)` — every prerequisite `masteryScore ≥ 60`.

## Daily planner — `learning/planner.ts` (§37, §39)

```
priority = (0.2 + 0.8·weakness) × importance × (1 + min(recurrence,10)/5)
         × reviewDueFactor × (0.3 + 0.7·goalRelevance)
         × (1 + min(hoursSinceLastPractised,168)/168)
reviewDueFactor: overdue → 1.5 + min(overdueHours,72)/72; due ≤24h → 1.2; else 1
priority = 0 when prerequisitesReady is false
```

`buildDailyPlan({minutes, candidates})` greedy by priority with caps:
- `review` items get first pick up to 25% of minutes;
- one `conversation` item placed first when minutes ≥ 15;
- no single domain may exceed 40% of the plan's minutes (§39 domain balancing).

## Content tables

| kind (content_items) | source |
|---|---|
| grammar_lesson | `grammar-lessons.ts` — 45 lessons, full §17 structure |
| sound_contrast / ipa_module / shadowing_set | `pronunciation.ts` (§11/§12/§16) |
| tongue_twister | `tongue-twisters.ts` (§13, 44) |
| presentation_topic / debate_topic / public_speaking_technique | §28/§30/§29 |
| modern_english / register / register_transform | §22/§23 |
| recovery / precision_map | §34/§35 |
| listening_mode / writing_mode | §15/§25 |

Scenarios (§26/§27/§31) live in `roleplay_scenarios` with `domain` ∈
business | negotiation | simulator; simulator hidden scripts are stored under
`config.hiddenScript` and never exposed before the roleplay ends.

Seeder: `pnpm db:seed` → `src/lib/db/seed.ts` (`seedContent(db)` is injectable
for tests). Upserts by slug; idempotent — see `tests/integration/seed.test.ts`.
