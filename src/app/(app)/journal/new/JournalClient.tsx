'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { JournalAnalysis } from '@/lib/evaluation/schemas';

export function JournalClient({ prompts }: { prompts: string[] }) {
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [saved, setSaved] = useState<{ id: string } | null>(null);
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const rec = useRecorder();
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!content.trim() && !rec.blob) return;
    setBusy(true);
    let text = content;
    if (!text.trim() && rec.blob) {
      const fd = new FormData(); fd.append('audio', rec.blob, 'j.webm');
      const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
      text = t?.text ?? '';
      setContent(text);
    }
    const res = await fetch('/api/journal', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, prompt: prompt || undefined }),
    });
    if (res.ok) setSaved(await res.json());
    setBusy(false);
  };

  const analyse = async () => {
    if (!saved) return;
    setBusy(true);
    const res = await fetch(`/api/journal/${saved.id}/analyse`, { method: 'POST' });
    if (res.ok) setAnalysis(await res.json());
    setBusy(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">New journal entry</h1>
      <select value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm">
        <option value="">Free writing (no prompt)</option>
        {prompts.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8}
        placeholder="Write — or record below and it will be transcribed."
        className="w-full rounded-xl border border-border bg-bg p-4 text-sm" />
      <RecorderControls r={rec} />
      <div className="flex gap-2">
        <button onClick={save} disabled={busy || (!content.trim() && !rec.blob)}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">
          {busy ? 'Saving…' : 'Save'}
        </button>
        {saved && !analysis && (
          <button onClick={analyse} className="rounded-lg border border-border px-4 py-2 text-sm">Analyse</button>
        )}
      </div>
      {saved && <p className="text-xs text-green-700">Saved ✓</p>}

      {analysis && (
        <div className="space-y-3 rounded-xl border border-border p-4 text-sm">
          <h2 className="font-semibold">Analysis</h2>
          {!!analysis.grammarErrors.length && (
            <ul className="list-inside list-disc text-amber-700">
              {analysis.grammarErrors.map((e, i) => <li key={i}><span className="line-through">{e.quote}</span> → {e.correction}</li>)}
            </ul>
          )}
          {analysis.expressionNotes.map((n) => <p key={n} className="text-fg-muted">{n}</p>)}
          {analysis.newWordsWorthLearning.map((w) => (
            <p key={w.word}><strong>{w.word}</strong> — {w.meaning}</p>
          ))}
          {!!analysis.recurringPatterns.length && (
            <p className="text-xs text-fg-muted">Recurring patterns logged to your vault: {analysis.recurringPatterns.join(', ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
