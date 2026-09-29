'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';
import { wordDiff, type WordDiff } from '@/lib/pronunciation/word-diff';
import type { Twister } from '@/content/tongue-twisters';

// §13 — Listen → Slow → Medium → Normal → Fast → Accuracy challenge.
export function TwisterClient({ twisters, bests }: { twisters: Twister[]; bests: Record<string, number> }) {
  const [cat, setCat] = useState<string>('all');
  const [diff, setDiff] = useState(0);
  const [current, setCurrent] = useState<Twister | null>(null);
  const [result, setResult] = useState<(WordDiff & { wpm: number }) | null>(null);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const rec = useRecorder();

  const cats = [...new Set(twisters.map((t) => t.category))];
  const list = twisters.filter((t) => (cat === 'all' || t.category === cat) && (!diff || t.difficulty === diff));

  const challenge = async () => {
    if (!rec.blob || !current) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 't.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    const d = wordDiff(current.text, t?.text ?? '');
    const wpm = rec.durationMs > 0 ? Math.round((d.matched / (rec.durationMs / 60000))) : 0;
    setResult({ ...d, wpm });
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseSlug: `twister:${current.slug}`,
        payload: { accuracy: d.accuracy, wpm, skipped: d.skipped, durationMs: rec.durationMs },
      }),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Tongue twisters</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => setCat('all')} className={`rounded-full border px-3 py-1 ${cat === 'all' ? 'border-accent' : 'border-border'}`}>all</button>
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 ${cat === c ? 'border-accent' : 'border-border'}`}>{c}</button>)}
        <span className="text-fg-muted">|</span>
        {[1, 2, 3, 4, 5].map((d) => <button key={d} onClick={() => setDiff(diff === d ? 0 : d)} className={`rounded-full border px-3 py-1 ${diff === d ? 'border-accent' : 'border-border'}`}>★{d}</button>)}
      </div>

      {!current ? (
        <ul className="space-y-2">
          {list.map((t) => (
            <li key={t.slug} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="text-sm">{t.text} <span className="text-xs text-fg-muted">({t.category}, {t.targetSounds.join('/')})</span></div>
              <div className="flex items-center gap-2">
                {bests[t.slug] !== undefined && <span className="text-xs text-fg-muted">best {Math.round(bests[t.slug]! * 100)}%</span>}
                <button onClick={() => setCurrent(t)} className="rounded bg-accent px-3 py-1.5 text-xs text-white">Practise</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-accent/40 p-4 space-y-4">
          <p className="text-lg font-medium">{current.text}</p>
          <div className="flex flex-wrap gap-2">
            {([['Listen', 1], ['Slow', 0.75], ['Medium', 0.9], ['Normal', 1.0], ['Fast', 1.2]] as [string, number][]).map(([label, speed]) => (
              <SpeedButton key={label} label={label} speed={speed} text={current.text} />
            ))}
          </div>
          <p className="text-xs text-fg-muted">Accuracy challenge — record yourself at any speed:</p>
          <RecorderControls r={rec} />
          <div className="flex gap-2">
            <button onClick={challenge} disabled={!rec.blob} className="rounded bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Score me</button>
            <button onClick={() => { setSaved((s) => ({ ...s, [current.slug]: true })); }}
              className="text-sm text-fg-muted underline">{saved[current.slug] ? 'Saved ✓' : 'Save for Practice'}</button>
            <button onClick={() => { setCurrent(null); setResult(null); rec.reset(); }} className="text-sm text-fg-muted underline">Back</button>
          </div>
          {result && (
            <div className="rounded bg-surface p-3 text-sm space-y-1">
              <p>Accuracy: <strong>{Math.round(result.accuracy * 100)}%</strong> · {result.wpm} wpm</p>
              {!!result.skipped.length && <p className="text-xs text-amber-700">Skipped: {result.skipped.join(', ')}</p>}
              {!!result.substituted.length && <p className="text-xs text-amber-700">Heard differently: {result.substituted.map((s) => `${s.expected}→${s.heard}`).join(', ')}</p>}
              <p className="text-xs text-fg-muted">Problem sounds to review: {[...new Set(current.targetSounds)].join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SpeedButton({ label, speed, text }: { label: string; speed: number; text: string }) {
  const tts = useTts(speed);
  return (
    <button onClick={() => tts.speak(text)} className="rounded border border-border px-3 py-1.5 text-xs hover:bg-surface">
      {label} {speed !== 1 ? `${speed}×` : ''}
    </button>
  );
}
