'use client';

const KIND_BADGE: Record<string, { label: string; cls: string }> = {
  error: { label: 'wrong', cls: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
  unnatural: { label: 'unnatural', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  regional: { label: 'regional', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  register: { label: 'register', cls: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
};

export function CorrectionCard({ e }: {
  e: { quote: string; correction: string; explanation: string; kind: string; rule?: string; category?: string };
}) {
  const badge = KIND_BADGE[e.kind] ?? KIND_BADGE['error']!;
  return (
    <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="line-through decoration-red-400/70">{e.quote}</p>
          <p className="font-medium text-emerald-700 dark:text-emerald-400">→ {e.correction}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>{badge.label}</span>
      </div>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">{e.explanation}</p>
      {e.rule && <p className="mt-1 font-mono text-xs text-neutral-400">{e.rule}</p>}
    </div>
  );
}
