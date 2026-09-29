import { clamp, linearScale, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';
import { tokenize } from './speech-metrics';

const STOPWORDS = new Set(
  ('the a an and or but if of at by for with about into through during before after ' +
    'to from in on is are was were be been i you he she it we they me him her us them ' +
    'my your his its our their this that these those do does did have has had not no ' +
    'so very just can will would should could shall may might').split(' '),
);

export type RatedDim = { score: number; evidence: string };
export type VocabRatings = Partial<
  Record<'appropriateness' | 'precision' | 'register' | 'collocation', RatedDim>
>;

// spec §53 — range, repetition + evaluator-rated dimensions; rare ≠ good.
export function computeVocabularyScore(transcript: string, rated: VocabRatings = {}): ScoreResult {
  const tokens = tokenize(transcript);
  const components: Record<string, ScoreComponent> = {};

  // range: TTR over 50-token moving windows (single window if shorter)
  const window = Math.min(50, tokens.length);
  if (window > 0) {
    let sum = 0;
    let n = 0;
    for (let i = 0; i + window <= tokens.length; i++) {
      sum += new Set(tokens.slice(i, i + window)).size / window;
      n++;
    }
    const ttr = n ? sum / n : 0;
    components['range'] = {
      score: clamp(linearScale(ttr, [0.45, 50], [0.75, 100])),
      weight: 1,
      evidence: `type-token ratio ${ttr.toFixed(2)} over ${n} window(s) of ${window} tokens`,
    };
  }

  // repetition: share taken by the top-5 content words
  const freq = new Map<string, number>();
  let content = 0;
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue;
    content++;
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  if (content > 0) {
    const top5 = [...freq.values()].sort((a, b) => b - a).slice(0, 5).reduce((s, x) => s + x, 0);
    const share = top5 / content;
    components['repetition'] = {
      score: clamp(100 - share * 200),
      weight: 1,
      evidence: `top-5 content words cover ${(share * 100).toFixed(0)}% of content tokens`,
    };
  }

  for (const [k, d] of Object.entries(rated)) {
    components[k] = { score: clamp(d.score), weight: 1, evidence: d.evidence };
  }

  const confidence: Confidence = tokens.length < 30 ? 'low' : tokens.length < 120 ? 'medium' : 'high';
  return result(components, confidence);
}
