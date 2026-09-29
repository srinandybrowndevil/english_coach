'use client';
import type { ScoreResult } from '@/lib/scoring/util';

// spec §50 — every score shows its components and evidence. No bare numbers.
export function ScoreCard({ title, result }: { title: string; result: ScoreResult }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-baseline justify-between">
        <h4 className="font-medium">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tabular-nums">{result.total}</span>
          <span className="text-xs uppercase tracking-wide text-neutral-500">{result.confidence} confidence</span>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {Object.entries(result.components).map(([k, c]) => (
          <li key={k} className="text-sm">
            <div className="flex justify-between">
              <span className="capitalize text-neutral-700 dark:text-neutral-300">{k}</span>
              <span className="tabular-nums text-neutral-500">{c.score} ×{c.weight}</span>
            </div>
            <div className="mt-0.5 h-1 rounded bg-neutral-200 dark:bg-neutral-800">
              <div className="h-1 rounded bg-neutral-700 dark:bg-neutral-300" style={{ width: `${c.score}%` }} />
            </div>
            <p className="mt-0.5 text-xs text-neutral-500">{c.evidence}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
