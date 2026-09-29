export function clamp(n: number, lo = 0, hi = 100): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Linear interpolation through (x0,y0)-(x1,y1), clamped to [min(y0,y1), max(y0,y1)]. */
export function linearScale(value: number, [x0, y0]: [number, number], [x1, y1]: [number, number]): number {
  if (x0 === x1) return y0;
  const t = (value - x0) / (x1 - x0);
  const lo = Math.min(y0, y1);
  const hi = Math.max(y0, y1);
  return Math.min(hi, Math.max(lo, y0 + t * (y1 - y0)));
}

export type ScoreComponent = { score: number; weight: number; evidence: string };
export type Confidence = 'low' | 'medium' | 'high';
export type ScoreResult = {
  total: number;
  components: Record<string, ScoreComponent>;
  confidence: Confidence;
};

/** Weighted mean over present components only; weights renormalised. */
export function weightedMean(components: Record<string, ScoreComponent>): number {
  let num = 0;
  let den = 0;
  for (const c of Object.values(components)) {
    num += c.score * c.weight;
    den += c.weight;
  }
  return den === 0 ? 0 : num / den;
}

/** Round to 1 decimal place. */
export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function result(components: Record<string, ScoreComponent>, confidence: Confidence): ScoreResult {
  return { total: r1(clamp(weightedMean(components))), components, confidence };
}
