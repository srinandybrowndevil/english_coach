'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EvaluationPanel } from '@/components/voice/EvaluationPanel';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { ScoreCard } from '@/components/voice/ScoreCard';
import { useRecorder } from '@/hooks/useRecorder';
import { PRECISION_MAP } from '@/content/precision';
import { RECOVERY } from '@/content/recovery';
import type { SpeechEvaluation, SpeechMetrics } from '@/lib/types-eval';
import type { ScoreResult } from '@/lib/scoring/util';

type Focus = 'fillers' | 'keywords' | 'recovery' | 'precision' | 'rate' | 'none';
type Exercise = {
  slug: string; title: string; prompt: () => { text: string; keywords?: string[]; target?: string };
  seconds: number; focus: Focus; tip: string;
};

const QUESTIONS = [
  'Describe your morning routine.', 'Explain your job to a ten-year-old.',
  'What makes a good leader?', 'Describe the last problem you solved.',
  'Talk about a decision you regret and what you learned.',
];

const KEYWORD_SETS = [
  ['deadline', 'negotiate', 'budget', 'deliver'],
  ['customer', 'frustrated', 'resolve', 'follow-up'],
  ['risk', 'opportunity', 'decide', 'consequence'],
  ['team', 'conflict', 'listen', 'agree'],
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export const EXERCISES: Exercise[] = [
  { slug: 'no-filler', title: 'No-Filler Challenge', focus: 'fillers', seconds: 60,
    prompt: () => ({ text: `Speak for 60 seconds about: ${pick(QUESTIONS)} Goal: zero filler words.` }),
    tip: 'Silence is allowed — pauses are free, fillers are not.' },
  { slug: 'keywords', title: 'Speak from Keywords', focus: 'keywords', seconds: 60,
    prompt: () => { const k = pick(KEYWORD_SETS); return { text: `Use all four words naturally in 60 seconds: ${k.join(', ')}`, keywords: k }; },
    tip: 'Check off each keyword as you use it.' },
  { slug: 'precision', title: 'Precision Upgrade', focus: 'precision', seconds: 45,
    prompt: () => { const p = pick(PRECISION_MAP); return { text: `The vague word is "${p.vague}". Speak for 45 seconds using precise alternatives like: ${p.precise.slice(0, 3).join(', ')} — never say "${p.vague}".`, target: p.vague }; },
    tip: 'Specific beats strong.' },
  { slug: 'recovery', title: 'Recovery Drill', focus: 'recovery', seconds: 60,
    prompt: () => { const r = pick(RECOVERY); return { text: `Talk for 60 seconds and deliberately use at least two recovery phrases like: ${r.phrases.slice(0, 3).join(' / ')}` }; },
    tip: 'Practise rescuing yourself, not being perfect.' },
  { slug: 'one-minute', title: 'One-Minute Answer', focus: 'none', seconds: 60,
    prompt: () => ({ text: `Answer in exactly one minute: ${pick(QUESTIONS)}` }),
    tip: 'Open → point → example → close.' },
  { slug: 'rapid-fire', title: 'Rapid Fire', focus: 'rate', seconds: 15,
    prompt: () => ({ text: `You have 15 seconds. Go: ${pick(QUESTIONS)}` }),
    tip: 'Start speaking immediately — thinking time is the enemy.' },
  { slug: 'two-minute-story', title: 'Two-Minute Story', focus: 'none', seconds: 120,
    prompt: () => ({ text: 'Tell a true story in two minutes: situation → complication → resolution.' }),
    tip: 'Use past simple for events, past continuous for background.' },
  { slug: 'pause-power', title: 'Pause Power', focus: 'fillers', seconds: 60,
    prompt: () => ({ text: 'Answer this question slowly, with deliberate pauses instead of fillers: What is the hardest thing about your work?' }),
    tip: 'Count a silent beat instead of "um".' },
  { slug: 'retell', title: 'Retell It Better', focus: 'precision', seconds: 90,
    prompt: () => ({ text: 'Describe your day so far — then in a second attempt, tell it again more precisely, with better verbs.' }),
    tip: 'Second version should drop weak verbs (was, did, had).' },
  { slug: 'question-barrage', title: 'Question Barrage', focus: 'none', seconds: 60,
    prompt: () => ({ text: 'In 60 seconds, ask as many different kinds of questions as you can about your business — wh-, yes/no, hypothetical, rhetorical.' }),
    tip: 'Question word order is the test: "Why DID it fail?" not "Why it failed?"' },
];

function focusFeedback(e: Exercise, m: SpeechMetrics, keywords?: string[]): string | null {
  if (e.focus === 'fillers')
    return m.fillerCount === 0 ? 'Clean — zero fillers.' : `${m.fillerCount} fillers (${Object.entries(m.fillers).map(([f, n]) => `"${f}"×${n}`).join(', ')}). Try again — pauses are free.`;
  if (e.focus === 'keywords' && keywords) {
    const said = (m as unknown as { transcript?: string }).transcript ?? '';
    const used = keywords.filter((k) => said.toLowerCase().includes(k));
    return used.length === keywords.length ? 'All keywords used.' : `Used ${used.length}/${keywords.length}: missed ${keywords.filter((k) => !used.includes(k)).join(', ')}`;
  }
  if (e.focus === 'recovery')
    return m.selfCorrectionCount > 0 ? `${m.selfCorrectionCount} recovery moves spotted.` : 'No recovery phrases detected — deliberately use one next time.';
  if (e.focus === 'rate')
    return `Speaking rate: ${Math.round(m.wordsPerMinute)} wpm ${m.wordsPerMinute >= 120 ? '— good pace.' : '— push a little faster.'}`;
  return null;
}

export function FluencyClient() {
  const [ex, setEx] = useState<Exercise | null>(null);
  const [prompt, setPrompt] = useState<{ text: string; keywords?: string[]; target?: string } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [result, setResult] = useState<{ transcript: string; evaluation: SpeechEvaluation; scores: { fluency: ScoreResult; grammar: ScoreResult; vocabulary: ScoreResult } } | null>(null);
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [transcript, setTranscript] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bests, setBests] = useState<Record<string, number>>({});
  const recorder = useRecorder();

  useEffect(() => {
    fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'fluency' }) })
      .then((r) => r.ok && r.json()).then((s) => s && setSessionId(s.id)).catch(() => {});
    fetch('/api/exercise-attempts').then((r) => r.ok && r.json()).then((rows: { slug: string; payload: { score?: number } }[]) => {
      const b: Record<string, number> = {};
      for (const r of rows) if (typeof r.payload?.score === 'number') b[r.slug] = Math.max(b[r.slug] ?? 0, r.payload.score);
      setBests(b);
    }).catch(() => {});
  }, []);

  const begin = (e: Exercise) => { setEx(e); setPrompt(e.prompt()); setResult(null); setMetrics(null); setError(null); };

  const analyse = useCallback(async (blob: Blob) => {
    if (!sessionId || !ex) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const form = new FormData(); form.set('audio', blob, 'fluency.webm');
      const res = await fetch(`/api/sessions/${sessionId}/turn`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { setError('Could not hear that — try again.'); return; }
      setTranscript(data.learnerTurn.text);
      const evRes = await fetch(`/api/turns/${data.learnerTurn.id}/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskPrompt: prompt?.text ?? ex.title, register: 'neutral' }),
      });
      const ev = await evRes.json();
      if (!evRes.ok) { setError('Evaluation failed.'); return; }
      setResult({ transcript: data.learnerTurn.text, ...ev });
      setMetrics(ev.metrics);
      const score = ev.scores?.fluency?.total ?? 0;
      fetch('/api/exercise-attempts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exerciseSlug: ex.slug, title: ex.title, payload: { score, metrics: ev.metrics } }),
      }).catch(() => {});
      setBests((b) => ({ ...b, [ex.slug]: Math.max(b[ex.slug] ?? 0, score) }));
    } catch {
      setError('Network error — try again.');
    } finally {
      setBusy(false);
    }
  }, [sessionId, ex, prompt]);

  const feedback = useMemo(() => {
    if (!ex || !metrics) return null;
    return focusFeedback(ex, metrics, prompt?.keywords);
  }, [ex, metrics, prompt]);

  if (!ex) {
    return (
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {EXERCISES.map((e) => (
          <button key={e.slug} onClick={() => begin(e)} className="rounded-2xl border border-neutral-200 p-4 text-left dark:border-neutral-800">
            <div className="flex items-baseline justify-between">
              <h3 className="font-medium">{e.title}</h3>
              <span className="text-xs text-neutral-500">{e.seconds}s{bests[e.slug] != null ? ` · best ${bests[e.slug]}` : ''}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">{e.tip}</p>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <button onClick={() => setEx(null)} className="w-fit text-sm underline">← All exercises</button>
      <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h3 className="font-medium">{ex.title} <span className="text-xs font-normal text-neutral-500">({ex.seconds}s)</span></h3>
        <p className="mt-2 text-sm">{prompt?.text}</p>
        <p className="mt-1 text-xs text-neutral-500">{ex.tip}</p>
        <div className="mt-4"><RecorderControls r={recorder} onSend={(b) => { analyse(b); recorder.reset(); }} /></div>
      </div>
      {busy && <p className="text-sm text-neutral-500">Analysing…</p>}
      {error && <p className="text-sm text-amber-600">{error}</p>}
      {feedback && <p className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">{feedback}</p>}
      {result && (
        <EvaluationPanel data={result} metrics={metrics}
          onTryAgain={() => { setResult(null); recorder.reset(); }}
          onNextChallenge={() => { setEx(null); recorder.reset(); }} />
      )}
      {result && <ScoreCard title="Fluency" result={result.scores.fluency} />}
      <p className="text-xs text-neutral-500">Transcript: {transcript || '—'}</p>
    </div>
  );
}
