import { clamp, r1, type ScoreComponent, type ScoreResult } from './util';

export type GrammarErrorInput = { severity: 1 | 2 | 3 }; // §51 severity weights; style notes are NOT errors

// spec §51: weighted-error density with a complexity bonus so ambitious
// sentences aren't unfairly punished.
export function computeGrammarScore(
  errors: GrammarErrorInput[],
  wordCount: number,
  complexity: { subordinateClauses: number; sentences: number },
): ScoreResult {
  const weighted = errors.reduce((s, e) => s + e.severity, 0);
  const density = (weighted / Math.max(wordCount, 1)) * 100;
  const base = 100 - density * 8;

  let total = base;
  const components: Record<string, ScoreComponent> = {
    accuracy: {
      score: clamp(base),
      weight: 1,
      evidence: `${errors.length} errors, severity-weighted ${weighted}, density ${r1(density)}/100 words`,
    },
  };

  if (wordCount >= 20) {
    const complexityBonus = clamp(complexity.subordinateClauses / Math.max(complexity.sentences, 1), 0, 1) * 10;
    total = base + complexityBonus;
    components['complexityBonus'] = {
      score: clamp(complexityBonus * 10), // bonus recorded on the 0–100 scale for display
      weight: 0, // additive bonus, not part of the weighted mean
      evidence: `+${r1(complexityBonus)} for subordination ratio ${r1(complexity.subordinateClauses / Math.max(complexity.sentences, 1))}`,
    };
  }

  return {
    total: r1(clamp(total)),
    components,
    confidence: wordCount < 30 ? 'low' : wordCount < 120 ? 'medium' : 'high',
  };
}
