'use client';
import type { ReactNode } from 'react';

export type Turn = {
  id: string; role: 'learner' | 'tutor' | 'system';
  text: string; audioPath?: string | null; tamilNote?: string | null;
};

export function TranscriptView({ turns, turnActions }: {
  turns: Turn[];
  turnActions?: (t: Turn) => ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3" role="log" aria-label="conversation">
      {turns.length === 0 && (
        <p className="text-sm text-neutral-500">Nothing yet — press Record or type below to start.</p>
      )}
      {turns.map((t) => (
        <div key={t.id} className={`flex ${t.role === 'learner' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
            t.role === 'learner'
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900'
          }`}>
            <p className="whitespace-pre-wrap">{t.text}</p>
            {t.tamilNote && (
              <details className="mt-1 text-xs opacity-70">
                <summary className="cursor-pointer">Tamil note</summary>
                {t.tamilNote}
              </details>
            )}
            {turnActions && <div className="mt-1 flex gap-2 text-xs opacity-80">{turnActions(t)}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
