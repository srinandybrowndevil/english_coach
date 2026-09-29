'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';
import { wordDiff, type WordDiff } from '@/lib/pronunciation/word-diff';
import type { ListeningScript } from '@/content/listening-scripts';
import { ACCENT_INSTRUCTIONS } from '@/content/listening-scripts';

const SPEEDS = [0.75, 1, 1.15, 1.3];
const PHASES = ['Listen', 'Questions', 'Transcript', 'Dictation', 'Summary'] as const;

export function ListeningClient({ scripts }: { scripts: ListeningScript[] }) {
  const [mode, setMode] = useState('all');
  const [cur, setCur] = useState<ListeningScript | null>(null);
  const modes = [...new Set(scripts.map((s) => s.mode))];
  const list = scripts.filter((s) => mode === 'all' || s.mode === mode);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Listening</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        <button onClick={() => setMode('all')} className={`rounded-full border px-3 py-1 ${mode === 'all' ? 'border-accent' : 'border-border'}`}>all modes</button>
        {modes.map((m) => <button key={m} onClick={() => setMode(m)} className={`rounded-full border px-3 py-1 ${mode === m ? 'border-accent' : 'border-border'}`}>{m.replace('listen-', '').replace(/-/g, ' ')}</button>)}
      </div>

      {!cur ? (
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.slug} className="flex items-center justify-between rounded-xl border border-border p-3">
              <div className="text-sm"><strong>{s.title}</strong>
                <span className="ml-2 text-xs text-fg-muted">{s.accent.replace(/-/g, ' ')}</span></div>
              <button onClick={() => setCur(s)} className="rounded bg-accent px-3 py-1.5 text-xs text-white">Start</button>
            </li>
          ))}
        </ul>
      ) : (
        <ScriptRunner script={cur} onDone={() => setCur(null)} />
      )}
    </div>
  );
}

