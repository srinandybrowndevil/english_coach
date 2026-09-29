import { clamp, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';

// spec §52 weights
const WEIGHTS = {
  intelligibility: 0.3,
  targetSound: 0.25,
  wordStress: 0.15,
  rhythm: 0.1,
  sentenceStress: 0.1,
  connectedSpeech: 0.05,
  consistency: 0.05,
} as const;

export type PronunciationDim = keyof typeof WEIGHTS;
export type PronunciationDimInput = { score: number; evidence: string };
export type PronunciationResult = ScoreResult & { coverage: number };

/** Only scores dimensions supplied with real evidence — never invents one (§52). */
export function computePronunciationScore(
  dims: Partial<Record<PronunciationDim, PronunciationDimInput>>,
): PronunciationResult {
  const components: Record<string, ScoreComponent> = {};
  let coverage = 0;
  for (const [k, w] of Object.entries(WEIGHTS) as [PronunciationDim, number][]) {
    const d = dims[k];
    if (d) {
      components[k] = { score: clamp(d.score), weight: w, evidence: d.evidence };
      coverage += w;
    }
  }
  const confidence: Confidence =
    coverage < 0.5 || !dims.intelligibility ? 'low' : coverage < 0.85 ? 'medium' : 'high';
  return { ...result(components, confidence), coverage };
}
