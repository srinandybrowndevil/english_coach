// §21 — flag non-native collocations using the seeded awkward_alternatives map.
export type CollocationNote = {
  quote: string; natural: string; note: string; kind: 'unnatural';
};

export function detectAwkwardCollocations(
  text: string,
  collocations: { phrase: string; awkwardAlternatives: string[] | string | null; note?: string | null }[],
): CollocationNote[] {
  const lower = ` ${text.toLowerCase()} `;
  const notes: CollocationNote[] = [];
  for (const c of collocations) {
    const alts: string[] = Array.isArray(c.awkwardAlternatives)
      ? c.awkwardAlternatives
      : typeof c.awkwardAlternatives === 'string' ? [c.awkwardAlternatives] : [];
    for (const alt of alts) {
      if (alt && lower.includes(` ${alt.toLowerCase()} `)) {
        notes.push({
          quote: alt, natural: c.phrase,
          note: c.note ?? `"${alt}" is understandable but non-native — say "${c.phrase}".`,
          kind: 'unnatural',
        });
      }
    }
  }
  return notes;
}
