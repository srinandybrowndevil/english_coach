'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { ReadingPassage } from '@/content/reading';
import type { ReadingEvaluation } from '@/lib/evaluation/schemas';

export function ReadingClient({ passages, level }: { passages: ReadingPassage[]; level: string }) {
  const [cur, setCur] = useState<ReadingPassage | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<ReadingEvaluation | null>(null);
  const [tap, setTap] = useState<string | null>(null);
  const rec = useRecorder();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!cur) return;
    setBusy(true);
    const res = await fetch('/api/reading/grade', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: cur.slug, answers }),
    });
    if (res.ok) setResult(await res.json());
    setBusy(false);
  };

  const spoken = async (i: number) => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 'r.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    if (t?.text) setAnswers((a) => ({ ...a, [i]: t.text }));
    rec.reset();
  };

  if (!cur) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-2xl font-semibold">Reading <span className="text-sm text-fg-muted">(level {level})</span></h1>
        <ul className="space-y-2">
          {passages.map((p) => (
            <li key={p.slug}>
              <button onClick={() => setCur(p)}
                className="w-full rounded-xl border border-border p-4 text-left hover:bg-surface">
                <strong className="text-sm">{p.title}</strong>
                <span className="ml-2 text-xs text-fg-muted">{p.type} · {p.level} · {p.exercises.length} exercises</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={() => { setCur(null); setResult(null); setAnswers({}); }} className="text-xs text-fg-muted underline">← passages</button>
      <h1 className="text-xl font-semibold">{cur.title} <span className="text-xs text-fg-muted">{cur.type} · {cur.level}</span></h1>
      <div className="rounded-xl border border-border p-4 text-sm leading-7">
        {cur.text.split(' ').map((w, i) => (
          <button key={i} onClick={() => setTap(w)} className="hover:rounded hover:bg-accent/10">{w} </button>
        ))}
      </div>
      {tap && (
        <div className="rounded-lg bg-surface p-3 text-sm">
          <strong>{tap}</strong>
          <form onSubmit={async (e) => {
            e.preventDefault();
            await fetch('/api/vocabulary/add', {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: tap }),
            });
            setTap(null);
          }}>
            <button className="ml-2 text-xs text-accent underline">+ Add to my words</button>
          </form>
        </div>
      )}
      {cur.exercises.map((ex, i) => (
        <div key={i} className="rounded-xl border border-border p-4">
          <p className="text-sm font-medium">{ex.prompt} <span className="text-xs text-fg-muted">({ex.kind})</span></p>
          {ex.options ? (
            <div className="mt-1 space-y-1">
              {ex.options.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <input type="radio" name={`ex${i}`} checked={answers[i] === o} onChange={() => setAnswers((a) => ({ ...a, [i]: o }))} />
                  {o}
                  {result && answers[i] === o && <span className={`text-xs ${o === ex.answer ? 'text-green-700' : 'text-amber-700'}`}>{o === ex.answer ? '✓' : '✗'}</span>}
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-1">
              <textarea value={answers[i] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))}
                rows={2} className="w-full rounded-lg border border-border bg-bg p-2 text-sm" />
              {ex.kind === 'explain-orally' && (
                <div className="mt-1"><RecorderControls r={rec} onSend={spoken.bind(null, i)} /></div>
              )}
            </div>
          )}
        </div>
      ))}
      <button onClick={submit} disabled={busy} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white">{busy ? 'Grading…' : 'Submit'}</button>
      {result && (
        <div className="rounded-xl border border-border p-4 text-sm space-y-2">
          <p>Comprehension: <strong>{result.comprehensionScore.score}/100</strong> <span className="text-xs text-fg-muted">({result.comprehensionScore.evidence})</span></p>
          <p className="text-xs text-fg-muted">{result.summaryFeedback}</p>
          {result.vocabularyHighlights.map((v) => <p key={v.word} className="text-xs">📖 <strong>{v.word}</strong> — {v.meaning}</p>)}
        </div>
      )}
    </div>
  );
}
