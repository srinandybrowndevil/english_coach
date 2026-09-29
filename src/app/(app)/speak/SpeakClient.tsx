'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { EvaluationPanel } from '@/components/voice/EvaluationPanel';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { DEBATE_TOPICS } from '@/content/debate-topics';
import { PRESENTATION_TOPICS } from '@/content/presentation-topics';
import type { SpeechEvaluation, SpeechMetrics } from '@/lib/types-eval';
import type { ScoreResult } from '@/lib/scoring/util';

type Mode = 'free' | 'topic' | 'rapid' | 'timed60' | 'timed120' | 'timed300' | 'story' | 'explain' | 'picture' | 'opinion';
const MODES: { id: Mode; label: string; prompt: string; seconds?: number }[] = [
  { id: 'free', label: 'Free Conversation', prompt: 'Talk about whatever is on your mind today.' },
  { id: 'topic', label: 'Topic Conversation', prompt: 'Pick a topic below and speak about it.' },
  { id: 'rapid', label: 'Rapid Response', prompt: '10 quick questions — 15 seconds each.' },
  { id: 'timed60', label: '60-Second Speak', prompt: 'Speak for one minute without stopping.', seconds: 60 },
  { id: 'timed120', label: '2-Minute Speak', prompt: 'Speak for two minutes — structure your points.', seconds: 120 },
  { id: 'timed300', label: '5-Minute Speak', prompt: 'A five-minute talk: open, develop, close.', seconds: 300 },
  { id: 'story', label: 'Storytelling', prompt: 'Tell a real story from your life — a problem, what you did, and how it ended.' },
  { id: 'explain', label: 'Explain It', prompt: 'Explain a technical or business concept as if to a smart non-expert.' },
  { id: 'picture', label: 'Picture Description', prompt: 'Upload a photo and describe it in detail.' },
  { id: 'opinion', label: 'Opinion Mode', prompt: 'Give your opinion on the topic — claim, evidence, conclusion.' },
];

const TOPICS = [
  ...PRESENTATION_TOPICS.slice(0, 9).map((t) => t.title),
  ...DEBATE_TOPICS.slice(0, 9).map((t) => t.topic),
];
const RAPID_QUESTIONS = [
  'What did you do last weekend?', 'Describe your typical morning.',
  'What is the best meal you have ever eaten?', 'Which app do you use most and why?',
  'What would you change about your job?', 'Tell me about your hometown.',
  'What are you reading or watching now?', 'Who do you admire and why?',
  'What skill would you like to learn?', 'What is your plan for tomorrow?',
];

export function SpeakClient() {
  const [mode, setMode] = useState<Mode>('free');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [customTopic, setCustomTopic] = useState('');
  const [rapidIdx, setRapidIdx] = useState(0);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [result, setResult] = useState<{ transcript: string; evaluation: SpeechEvaluation; scores: { fluency: ScoreResult; grammar: ScoreResult; vocabulary: ScoreResult } } | null>(null);
  const [lastMetrics, setLastMetrics] = useState<SpeechMetrics | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [englishOnly, setEnglishOnly] = useState(false);
  const recorder = useRecorder();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const modeDef = MODES.find((m) => m.id === mode)!;
  const prompt = mode === 'rapid' ? RAPID_QUESTIONS[rapidIdx]!
    : mode === 'topic' ? customTopic || topic
    : mode === 'picture' ? 'Describe the photo in detail — setting, people, objects, mood.'
    : modeDef.prompt;

  useEffect(() => {
    if (!sessionId) {
      fetch('/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'speak' }) })
        .then((r) => r.ok && r.json()).then((s) => s && setSessionId(s.id)).catch(() => {});
    }
  }, [sessionId]);

  const startTimed = () => {
    const secs = modeDef.seconds ?? 15;
    setSecondsLeft(secs);
    void recorder.start();
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null || s <= 1) { clearInterval(timerRef.current!); recorder.stop(); return 0; }
        return s - 1;
      });
    }, 1000);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const analyse = useCallback(async (blob: Blob) => {
    if (!sessionId) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const form = new FormData();
      form.set('audio', blob, 'answer.webm');
      const res = await fetch(`/api/sessions/${sessionId}/turn`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error === 'stt_failed' ? 'Could not hear that — try again or type below.' : 'Something failed — your audio is safe; retry.');
        return;
      }
      const evRes = await fetch(`/api/turns/${data.learnerTurn.id}/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskPrompt: prompt, register: 'professional', imageDataUrl }),
      });
      const ev = await evRes.json();
      if (!evRes.ok) { setError('Evaluation failed — retry the analysis.'); return; }
      setResult({ transcript: data.learnerTurn.text, ...ev });
      setLastMetrics(ev.metrics);
      if (mode === 'rapid' && rapidIdx < RAPID_QUESTIONS.length - 1) setRapidIdx(rapidIdx + 1);
    } catch {
      setError('Network error — your recording may not have uploaded; try again.');
    } finally {
      setBusy(false);
    }
  }, [sessionId, prompt, imageDataUrl, mode, rapidIdx]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={`rounded-xl border p-3 text-left text-sm ${mode === m.id ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900' : 'border-neutral-200 dark:border-neutral-800'}`}>
            {m.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5 dark:border-neutral-800">
        <h3 className="font-medium">{modeDef.label}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{prompt}</p>

        {mode === 'topic' && (
          <div className="mt-3 flex flex-wrap gap-2">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className="rounded border bg-transparent px-2 py-1 text-sm">
              {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="or your own topic…" className="rounded border bg-transparent px-2 py-1 text-sm" />
          </div>
        )}
        {mode === 'rapid' && <p className="mt-2 text-xs text-neutral-500">Question {rapidIdx + 1} of {RAPID_QUESTIONS.length}</p>}
        {mode === 'picture' && (
          <div className="mt-3">
            <input type="file" accept="image/*" capture="environment" className="text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const rd = new FileReader();
                rd.onload = () => setImageDataUrl(rd.result as string);
                rd.readAsDataURL(f);
              }} />
            {!imageDataUrl && <p className="mt-1 text-xs"><a className="underline" href="#" onClick={(e) => { e.preventDefault(); setMode('free'); }}>Describe your surroundings instead</a></p>}
          </div>
        )}

        {secondsLeft !== null && <p className="mt-3 text-3xl font-semibold tabular-nums">{secondsLeft}s</p>}

        <div className="mt-4">
          {(modeDef.seconds || mode === 'rapid') ? (
            recorder.status === 'idle' || recorder.status === 'stopped' ? (
              <button onClick={startTimed} className="rounded-xl bg-neutral-900 px-6 py-3 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
                Start {mode === 'rapid' ? 'answer' : `${modeDef.seconds}s`} recording
              </button>
            ) : null
          ) : null}
          <RecorderControls r={recorder} onSend={(b) => { analyse(b); recorder.reset(); }} />
        </div>
        <label className="mt-2 flex w-fit items-center gap-2 text-sm"><input type="checkbox" checked={englishOnly} onChange={(e) => setEnglishOnly(e.target.checked)} />English-only mode</label>
      </div>

      {busy && <p className="text-sm text-neutral-500">Analysing…</p>}
      {error && <p className="text-sm text-amber-600">{error}</p>}
      {result && (
        <EvaluationPanel data={result} metrics={lastMetrics}
          onTryAgain={() => { setResult(null); recorder.reset(); }}
          onNextChallenge={() => { setResult(null); recorder.reset(); if (mode === 'rapid' && rapidIdx < RAPID_QUESTIONS.length - 1) setRapidIdx(rapidIdx + 1); }} />
      )}
    </div>
  );
}
