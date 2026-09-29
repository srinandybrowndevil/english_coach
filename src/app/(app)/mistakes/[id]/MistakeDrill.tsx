'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';

// §41 Workflow D — 3-item remediation drill for one pattern.
export function MistakeDrill({ patternId, originalExample, correctedExample }: {
  patternId: string; originalExample: string | null; correctedExample: string | null;
}) {
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ success: boolean; feedback: string; status: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const rec = useRecorder();

  const submit = async (type: 'correct' | 'produce' | 'register', payload?: string) => {
    const body = payload ?? text;
    if (!body.trim()) return;
    setBusy(true); setResult(null);
    try {
      const res = await fetch(`/api/mistakes/${patternId}/drill`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, text: body }),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setText(''); rec.reset(); }
      else setResult({ success: false, feedback: data.error ?? 'failed', status: '' });
    } finally { setBusy(false); }
  };

  const submitSpoken = async () => {
    if (!rec.blob) return;
    const fd = new FormData();
    fd.append('audio', rec.blob, 'drill.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    if (t?.text) setText(t.text);
  };

  const STEPS = [
    {
      key: 'correct' as const, title: '1. Correct the sentence',
      hint: originalExample
        ? <>Your sentence: <span className="text-red-600">{originalExample}</span> — rewrite it correctly.</>
        : 'Rewrite the sentence with the pattern fixed.',
    },
    {
      key: 'produce' as const, title: '2. Produce a new sentence',
      hint: <>Write or say a <em>new</em> sentence that uses the correct form. Example target: <span className="text-green-700">{correctedExample ?? 'the corrected form'}</span></>,
    },
    {
      key: 'register' as const, title: '3. Register switch',
      hint: 'Now say the same idea as a formal business sentence (as if writing to a client).',
    },
  ];
  const cur = STEPS[Math.min(step, STEPS.length - 1)]!;

  return (
    <section className="rounded-xl border border-accent/40 p-4 space-y-3">
      <h2 className="font-semibold">Practise now</h2>
      <div className="text-xs text-fg-muted">Item {Math.min(step + 1, 3)} of 3</div>
      <h3 className="text-sm font-medium">{cur.title}</h3>
      <p className="text-sm text-fg-muted">{cur.hint}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
        className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
      <div className="flex items-center gap-3">
        <RecorderControls r={rec} />
        {rec.blob && <button onClick={submitSpoken} className="text-xs underline">Transcribe into box</button>}
      </div>
      <div className="flex gap-2">
        <button disabled={busy || !text.trim()} onClick={() => submit(cur.key)}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
          Check
        </button>
        {step < STEPS.length - 1 && (
          <button onClick={() => { setStep(step + 1); setResult(null); }} className="text-sm text-fg-muted underline">
            Next item →
          </button>
        )}
      </div>
      {result && (
        <p className={`rounded p-3 text-sm ${result.success ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
          {result.success ? '✓ ' : '✗ '}{result.feedback}
          {result.status && <span className="ml-2 text-xs">status → {result.status}</span>}
        </p>
      )}
    </section>
  );
}
