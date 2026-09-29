import { clamp, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';

// spec §55 — language and negotiation skill stay separate; no combined number.
const LANGUAGE_DIMS = ['grammar', 'clarity', 'tone', 'vocabulary', 'fluency'] as const;
const NEGOTIATION_DIMS = [
  'questionQuality', 'valueFraming', 'objectionHandling', 'concessionDiscipline',
  'boundaryClarity', 'alternativeGeneration', 'closing',
] as const;

export type NegotiationDim = (typeof NEGOTIATION_DIMS)[number];
export type NegotiationLanguageDim = (typeof LANGUAGE_DIMS)[number];
export type DimInput = { score: number; evidence: string };

export type NegotiationScore = { language: ScoreResult; negotiation: ScoreResult };

function build(
  dims: readonly string[],
  inputs: Partial<Record<string, DimInput>>,
): Record<string, ScoreComponent> {
  const components: Record<string, ScoreComponent> = {};
  for (const d of dims) {
    const i = inputs[d];
    if (i) components[d] = { score: clamp(i.score), weight: 1, evidence: i.evidence };
  }
  return components;
}

export function computeNegotiationScore(input: {
  language?: Partial<Record<NegotiationLanguageDim, DimInput>>;
  negotiation?: Partial<Record<NegotiationDim, DimInput>>;
}): NegotiationScore {
  const lang = build(LANGUAGE_DIMS, input.language ?? {});
  const neg = build(NEGOTIATION_DIMS, input.negotiation ?? {});
  const conf = (n: number, total: number): Confidence =>
    n / total < 0.5 ? 'low' : n / total < 1 ? 'medium' : 'high';
  return {
    language: result(lang, conf(Object.keys(lang).length, LANGUAGE_DIMS.length)),
    negotiation: result(neg, conf(Object.keys(neg).length, NEGOTIATION_DIMS.length)),
  };
}
