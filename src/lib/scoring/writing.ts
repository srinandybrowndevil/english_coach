import { clamp, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';

// spec §54 default weights; may vary by task via weightOverrides.
export const WRITING_WEIGHTS = {
  grammar: 0.2,
  clarity: 0.15,
  coherence: 0.15,
  structure: 0.1,
  vocabulary: 0.1,
  naturalness: 0.1,
  register: 0.1,
  conciseness: 0.05,
  mechanics: 0.05,
} as const;

export type WritingDim = keyof typeof WRITING_WEIGHTS;
export type WritingDimInput = { score: number; evidence: string };

export function computeWritingScore(
  dims: Partial<Record<WritingDim, WritingDimInput>>,
  opts: { weightOverrides?: Partial<Record<WritingDim, number>>; wordCount?: number } = {},
): ScoreResult {
  const weights = { ...WRITING_WEIGHTS, ...opts.weightOverrides };
  const components: Record<string, ScoreComponent> = {};
  for (const [k, w] of Object.entries(weights) as [WritingDim, number][]) {
    const d = dims[k];
    if (d && w > 0) components[k] = { score: clamp(d.score), weight: w, evidence: d.evidence };
  }
  const wc = opts.wordCount ?? 0;
  const confidence: Confidence = wc < 40 ? 'low' : wc < 200 ? 'medium' : 'high';
  return result(components, confidence);
}
