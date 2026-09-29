import { clamp, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';

// spec §56 components. NOTE (§28): we never claim to measure psychological
// confidence — only observable delivery signals, passed through unmodified.
const DIMS = [
  'opening', 'structure', 'logicalFlow', 'transitions', 'clarity', 'language',
  'pacing', 'pauses', 'emphasis', 'audienceFraming', 'conclusion',
] as const;

export type PresentationDim = (typeof DIMS)[number];
export type DimInput = { score: number; evidence: string };

export type PresentationResult = ScoreResult & {
  deliverySignals: { wpm?: number; longPauseCount?: number; fillerCount?: number };
};

export function computePresentationScore(
  dims: Partial<Record<PresentationDim, DimInput>>,
  deliverySignals: { wpm?: number; longPauseCount?: number; fillerCount?: number } = {},
): PresentationResult {
  const components: Record<string, ScoreComponent> = {};
  for (const d of DIMS) {
    const i = dims[d];
    if (i) components[d] = { score: clamp(i.score), weight: 1, evidence: i.evidence };
  }
  const coverage = Object.keys(components).length / DIMS.length;
  const confidence: Confidence = coverage < 0.4 ? 'low' : coverage < 0.8 ? 'medium' : 'high';
  return { ...result(components, confidence), deliverySignals };
}
