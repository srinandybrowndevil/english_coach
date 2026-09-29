'use client';

import { useState } from 'react';
import type { WritingMode } from '@/content/writing-templates';
import type { WritingEvaluation } from '@/lib/evaluation/schemas';
import type { ScoreResult } from '@/lib/scoring/util';
import { ScoreCard } from '@/components/voice/ScoreCard';
import { detectAwkwardCollocations } from '@/lib/vocabulary/collocations';
import { COLLOCATIONS } from '@/content/collocations';

type Result = { evaluation: WritingEvaluation; score: ScoreResult; submissionId: string };

export function WritingClient({ modes }: { modes: WritingMode[] }) {
  const [mode, setMode] = useState<WritingMode>(modes[0]!);
  const [text, setText] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [rewrite, setRewrite] = useState('');
  const [rewritten, setRewritten] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);

  // §75 — autosave draft per mode (lazy init reads localStorage once per mode switch)
  const key = `draft:${mode.slug}`;
  const [loadedKey, setLoadedKey] = useState('');
  if (loadedKey !== key) {
    setLoadedKey(key);
    setText(typeof window !== 'undefined' ? (localStorage.getItem(key) ?? '') : '');
  }
  const save = (v: string) => { setText(v); if (typeof window !== 'undefined') localStorage.setItem(key, v); };

  const colNotes = detectAwkwardCollocations(text, COLLOCATIONS);

  const submit = async (submissionId?: string) => {
    setBusy(true);
    const body = { modeSlug: mode.slug, text, ...(submissionId ? { submissionId } : {}) };
    const res = await fetch('/api/writing/evaluate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const d = await res.json();
    if (res.ok) { setResult(d); setRewrite(d.evaluation ? text : ''); if (submissionId) setRewritten(true); }
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Writing</h1>
      <select value={mode.slug} onChange={(e) => { setMode(modes.find((m) => m.slug === e.target.value)!); setResult(null); }}
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm">
        {modes.map((m) => <option key={m.slug} value={m.slug}>{m.mode} — {m.register}</option>)}
      </select>
      <p className="text-sm text-fg-muted">{mode.prompt} <em>({mode.audience})</em></p>

      <textarea value={text} onChange={(e) => save(e.target.value)} rows={8}
        className="w-full rounded-xl border border-border bg-bg p-4 text-sm" />
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>{text.split(/\s+/).filter(Boolean).length} words · autosaved</span>
        <button onClick={() => submit()} disabled={busy || !text.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
          {busy ? 'Evaluating…' : 'Submit'}
        </button>
      </div>
      {colNotes.map((n) => (
        <p key={n.quote} className="text-xs text-amber-700 underline decoration-dotted">“{n.quote}” → {n.natural}</p>
      ))}

      {result && (
        <div className="space-y-4">
          <ScoreCard title="Writing" result={result.score} />
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2 font-semibold">Issues</h3>
            <p className="mb-2 text-sm">
              {result.evaluation.issues.length ? 'Highlighted phrases and fixes:' : 'No issues flagged.'}
            </p>
            <ul className="space-y-1 text-sm">
              {result.evaluation.issues.map((i, k) => (
                <li key={k}><mark className="bg-amber-200/60">{i.quote}</mark> → {i.fix} <span className="text-xs text-fg-muted">({i.dimension})</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-accent/40 p-4">
            <h3 className="font-semibold">Rewrite it yourself</h3>
            <p className="text-sm text-amber-800">{result.evaluation.rewriteInstruction}</p>
            <textarea value={rewrite} onChange={(e) => setRewrite(e.target.value)} rows={6}
              className="mt-2 w-full rounded-lg border border-border bg-bg p-3 text-sm" />
            <button disabled={!rewrite.trim() || rewrite === text} onClick={() => { setText(rewrite); void submit(result.submissionId); }}
              className="mt-1 rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Submit rewrite (v2)</button>
          </div>
          {(rewritten || revealed) ? (
            <div className="rounded-xl border border-border p-4 text-sm space-y-2">
              <p><strong>Corrected:</strong> {result.evaluation.correctedVersion}</p>
              <p><strong>Natural:</strong> {result.evaluation.naturalVersion}</p>
              <p><strong>Advanced:</strong> {result.evaluation.advancedVersion}</p>
              {(() => { const d = (result.score as ScoreResult & { delta?: number }).delta;
                return d !== null && d !== undefined
                  ? <p className="text-xs text-fg-muted">Score delta vs v1: {d > 0 ? '+' : ''}{d}</p>
                  : null; })()}
            </div>
          ) : (
            <button onClick={async () => {
                setRevealed(true);
                await fetch(`/api/writing/${result.submissionId}/reveal`, { method: 'POST' });
              }} className="text-sm text-fg-muted underline">
              I just want to see the model versions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