function ScriptRunner({ script, onDone }: { script: ListeningScript; onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [plays, setPlays] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [missed, setMissed] = useState<Set<string>>(new Set());
  const [dictation, setDictation] = useState<string[]>(script.dictationTargets.map(() => ''));
  const [dictRes, setDictRes] = useState<WordDiff[]>([]);
  const [summary, setSummary] = useState('');
  const tts = useTts(speed);
  const rec = useRecorder();
  const [shadowRes, setShadowRes] = useState<WordDiff | null>(null);

  const fullText = script.lines.map((l) => `${l.speaker}: ${l.text}`).join(' ');
  const play = () => { setPlays((p) => p + 1); void tts.speak(fullText); };
  const accentLabel = script.accent.replace(/-/g, ' ');

  const finishDictation = () => {
    setDictRes(script.dictationTargets.map((t) => wordDiff(t, dictation[script.dictationTargets.indexOf(t)] ?? '')));
  };

  const shadow = async () => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 's.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    setShadowRes(wordDiff(script.dictationTargets[0] ?? script.lines[0]!.text, t?.text ?? ''));
  };

  const save = async () => {
    const score = dictRes.length ? Math.round(dictRes.reduce((a, d) => a + d.accuracy, 0) / dictRes.length * 100) : null;
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseSlug: `listening:${script.slug}`,
        payload: { plays, speed, missed: [...missed], dictationAccuracy: score, summary },
      }),
    });
    await fetch('/api/skills/attempt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillSlug: 'listening-comprehension', correct: (score ?? 0) >= 60, context: `listening:${script.mode}` }),
    });
    onDone();
  };

  return (
    <div className="space-y-4 rounded-xl border border-accent/40 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{script.title} <span className="text-xs font-normal text-fg-muted">accent: {accentLabel}</span></h2>
        <button onClick={onDone} className="text-xs text-fg-muted underline">← back</button>
      </div>
      <p className="text-xs text-fg-muted">{ACCENT_INSTRUCTIONS[script.accent]}</p>

      <div className="flex items-center gap-2">
        {PHASES.map((p, i) => (
          <span key={p} className={`rounded-full px-2 py-0.5 text-xs ${i === phase ? 'bg-accent text-white' : 'bg-surface text-fg-muted'}`}>{i + 1}. {p}</span>
        ))}
      </div>

      {phase === 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button onClick={play} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">▶ Play {plays > 0 && `(${plays})`}</button>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded border border-border bg-bg px-2 py-1 text-sm" aria-label="playback speed">
              {SPEEDS.map((s) => <option key={s} value={s}>{s}×</option>)}
            </select>
          </div>
          <p className="text-xs text-fg-muted">Listen first without the text. Replays are counted.</p>
          <button onClick={() => setPhase(1)} className="text-sm text-accent underline">Continue →</button>
        </div>
      )}

      {phase === 1 && (
        <div className="space-y-3">
          {script.questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-border p-3">
              <p className="text-sm font-medium">{q.q}</p>
              {q.options ? (
                <div className="mt-1 space-y-1">
                  {q.options.map((o) => (
                    <label key={o} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`q${qi}`} checked={answers[qi] === o} onChange={() => setAnswers((a) => ({ ...a, [qi]: o }))} />
                      {o}
                      {answers[qi] === o && <span className={`text-xs ${o === q.answer ? 'text-green-700' : 'text-amber-700'}`}>{o === q.answer ? '✓' : `✗ (${q.answer})`}</span>}
                    </label>
                  ))}
                </div>
              ) : (
                <input value={answers[qi] ?? ''} onChange={(e) => setAnswers((a) => ({ ...a, [qi]: e.target.value }))}
                  className="mt-1 w-full rounded border border-border bg-bg px-2 py-1 text-sm" placeholder="Your answer" />
              )}
            </div>
          ))}
          <button onClick={play} className="text-sm underline">▶ Listen again</button>
          <button onClick={() => setPhase(2)} className="ml-3 text-sm text-accent underline">Reveal transcript →</button>
        </div>
      )}

      {phase === 2 && (
        <div className="space-y-2">
          {script.lines.map((l, li) => (
            <p key={li} className="text-sm"><strong>{l.speaker}:</strong> {l.text.split(/\s+/).map((w) => (
              <button key={w + li} onClick={() => { const s = new Set(missed); if (s.has(w)) s.delete(w); else s.add(w); setMissed(s); }}
                className={`mr-0.5 rounded px-0.5 ${missed.has(w) ? 'bg-amber-200 text-amber-900' : ''}`}>{w}</button>
            ))}</p>
          ))}
          <p className="text-xs text-fg-muted">Tap any word you missed — they&rsquo;re saved to your listening profile.</p>
          <button onClick={() => setPhase(3)} className="text-sm text-accent underline">Dictation →</button>
        </div>
      )}

      {phase === 3 && (
        <div className="space-y-3">
          {script.dictationTargets.map((t, di) => (
            <div key={di}>
              <button onClick={() => tts.speak(t)} className="text-xs rounded border border-border px-2 py-1">▶ Sentence {di + 1}</button>
              <textarea value={dictation[di]} onChange={(e) => setDictation((d) => { const c = [...d]; c[di] = e.target.value; return c; })}
                rows={2} className="mt-1 w-full rounded-lg border border-border bg-bg p-2 text-sm" />
              {dictRes[di] && (
                <p className="text-xs text-fg-muted">accuracy {Math.round(dictRes[di]!.accuracy * 100)}%
                  {dictRes[di]!.skipped.length ? ` — skipped: ${dictRes[di]!.skipped.join(', ')}` : ''}</p>
              )}
            </div>
          ))}
          <button onClick={finishDictation} className="rounded bg-accent px-4 py-2 text-sm text-white">Check dictation</button>
          <button onClick={() => setPhase(4)} className="ml-3 text-sm text-accent underline">Summary →</button>
        </div>
      )}

      {phase === 4 && (
        <div className="space-y-3">
          <p className="text-sm">Summarise what you heard (type or speak):</p>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3}
            className="w-full rounded-lg border border-border bg-bg p-2 text-sm" />
          <p className="text-xs text-fg-muted">Reference summary: {script.summaryReference}</p>
          <div className="rounded-lg border border-border p-3">
            <p className="mb-1 text-xs font-medium text-fg-muted">Shadowing — repeat the key sentence:</p>
            <p className="text-sm">{script.dictationTargets[0] ?? script.lines[0]!.text}</p>
            <RecorderControls r={rec} />
            <button onClick={shadow} disabled={!rec.blob} className="mt-1 rounded bg-accent px-3 py-1.5 text-xs text-white disabled:opacity-40">Compare</button>
            {shadowRes && (
              <p className="mt-1 text-xs text-fg-muted">
                word match {Math.round(shadowRes.accuracy * 100)}%
                {shadowRes.skipped.length ? ` — missed: ${shadowRes.skipped.join(', ')}` : ''}
              </p>
            )}
          </div>
          <button onClick={save} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white">Finish & save</button>
        </div>
      )}
    </div>
  );
}
