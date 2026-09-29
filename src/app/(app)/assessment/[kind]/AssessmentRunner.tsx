'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';

type Item = {
  slug: string; section: string; type: string; prompt: string;
  options?: string[]; answer?: string; timeLimitSec?: number;
  audioText?: string; passage?: string; rubric?: string;
};
type Step = {
  assessment: { id: string; kind: string; status: string };
  total: number; answered: number; next: Item | null; done: boolean; sectionIndex: number;
};

export function AssessmentRunner({ kind, assessmentId }: { kind: string; assessmentId: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rec = useRecorder();

  const load = useCallback(async (id?: string) => {
    let aid = id ?? assessmentId;
    if (!aid) {
      const a = await (await fetch('/api/assessments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind }),
      })).json();
      aid = a.id;
    }
    const s = await (await fetch(`/api/assessments?id=${aid}`)).json();
    setStep(s);
  }, [assessmentId, kind]);

  useEffect(() => { // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const submit = async (response: Record<string, unknown>) => {
    if (!step?.next || !step.assessment.id) return;
    setBusy(true); setErr(null);
    try {
      const res = await fetch(`/api/assessments/${step.assessment.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemSlug: step.next.slug, response }),
      });
      if (!res.ok) throw new Error(`submit ${res.status}`);
      rec.reset();
      await load(step.assessment.id);
    } catch (e) { setErr(String(e)); } finally { setBusy(false); }
  };

  const finish = async () => {
    if (!step?.assessment.id) return;
    setBusy(true);
    await fetch(`/api/assessments/${step.assessment.id}/finish`, { method: 'POST' });
    router.push(`/assessments/${step.assessment.id}`);
  };

  if (!step) return <p className="text-sm text-fg-muted">Loading assessment…</p>;
  if (err) return <p className="text-sm text-red-600">Something failed: {err} — your answers are saved; refresh to resume.</p>;
  if (step.done) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-xl font-semibold">All sections complete</h1>
        <p className="text-sm text-fg-muted">{step.answered}/{step.total} items answered.</p>
        <button onClick={finish} disabled={busy}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white">
          {busy ? 'Generating your results…' : 'Finish & see my level'}
        </button>
      </div>
    );
  }

  const item = step.next!;
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between text-xs text-fg-muted">
        <span>Section {step.sectionIndex + 1}/12 — {item.section}</span>
        <span>Item {step.answered + 1}/{step.total}</span>
      </div>
      <div className="h-1.5 w-full rounded bg-border">
        <div className="h-1.5 rounded bg-accent" style={{ width: `${(step.answered / step.total) * 100}%` }} />
      </div>
      <ItemRenderer item={item} busy={busy} rec={rec} onSubmit={submit} />
      <button className="text-xs text-fg-muted underline" onClick={() => router.push('/assessments')}>
        Save &amp; continue later
      </button>
    </div>
  );
}

function ItemRenderer({ item, busy, rec, onSubmit }: {
  item: Item; busy: boolean; rec: ReturnType<typeof useRecorder>;
  onSubmit: (r: Record<string, unknown>) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [plays, setPlays] = useState(0);
  const [speed, setSpeed] = useState(1);
  const tts = useTts(speed);
  const speedUnlocked = plays > 0;

  const play = async () => {
    if (!item.audioText || plays >= 2) return;
    setPlays((p) => p + 1);
    await tts.speak(item.audioText);
  };

  // spoken upload: send blob to a throwaway assessment session → transcribe → submit
  const submitSpoken = async () => {
    if (!rec.blob) return;
    const s = await (await fetch('/api/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'assessment', tutorMode: 'conversation_partner', correctionMode: 'fluency' }),
    })).json();
    const fd = new FormData();
    fd.append('audio', rec.blob, 'answer.webm');
    const t = await (await fetch(`/api/sessions/${s.id}/turn`, { method: 'POST', body: fd })).json();
    const turnId = t?.learnerTurn?.id ?? null;
    const transcript = t?.learnerTurn?.text ?? '';
    await onSubmit({ text: transcript, turnId });
  };

  switch (item.type) {
    case 'mcq': case 'cloze': case 'listening_mcq':
      return (
        <div className="space-y-4">
          {item.passage && <pre className="whitespace-pre-wrap rounded-lg bg-surface p-4 text-sm">{item.passage}</pre>}
          {item.audioText && (
            <div className="flex items-center gap-3">
              <button onClick={play} disabled={plays >= 2} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">
                ▶ Play {plays > 0 ? `(played ${plays}/2)` : ''}
              </button>
              {speedUnlocked && (
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                  className="rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="playback speed">
                  {[0.75, 1, 1.15, 1.3].map((s) => <option key={s} value={s}>{s}×</option>)}
                </select>
              )}
            </div>
          )}
          <p className="text-sm font-medium">{item.prompt}</p>
          <div className="space-y-2" role="radiogroup" aria-label="options">
            {item.options?.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <input type="radio" name={item.slug} checked={selected === o} onChange={() => setSelected(o)} />
                {o}
              </label>
            ))}
          </div>
          <button disabled={!selected || busy} onClick={() => onSubmit({ selected })}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">
            Submit
          </button>
        </div>
      );
    case 'dictation':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={play} disabled={plays >= 2} className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40">
              ▶ Play {plays > 0 ? `(played ${plays}/2)` : ''}
            </button>
            {speedUnlocked && (
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="playback speed">
                {[0.75, 1, 1.15, 1.3].map((s) => <option key={s} value={s}>{s}×</option>)}
              </select>
            )}
          </div>
          <p className="text-sm">{item.prompt}</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm" placeholder="Type exactly what you heard" />
          <button disabled={!text.trim() || busy} onClick={() => onSubmit({ text })}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">Submit</button>
        </div>
      );
    case 'short': case 'writing':
      return (
        <div className="space-y-4">
          <p className="text-sm">{item.prompt}</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={item.type === 'writing' ? 8 : 4}
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
          <div className="text-xs text-fg-muted">{text.trim().split(/\s+/).filter(Boolean).length} words</div>
          <button disabled={!text.trim() || busy} onClick={() => onSubmit({ text })}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">Submit</button>
        </div>
      );
    default:
      // speaking / pronunciation / conversation / roleplay / storytelling / spontaneous
      return (
        <div className="space-y-4">
          {item.type === 'pronunciation' && item.audioText === undefined && item.prompt.startsWith('Say:') && (
            <button onClick={() => tts.speak(item.prompt.replace(/^Say: /, '').replace(/"/g, ''))}
              className="rounded-lg border border-border px-4 py-2 text-sm">▶ Listen first</button>
          )}
          <p className="text-sm">{item.prompt}</p>
          {item.timeLimitSec && <p className="text-xs text-fg-muted">Time limit ~{item.timeLimitSec}s</p>}
          <RecorderControls r={rec} />
          <button disabled={!rec.blob || busy} onClick={submitSpoken}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white disabled:opacity-40">
            Submit answer
          </button>
        </div>
      );
  }
}
