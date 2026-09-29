'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { TamilItem } from '@/content/tamil-english';

export function TamilLabClient({ items }: { items: TamilItem[] }) {
  const [i, setI] = useState(0);
  const [attempt, setAttempt] = useState('');
  const [result, setResult] = useState<{
    literalBasic: string; natural: string; professional: string; formal: string | null;
    notes: string[]; keyDifference: string;
  } | null>(null);
  const rec = useRecorder();
  const item = items[i];

  const submit = async (text: string) => {
    const res = await fetch('/api/labs/tamil-english', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: item!.slug, attempt: text }),
    });
    if (res.ok) setResult(await res.json());
  };

  const spoken = async () => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 't.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    if (t?.text) { setAttempt(t.text); await submit(t.text); }
    rec.reset();
  };

  if (!item) return <p className="text-sm text-green-700">Session done — {items.length} items.</p>;

  return (
    <div className="space-y-4">
      <p className="text-xs text-fg-muted">{i + 1}/{items.length} · {item.context}</p>
      <div className="rounded-xl border border-border p-4">
        <p className="text-lg">{item.tamil}</p>
        <p className="text-sm text-fg-muted">{item.transliteration}</p>
      </div>
      <textarea value={attempt} onChange={(e) => setAttempt(e.target.value)} rows={2}
        placeholder="Say or type the English version"
        className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
      <div className="flex gap-2">
        <RecorderControls r={rec} onSend={spoken} />
        <button onClick={() => submit(attempt)} disabled={!attempt.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Check</button>
        <button onClick={() => { setI(i + 1); setAttempt(''); setResult(null); rec.reset(); }} className="text-sm text-fg-muted underline">Next →</button>
      </div>
      {result && (
        <div className="rounded-xl border border-border p-4 text-sm space-y-1">
          <p><strong>Literal:</strong> {result.literalBasic}</p>
          <p><strong>Natural:</strong> {result.natural}</p>
          <p><strong>Professional:</strong> {result.professional}</p>
          {result.formal && <p><strong>Formal:</strong> {result.formal}</p>}
          <p className="text-xs text-fg-muted">{result.keyDifference}</p>
          {result.notes.map((n) => <p key={n} className="text-xs text-amber-700">{n}</p>)}
        </div>
      )}
    </div>
  );
}
