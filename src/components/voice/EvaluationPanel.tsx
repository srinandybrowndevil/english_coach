'use client';
import { useState } from 'react';
import type { ScoreResult } from '@/lib/scoring/util';
import type { SpeechEvaluation, SpeechMetrics } from '@/lib/types-eval';
import { CorrectionCard } from './CorrectionCard';
import { ScoreCard } from './ScoreCard';

// §10 output order: transcript → corrected → natural → professional → issues →
// vocabulary → fillers → fluency → pronunciation notes → one primary action.
export function EvaluationPanel({ data, metrics, onTryAgain, onAddToPractice, onNextChallenge }: {
  data: {
    transcript: string;
    evaluation: SpeechEvaluation;
    scores: { fluency: ScoreResult; grammar: ScoreResult; vocabulary: ScoreResult };
  };
  metrics?: SpeechMetrics | null;
  onTryAgain?: () => void;
  onAddToPractice?: () => void;
  onNextChallenge?: () => void;
}) {
  const ev = data.evaluation;
  const [showAll, setShowAll] = useState(false);
  const [showBetter, setShowBetter] = useState(false);
  const errors = showAll ? ev.grammarErrors : ev.grammarErrors.slice(0, 5);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Transcript</h4>
        <p className="mt-1 text-sm">{data.transcript}</p>
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Corrected English</h4>
        <p className="mt-1 text-sm">{ev.correctedText}</p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Natural English</h4>
          {!showBetter && ev.professionalText && (
            <button onClick={() => setShowBetter(true)} className="text-xs underline">Show professional version</button>
          )}
        </div>
        <p className="mt-1 text-sm">{ev.naturalText}</p>
        {(showBetter || ev.professionalText) && ev.professionalText && (
          <p className="mt-2 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-900">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Professional: </span>
            {ev.professionalText}
          </p>
        )}
      </section>

      {ev.grammarErrors.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Key grammar issues ({ev.grammarErrors.length})
          </h4>
          <div className="mt-2 flex flex-col gap-2">
            {errors.map((e, i) => <CorrectionCard key={i} e={e} />)}
          </div>
          {ev.grammarErrors.length > 5 && !showAll && (
            <button onClick={() => setShowAll(true)} className="mt-2 text-xs underline">Show all {ev.grammarErrors.length}</button>
          )}
        </section>
      )}

      {ev.vocabularyOpportunities.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Vocabulary opportunities</h4>
          <ul className="mt-1 space-y-1 text-sm">
            {ev.vocabularyOpportunities.map((v, i) => (
              <li key={i}><span className="line-through opacity-60">{v.original}</span> → <strong>{v.better}</strong> <span className="text-neutral-500">— {v.why}</span></li>
            ))}
          </ul>
        </section>
      )}

      {metrics && metrics.fillerCount > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Filler words</h4>
          <p className="mt-1 text-sm">
            {metrics.fillerCount} total: {Object.entries(metrics.fillers).map(([f, n]) => `"${f}" ×${n}`).join(', ')}
          </p>
        </section>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <ScoreCard title="Fluency" result={data.scores.fluency} />
        <ScoreCard title="Grammar" result={data.scores.grammar} />
        <ScoreCard title="Vocabulary" result={data.scores.vocabulary} />
      </div>

      <section className="rounded-xl bg-neutral-900 p-4 text-white dark:bg-neutral-100 dark:text-neutral-900">
        <h4 className="text-xs font-semibold uppercase tracking-wide opacity-70">One thing to work on</h4>
        <p className="mt-1 font-medium">{ev.primaryFocus}</p>
        <p className="mt-2 text-sm opacity-80">Exercise: {ev.followUpExercise.prompt}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        {onTryAgain && <button onClick={onTryAgain} className="rounded-lg border px-4 py-2 text-sm">Try Again</button>}
        {onAddToPractice && <button onClick={onAddToPractice} className="rounded-lg border px-4 py-2 text-sm">Add Mistake to Practice</button>}
        {onNextChallenge && <button onClick={onNextChallenge} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900">Next Challenge</button>}
      </div>
    </div>
  );
}
