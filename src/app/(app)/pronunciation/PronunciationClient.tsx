'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';
import type { SoundContrast, IpaModule } from '@/content/pronunciation';
import type { SkillStatus } from '@/lib/learning/skills';

// Shared drill: listen → record → STT → notes (low confidence label, §52).
export function PronDrill({ target, skillSlug, context }: { target: string; skillSlug: string; context: string }) {
  const rec = useRecorder();
  const tts = useTts();
  const [out, setOut] = useState<{ notes: string[]; confidence: string } | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (!rec.blob) return;
    setBusy(true);
    const fd = new FormData(); fd.append('audio', rec.blob, 'pron.webm');
    const stt = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    const text: string = stt?.text ?? '';
    setTranscript(text);
    const res = await fetch('/api/pronunciation/analyse', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: text, target }),
    });
    const data = await res.json();
    setOut(data);
    // attempt record (difficult-word tracking + skill attempts)
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        exerciseSlug: `pron:${context}:${target.slice(0, 40)}`,
        payload: { target, transcript: text, mismatch: text.trim().toLowerCase() !== target.trim().toLowerCase() },
      }),
    }).catch(() => {});
    setBusy(false);
  };

  const markMastered = async () => {
    if (!skillSlug) return;
    await fetch('/api/skills/attempt', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillSlug, correct: true, context: `pronunciation:${context}` }),
    });
  };

  return (
    <div className="rounded-lg border border-border p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{target}</p>
        <button onClick={() => tts.speak(target)} className="text-xs rounded border border-border px-2 py-1">▶ Listen</button>
      </div>
      <RecorderControls r={rec} />
      {rec.blob && (
        <div className="flex gap-2">
          <audio src={URL.createObjectURL(rec.blob)} controls className="h-8" aria-label="Your recording" />
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={check} disabled={!rec.blob || busy}
          className="rounded bg-accent px-3 py-1.5 text-xs text-white disabled:opacity-40">
          {busy ? 'Checking…' : 'Check'}
        </button>
        <button onClick={() => { rec.reset(); setOut(null); setTranscript(null); }} className="text-xs text-fg-muted underline">Retry</button>
        {skillSlug && <button onClick={markMastered} className="text-xs text-fg-muted underline">Mark mastered</button>}
      </div>
      {transcript !== null && <p className="text-xs text-fg-muted">Heard: “{transcript}”</p>}
      {out && (
        <div className="rounded bg-surface p-3 text-sm">
          <p className="text-xs text-fg-muted">Text-based estimate (low confidence)</p>
          <ul className="list-inside list-disc">{out.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
    </div>
  );
}

const TABS = ['Sound Lab', 'Minimal Pairs', 'Word Practice', 'Sentence Practice', 'Stress', 'IPA', 'Difficult Words', 'Saved Errors'] as const;

export function PronunciationClient({ contrasts, ipaModules, attempts, savedErrors, statuses }: {
  contrasts: SoundContrast[]; ipaModules: IpaModule[];
  attempts: { target: string; count: number }[];
  savedErrors: { id: string; label: string }[];
  statuses: Record<string, SkillStatus>;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Sound Lab');
  const [contrast, setContrast] = useState(contrasts[0]!);
  const [stressPick, setStressPick] = useState<Record<string, number>>({});
  const [ipaQuiz, setIpaQuiz] = useState<Record<string, boolean>>({});
  const tts = useTts();

  const ipaUnlocked = (order: number) =>
    order === 1 || !!ipaQuiz[ipaModules[order - 2]?.slug ?? ''];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold">Pronunciation</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full border px-3 py-1 ${tab === t ? 'border-accent bg-accent/10' : 'border-border'}`}>{t}</button>
        ))}
      </div>

      {tab !== 'IPA' && tab !== 'Difficult Words' && tab !== 'Saved Errors' && (
        <select value={contrast.slug} onChange={(e) => setContrast(contrasts.find((c) => c.slug === e.target.value)!)}
          className="rounded border border-border bg-bg px-2 py-1 text-sm">
          {contrasts.map((c) => <option key={c.slug} value={c.slug}>{c.title} — {statuses[c.slug] ?? 'unseen'}</option>)}
        </select>
      )}

      {tab === 'Sound Lab' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-surface p-4">
            <h2 className="font-semibold">{contrast.title} — {contrast.ipa.join(' vs ')}</h2>
            <p className="mt-1 text-sm text-fg-muted">{contrast.articulation}</p>
          </div>
          {contrast.sentences.map((s) => <PronDrill key={s} target={s} skillSlug={contrast.slug} context={contrast.slug} />)}
        </div>
      )}

      {tab === 'Minimal Pairs' && (
        <div className="space-y-3">
          {contrast.minimalPairs.map(([a, b]) => (
            <div key={a} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
              <span>{a} / {b}</span>
              <button onClick={() => tts.speak(a)} className="text-xs rounded border px-2 py-1">Listen A</button>
              <button onClick={() => tts.speak(b)} className="text-xs rounded border px-2 py-1">Listen B</button>
              <PronDrill target={`${a} ${b}`} skillSlug={contrast.slug} context={`pair:${a}-${b}`} />
            </div>
          ))}
        </div>
      )}

      {tab === 'Word Practice' && (
        <div className="grid gap-3 md:grid-cols-2">
          {contrast.practiceWords.map((w) => (
            <div key={w.word} className="rounded-lg border border-border p-3">
              <p className="font-medium">{w.word} <span className="text-xs text-fg-muted">/{w.ipa}/</span></p>
              <PronDrill target={w.word} skillSlug={contrast.slug} context={`word:${w.word}`} />
            </div>
          ))}
        </div>
      )}

      {tab === 'Sentence Practice' && (
        <div className="space-y-3">{contrast.sentences.map((s) => <PronDrill key={s} target={s} skillSlug={contrast.slug} context="sentence" />)}</div>
      )}

      {tab === 'Stress' && (
        <div className="space-y-3">
          {contrast.practiceWords.filter((w) => w.syllables > 1).map((w) => {
            const picked = stressPick[w.word];
            return (
              <div key={w.word} className="rounded-lg border border-border p-3 text-sm">
                <p>Tap the stressed syllable of <strong>{w.word}</strong> ({w.ipa})</p>
                <div className="mt-1 flex gap-2">
                  {Array.from({ length: w.syllables }).map((_, i) => (
                    <button key={i} onClick={() => setStressPick((s) => ({ ...s, [w.word]: i }))}
                      className={`rounded border px-3 py-1 ${picked === i ? (i === w.stress ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50') : 'border-border'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
                {picked !== undefined && (
                  <p className={`mt-1 text-xs ${picked === w.stress ? 'text-green-700' : 'text-amber-700'}`}>
                    {picked === w.stress ? '✓ Correct' : `✗ The stress is on syllable ${w.stress + 1}`}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'IPA' && (
        <div className="space-y-4">
          {ipaModules.map((m) => {
            const locked = !ipaUnlocked(m.order);
            return (
              <div key={m.slug} className={`rounded-xl border border-border p-4 ${locked ? 'opacity-50' : ''}`}>
                <h2 className="font-semibold">{m.order}. {m.title} {locked && '🔒 pass the previous module quiz'}</h2>
                {!locked && (
                  <>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {m.symbols.map((s) => (
                        <div key={s.symbol} className="rounded bg-surface p-2 text-sm">
                          <span className="text-lg">{s.symbol}</span>
                          <button onClick={() => tts.speak(s.exampleWord)} className="ml-2 text-xs underline">▶</button>
                          <div className="text-xs text-fg-muted">{s.exampleWord} — {s.exampleIpa}</div>
                          <div className="text-xs text-fg-muted">{s.note}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-fg-muted">Quick check: which symbol is in “{m.symbols[0]!.exampleWord}”?</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {[m.symbols[0]!.symbol, ...ipaModules.flatMap((x) => x.symbols.map((y) => y.symbol)).filter((s) => s !== m.symbols[0]!.symbol).slice(0, 3)].map((sym) => (
                          <button key={sym}
                            onClick={async () => {
                              const ok = sym === m.symbols[0]!.symbol;
                              setIpaQuiz((q) => ({ ...q, [m.slug]: ok }));
                              await fetch('/api/exercise-attempts', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ exerciseSlug: `ipa-quiz:${m.slug}`, payload: { passed: ok } }),
                              });
                            }}
                            className={`rounded border px-3 py-1 text-lg ${ipaQuiz[m.slug] !== undefined ? (sym === m.symbols[0]!.symbol ? 'border-green-500' : 'border-border') : 'border-border'}`}>
                            {sym}
                          </button>
                        ))}
                      </div>
                      {ipaQuiz[m.slug] === true && <p className="mt-1 text-xs text-green-700">✓ Module passed — next module unlocked.</p>}
                      {ipaQuiz[m.slug] === false && <p className="mt-1 text-xs text-amber-700">Try again — listen to the example word.</p>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'Difficult Words' && (
        <ul className="space-y-1 text-sm">
          {attempts.map((a) => <li key={a.target} className="flex justify-between rounded bg-surface px-3 py-2"><span>{a.target}</span><span className="text-xs text-fg-muted">×{a.count}</span></li>)}
          {!attempts.length && <li className="text-fg-muted">Nothing yet — words the STT hears differently will appear here.</li>}
        </ul>
      )}

      {tab === 'Saved Errors' && (
        <ul className="space-y-1 text-sm">
          {savedErrors.map((e) => <li key={e.id} className="rounded bg-surface px-3 py-2">{e.label}</li>)}
          {!savedErrors.length && <li className="text-fg-muted">No saved pronunciation patterns yet.</li>}
        </ul>
      )}
    </div>
  );
}
