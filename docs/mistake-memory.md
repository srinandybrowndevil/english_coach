# Mistake memory (spec §41–42, §85)

Pure logic: `src/lib/memory/mistakes.ts`, `src/lib/memory/fossilised.ts`.
Persistence: `mistake_patterns`, `mistake_occurrences`, `mistake_reviews`.

## Canonical signatures

`buildSignature({domain, subcategory, rule})` → lowercase kebab joined by `:`,
e.g. `grammar:past-tense:did-plus-past-form`. The signature is derived from the
canonical rule — never from the learner's sentence — so occurrences dedupe via
the `UNIQUE(learner_id, error_signature)` constraint.

## State

```
MistakePatternState = {
  errorSignature, domain, subcategory, severity,
  status: new|recurring|improving|monitoring|mastered|relapsed,
  occurrenceCount, contextsSeen: string[], successfulReviewCount,
  reviewStreak, firstSeenAt, lastSeenAt, nextReviewAt,
  intervalIndex, easeFactor, monitoringSince,
  successHistory: { at, context }[]
}
```

## applyOccurrence

New → create state; always `occurrenceCount+1`, `lastSeenAt`, append new context,
`nextReviewAt` = SRS index 0 (same-session). Transitions: `new→recurring` at
occurrenceCount≥2; `improving→recurring`; `mastered|monitoring→relapsed`
(reappearance after mastery is a relapse, not a new pattern — same signature).

## applyReview (the mastery gates — deliberately strict)

- fail → streak 0, SRS fail, status `recurring` (or `relapsed` if mastered/monitoring).
- success → `successfulReviewCount+1`, `reviewStreak+1`, push `successHistory`, SRS pass.
- Promotion requires ALL of: streak ≥ 3 AND ≥ 2 distinct success contexts AND
  ≥ 3 days between first and last success → `monitoring`.
- A further success while `monitoring`, ≥ 7 days after `monitoringSince` → `mastered`.
- Otherwise → `improving`.

Consequence: 1 correct answer never masters; 3 same-day successes never monitor
(the date-separation rule exists to defeat same-day cramming).

## fossilised.ts (§42, §85)

Deterministic regex detectors for documented Indian-English patterns —
`discuss about`, `revert back`, `one of my + singular`, `today morning /
yesterday night`, `I have a doubt`, stative `I am having`, `do one thing`,
`did + past form` (`didn't went`), `cope up with`, `prepone` (regional, not an
error), `do the needful`, `good name`, `years back`, sentence-final `only/itself`.

`detectFossilised(text)` runs per sentence and returns `{ signature, category,
subcategory, span, start, end, explanation, internationalForm, indianEnglishNote,
professionalAlternative }`. Regional-only items (`prepone`, final `only`) are
labelled as regional, not wrong — the goal is informed choice.

Fixtures: `tests/fixtures/transcripts/fossilised.json` — each expected signature
is asserted to fire and clean sentences to produce nothing.
