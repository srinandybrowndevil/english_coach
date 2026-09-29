'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { containsTamil, distinctNouns } from '@/lib/learning/tamil';

const CATEGORIES = ['kitchen items', 'things in an office', 'animals', 'food', 'verbs of motion', 'colours', 'parts of a car'];
const BEATS = [['a stranger', 'a locked door', 'a ringing phone'], ['a lost key', 'a crowded market', 'an apology']];

export function ThinkLabClient({ drills }: { drills: { slug: string; label: string; hint: string; category?: boolean }[] }) {
  const [drill, setDrill] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [beats, setBeats] = useState<string[]>([]);
  const [result, setResult] = useState<{ text: string; nouns: number; tamil: boolean } | null>(null);
  const rec = useRecorder();



  const pickDrill = (slug: string) => {
    setDrill(slug); setResult(null); rec.reset();
    const rand = () => Math.random(); // event handler — purity ok (not render)
    if (slug === 'rapid-naming') setCategory(CATEGORIES[Math.floor(rand() * CATEGORIES.length)]!);
    if (slug === 'storytelling-beats') setBeats(BEATS[Math.floor(rand() * BEATS.length)]!);
  };

  const analyse = async () => {
    if (!rec.blob || !drill) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 't.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    const text: string = t?.text ?? '';
    const tamil = containsTamil(text);
    setResult({ text, nouns: drill === 'rapid-naming' ? distinctNouns(text) : 0, tamil });
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseSlug: `think:${drill}`, payload: { text, tamil, nouns: drill === 'rapid-naming' ? distinctNouns(text) : undefined } }),
    });
    rec.reset();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Think in English</h1>
      <p className="text-sm text-fg-muted">English only — if Tamil slips in, the drill tells you and you retry with a recovery phrase.</p>
      {!drill ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {drills.map((d) => (
            <li key={d.slug}>
              <button onClick={() => pickDrill(d.slug)} className="w-full rounded-xl border border-border p-4 text-left hover:bg-surface">
                <p className="font-medium">{d.label}</p>
                <p className="text-sm text-fg-muted">{d.hint}</p>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-3">
          <button onClick={() => setDrill(null)} className="text-xs text-fg-muted underline">← drills</button>
          {drill === 'rapid-naming' && <p className="rounded bg-surface p-3 text-sm">Category: <strong>{category}</strong></p>}
          {drill === 'storytelling-beats' && <p className="rounded bg-surface p-3 text-sm">Include: <strong>{beats.join(' · ')}</strong></p>}
          <RecorderControls r={rec} />
          {rec.blob && <button onClick={analyse} className="rounded bg-accent px-4 py-2 text-sm text-white">Analyse</button>}
          {result && (
            <div className="rounded-xl border border-border p-4 text-sm space-y-1">
              {result.tamil ? (
                <p className="text-amber-700">Tamil slipped in — English only, try again with a recovery phrase.</p>
              ) : (
                <>
                  <p>Heard: “{result.text}”</p>
                  {drill === 'rapid-naming' && <p><strong>{result.nouns}</strong> distinct words — target ≥10</p>}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
