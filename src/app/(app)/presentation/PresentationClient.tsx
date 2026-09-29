'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { PresentationTopic } from '@/content/presentation-topics';
import type { PresentationEvaluation } from '@/lib/evaluation/schemas';
import type { ScoreResult } from '@/lib/scoring/util';
import { ScoreCard } from '@/components/voice/ScoreCard';

const TIMERS = [60, 120, 180, 300, 600];

export function PresentationClient({ topics, modes }: { topics: PresentationTopic[]; modes: string[] }) {
  const [mode, setMode] = useState(modes[0]!);
  const [topic, setTopic] = useState(topics.find((t) => t.mode === modes[0])!);
  const [targetSec, setTargetSec] = useState(120);
  const [notes, setNotes] = useState('');
  const [phase, setPhase] = useState<'setup' | 'record' | 'result'>('setup');
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState<{ evaluation: PresentationEvaluation; score: ScoreResult; metrics: { wordsPerMinute: number; fillerCount: number; longPauseCount: number } } | null>(null);
  const rec = useRecorder();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const begin = () => {
    setPhase('record'); setRemaining(targetSec);
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { clearInterval(timerRef.current!); rec.stop(); setPhase('result'); return 0; }
        return r - 1;
      });
    }, 1000);
    void rec.start();
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const evaluate = async () => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 'p.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    const res = await fetch('/api/presentation/evaluate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: t?.text ?? '', mode: topic.mode, targetSec }),
    });
    if (res.ok) setResult(await res.json());
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Presentation</h1>
        <Link href="/presentation/techniques" className="text-sm text-accent underline">Public-speaking techniques →</Link>
      </div>

      {phase === 'setup' && (
        <>
          <select value={mode} onChange={(e) => { setMode(e.target.value); setTopic(topics.find((t) => t.mode === e.target.value)!); }}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm">
            {modes.map((m) => <option key={m}>{m.replace(/-/g, ' ')}</option>)}
          </select>
          <select value={topic.slug} onChange={(e) => setTopic(topics.find((t) => t.slug === e.target.value)!)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm">
            {topics.filter((t) => t.mode === mode).map((t) => <option key={t.slug} value={t.slug}>{t.title}</option>)}
          </select>
          <p className="text-sm text-fg-muted">{topic.brief}</p>
          <div className="flex items-center gap-2 text-sm">
            Timer: {TIMERS.map((t) => (
              <button key={t} onClick={() => setTargetSec(t)}
                className={`rounded-full border px-3 py-1 text-xs ${targetSec === t ? 'border-accent' : 'border-border'}`}>{t / 60}m</button>
            ))}
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
            placeholder="Outline notes (bullets only — not a script)"
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
          <button onClick={begin} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white">Start recording</button>
        </>
      )}

      {phase === 'record' && (
        <div className="rounded-xl border border-accent/40 p-4 text-center">
          <p className="text-4xl font-bold tabular-nums">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</p>
          <p className="text-sm text-fg-muted">Recording… auto-stops at the timer (+10 s grace)</p>
          <RecorderControls r={rec} />
        </div>
      )}

      {phase === 'result' && (
        <div className="space-y-4">
          {!result ? (
            <button onClick={evaluate} className="rounded-lg bg-accent px-5 py-2 text-sm text-white">Evaluate</button>
          ) : (
            <>
              <ScoreCard title="Presentation" result={result.score} />
              <p className="text-xs text-fg-muted">
                Observable delivery signals — not a measure of confidence:
                wpm {result.metrics.wordsPerMinute.toFixed(0)} · fillers {result.metrics.fillerCount} · long pauses {result.metrics.longPauseCount}
              </p>
              <p className="text-sm">{result.evaluation.retryInstruction}</p>
            </>
          )}
          <button onClick={() => { setPhase('setup'); setResult(null); rec.reset(); }} className="text-sm text-fg-muted underline">New presentation</button>
        </div>
      )}
    </div>
  );
}
