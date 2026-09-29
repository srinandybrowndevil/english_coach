'use client';

import { useState } from 'react';
import { MistakeDrill } from '../[id]/MistakeDrill';

export function ReviewQueue({ patterns }: {
  patterns: { id: string; label: string; status: string; occurrenceCount: number;
    originalExample: string | null; correctedExample: string | null }[];
}) {
  const [i, setI] = useState(0);
  const cur = patterns[i];
  if (!cur) {
    return <p className="rounded-xl bg-green-50 p-4 text-sm text-green-800">Queue cleared — all due patterns practised.</p>;
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-fg-muted">Pattern {i + 1} of {patterns.length}: <strong>{cur.label}</strong> (×{cur.occurrenceCount}, {cur.status})</p>
      <MistakeDrill patternId={cur.id} originalExample={cur.originalExample} correctedExample={cur.correctedExample} />
      <button onClick={() => setI(i + 1)} className="text-sm text-fg-muted underline">Next pattern →</button>
    </div>
  );
}
