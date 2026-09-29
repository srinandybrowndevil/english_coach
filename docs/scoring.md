# Scoring engines (spec §49–57)

All engines live in `src/lib/scoring/`, are pure functions, and return the
shared evidence-bearing shape — the UI must always be able to show *why*:

```ts
type ScoreResult = {
  total: number;                              // 0–100, rounded to 1 decimal
  components: Record<string, {
    score: number;                            // 0–100, rounded to 1 decimal
    weight: number;
    evidence: string;                         // shown verbatim in the UI
  }>;
  confidence: 'low' | 'medium' | 'high';
}
```

Missing components are omitted and `weightedMean` renormalises over the weights
of components actually present — the total always reflects observed evidence only.

## Shared helpers — `util.ts`

- `clamp(v, min=0, max=100)` — bounds any score.
- `linearScale(value, [x0, y0], [x1, y1])` — linear map clamped between the two
  output points.
- `weightedMean(components)` — renormalising weighted mean; empty input → `0`.
- `r1` — round to 1 decimal.

## Speech metrics — `speech-metrics.ts` (§49)

`deriveSpeechMetrics(words, transcript, { responseLatencySec? })` extracts:

- `durationSec` = last.end − first.start; fallback `wordCount / 2.5` when no timings.
- Pause = gap between consecutive words > 0.5 s; long pause > 1.5 s.
- Fillers counted from the §14 list (`actually, basically, like, you know, I mean, so,
  okay, right, hmm, uh, um`), whole-token or bigram, case-insensitive.
- `repetitionCount` — immediate identical token repeats (`the the`).
- `selfCorrectionCount` — heuristic: occurrences of `I mean | sorry,| no,` treated
  as repair attempts (documented in code).

## Fluency — `fluency.ts` (§50)

Components and weights (curves via `linearScale`, clamped):

| component | weight | curve |
|---|---|---|
| continuity | 0.20 | long pauses/min: 100 at 0 → 0 at ≥6 |
| pauseEfficiency | 0.20 | pauseRatio = totalPause/duration: 100 ≤0.15 → 0 ≥0.50 |
| ideaCompletion | 0.15 | completed/sentences×100; 0 sentences → 100 if <5 words else 0 |
| fillerControl | 0.15 | fillers/100 words: 100 ≤2 → 0 ≥12 |
| speakingRate | 0.10 | WPM 120–170 → 100; linear to 0 at 60 and 230 |
| responseLatency | 0.10 | 100 ≤1 s → 0 ≥6 s; **omitted if undefined** |
| repair | 0.10 | 0 repairs observed → 80 ("no repairs observed"); else successfulRepairs/selfCorrections×100 |

Confidence: duration <20 s low, <60 s medium, else high.

## Grammar — `grammar.ts` (§51)

`weightedErrors = Σ severity` (1|2|3 only; style notes are NOT errors —
the type signature forbids them). `density = weightedErrors / max(wordCount,1) × 100`;
`base = 100 − density×8`; `complexityBonus = clamp(subordinateClauses/sentences,0,1)×10`
only when `wordCount ≥ 20`. Confidence by wordCount (<30 low, <120 medium).

## Pronunciation — `pronunciation.ts` (§52)

Dimensions: intelligibility .30, targetSound .25, wordStress .15, rhythm .10,
sentenceStress .10, connectedSpeech .05, consistency .05. Renormalised over
present dims; `coverage` = Σ present weights. Confidence: low if coverage<0.5 or
intelligibility missing; medium <0.85; else high. **Never invents a dimension** —
this is transcript/LLM evidence only; no fabricated phoneme scores.

## Vocabulary — `vocabulary.ts` (§53)

- `range`: mean type-token ratio over 50-token windows (single window if shorter),
  scaled TTR 0.45→50, 0.75→100.
- `repetition`: `100 − top5ContentWordShare×200`, clamped (inline ~50-word stoplist).
- Optional rated dims (appropriateness, precision, register, collocation) fold in
  equally weighted with `{score, evidence}`.

## Writing — `writing.ts` (§54)

Dims: grammar .20, clarity .15, coherence .15, structure .10, vocabulary .10,
naturalness .10, register .10, conciseness .05, mechanics .05.
`weightOverrides` accepted (used by `src/content/writing-templates.ts`) and
renormalised.

## Negotiation — `negotiation.ts` (§55)

Returns **two separate objects**, never a combined number:
`{ language: {grammar, clarity, tone, vocabulary, fluency}, negotiation: {questionQuality,
valueFraming, objectionHandling, concessionDiscipline, boundaryClarity,
alternativeGeneration, closing} }` — equal weights within each.

## Presentation — `presentation.ts` (§56)

Dims: opening, structure, logicalFlow, transitions, clarity, language, pacing,
pauses, emphasis, audienceFraming, conclusion (equal weights). `confidenceProxy`
is NOT a dimension; `deliverySignals {wpm, longPauseCount, fillerCount}` passes
through measured speech data instead (§28 forbids claiming to measure confidence).

## CEFR — `cefr.ts` (§57)

`estimateCefr(domains)` maps each domain score to a level:
<20 A1, <35 A2, <50 B1, <65 B2, <80 C1, else C2. Overall = median level.
**Gate**: overall may not exceed (lowest evidenced level among critical domains
speaking/grammar/listening/writing) + 1 step; when applied, `gate` reads e.g.
"Capped at b2: writing is at b1". No evidence at all → `level: null`.
Confidence: low if any critical domain lacks evidence or total evidenceCount<6;
medium <20; else high.
