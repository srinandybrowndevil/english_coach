'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { TranscriptView, type Turn } from '@/components/voice/TranscriptView';
import { usePendingTurn } from '@/hooks/usePendingTurn';
import { usePlanItem } from '@/hooks/usePlanItem';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';
import { TUTOR_MODES, type CorrectionMode, type TutorMode } from '@/lib/ai/prompts/tutor';
import type { SessionSummary, TutorTurn } from '@/lib/types-eval';

type Insight = { recurringMistakes: { signature: string; example: string | null; correction: string | null; occurrences: number; status: string }[]; vocabularyDue: { word: string; meaning: string }[] };

export function TutorClient() {
  const [mode, setMode] = useState<TutorMode>('friendly_coach');
  const [correctionMode, setCorrectionMode] = useState<CorrectionMode>('balanced');
  const [difficulty, setDifficulty] = useState(3);
  const [tamil, setTamil] = useState(true);
  const [englishOnly, setEnglishOnly] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceSession, setVoiceSession] = useState(true);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [text, setText] = useState('');
  const recorder = useRecorder();
  const markPlanDone = usePlanItem();
  const tts = useTts();
  const pending = usePendingTurn(sessionId);
  const recordingStartRef = useRef(0);

  useEffect(() => {
    fetch('/api/tutor/insight').then((r) => r.ok ? r.json() : null).then(setInsight).catch(() => {});
  }, [turns.length]);

  const startSession = async (voice: boolean) => {
    setVoiceSession(voice); setTurns([]); setSummary(null); setSendError(null);
    const res = await fetch('/api/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: voice ? 'tutor_voice' : 'tutor_text', tutorMode: mode, correctionMode, difficulty }),
    });
    if (res.ok) setSessionId((await res.json()).id);
  };

  const send = useCallback(async (body: { text?: string; audio?: Blob }) => {
    if (!sessionId) return;
    setBusy(true); setSendError(null);
    const latency = recordingStartRef.current ? Date.now() - recordingStartRef.current : undefined;
    try {
      const form = new FormData();
      if (body.text) form.set('text', body.text);
      if (body.audio) form.set('audio', body.audio, 'turn.webm');
      if (latency) form.set('responseLatencyMs', String(latency));
      const res = await fetch(`/api/sessions/${sessionId}/turn`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        await pending.save({
          transcript: body.text,
          audio: body.audio ? { bytes: [...new Uint8Array(await body.audio.arrayBuffer())], mime: body.audio.type } : undefined,
        });
        if (data.error === 'stt_failed') setSendError('I could not hear that clearly — type what you said, or try again.');
        else setSendError('The tutor did not respond — press Retry.');
        return;
      }
      await pending.clear();
      const t: TutorTurn = data.tutorTurn;
      setTurns((ts) => [
        ...ts,
        { id: data.learnerTurn.id, role: 'learner', text: data.learnerTurn.text },
        { id: data.learnerTurn.tutorTurnId ?? crypto.randomUUID(), role: 'tutor', text: t.reply, tamilNote: t.tamilNote },
      ]);
      if (autoPlay) void tts.speak(t.reply);
    } catch {
      setSendError('Network dropped — your recording is kept below; press Retry.');
    } finally {
      setBusy(false);
    }
  }, [sessionId, autoPlay, tts, pending]);

  const endSession = async () => {
    if (!sessionId) return;
    void markPlanDone();
    const res = await fetch(`/api/sessions/${sessionId}/end`, { method: 'POST' });
    const data = await res.json();
    setSummary(data.summary);
  };

  if (summary) return <SummaryView s={summary} onRestart={() => { setSummary(null); setSessionId(null); }} />;

  if (!sessionId) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        <section>
          <h3 className="text-sm font-medium">Tutor mode</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
            {Object.entries(TUTOR_MODES).map(([k, m]) => (
              <button key={k} onClick={() => setMode(k as TutorMode)}
                className={`rounded-xl border p-3 text-left text-sm ${mode === k ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900' : 'border-neutral-200 dark:border-neutral-800'}`}>
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-500">{TUTOR_MODES[mode].brief}</p>
        </section>

        <section className="flex flex-wrap items-center gap-4 text-sm">
          <fieldset className="flex gap-2">
            <legend className="sr-only">Correction timing</legend>
            <button onClick={() => setCorrectionMode('balanced')} className={`rounded-lg border px-3 py-1.5 ${correctionMode === 'balanced' ? 'border-neutral-900 font-medium dark:border-neutral-100' : 'border-neutral-200 dark:border-neutral-800'}`}>Correct me live</button>
            <button onClick={() => setCorrectionMode('fluency')} className={`rounded-lg border px-3 py-1.5 ${correctionMode === 'fluency' ? 'border-neutral-900 font-medium dark:border-neutral-100' : 'border-neutral-200 dark:border-neutral-800'}`}>After I finish</button>
          </fieldset>
          <label className="flex items-center gap-2">
            Difficulty
            <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} className="rounded border bg-transparent px-2 py-1">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={tamil} onChange={(e) => setTamil(e.target.checked)} />Tamil explanations</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={englishOnly} onChange={(e) => setEnglishOnly(e.target.checked)} />English only</label>
        </section>

        <div className="flex gap-3">
          <button onClick={() => startSession(true)} className="rounded-xl bg-neutral-900 px-6 py-3 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">Start voice session</button>
          <button onClick={() => startSession(false)} className="rounded-xl border border-neutral-200 px-6 py-3 dark:border-neutral-800">Start text session</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-4">
        <TranscriptView turns={turns} turnActions={(t) => t.role === 'learner' && t.audioPath ? (
          <a href={`/api/audio/${t.id}`} className="underline">Replay my audio</a>
        ) : null} />
        {busy && <p className="text-sm text-neutral-500">Thinking…</p>}
        {sendError && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-800 dark:bg-amber-950">
            {sendError}
            <div className="mt-2 flex gap-2">
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your reply instead…"
                className="min-w-0 flex-1 rounded border bg-transparent px-3 py-1.5" />
              <button onClick={() => { send({ text }); setText(''); }} className="rounded-lg bg-neutral-900 px-3 py-1.5 text-white dark:bg-neutral-100 dark:text-neutral-900">Send</button>
            </div>
          </div>
        )}
        {pending.pending && (
          <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-neutral-800">
            You have an unsent recording or message.
            <button className="ml-3 underline" onClick={() => pending.pending?.transcript && send({ text: pending.pending.transcript })}>Send</button>
            <button className="ml-2 underline" onClick={pending.clear}>Discard</button>
          </div>
        )}

        {voiceSession ? (
          <RecorderControls r={recorder} onSend={(b) => { send({ audio: b }); recorder.reset(); }} />
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) { send({ text: text.trim() }); setText(''); } }} className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type in English…" autoFocus
              className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-transparent px-4 py-3 dark:border-neutral-800" />
            <button className="rounded-xl bg-neutral-900 px-5 text-white dark:bg-neutral-100 dark:text-neutral-900">Send</button>
          </form>
        )}

        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />Play replies aloud</label>
          <button onClick={endSession} className="ml-auto rounded-lg border px-4 py-2">End session</button>
        </div>
      </div>

      <aside className="hidden lg:block">
        <h3 className="text-sm font-medium">What your tutor is watching</h3>
        <div className="mt-2 flex flex-col gap-2 text-sm">
          {(insight?.recurringMistakes ?? []).map((m) => (
            <div key={m.signature} className="rounded-lg border border-neutral-200 p-2 dark:border-neutral-800">
              <p className="font-mono text-xs">{m.signature}</p>
              <p className="mt-0.5 text-xs text-neutral-500">&quot;{m.example}&quot; → &quot;{m.correction}&quot; · {m.occurrences}× {m.status}</p>
            </div>
          ))}
          {insight?.vocabularyDue.map((v) => (
            <div key={v.word} className="rounded-lg border border-neutral-200 p-2 text-xs dark:border-neutral-800">
              <strong>{v.word}</strong> — {v.meaning}
            </div>
          ))}
          {!insight?.recurringMistakes.length && !insight?.vocabularyDue.length && (
            <p className="text-xs text-neutral-500">No tracked mistakes or vocabulary yet — speak and the tutor will start learning your patterns.</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function SummaryView({ s, onRestart }: { s: SessionSummary; onRestart: () => void }) {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      <h2 className="text-lg font-semibold">Session summary</h2>
      <p className="text-sm">{s.whatYouDid}</p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{s.whatImproved}</p>
      {s.topMistakes.length > 0 && (
        <div><h4 className="text-sm font-medium">Top mistakes</h4>
          <ul className="mt-1 space-y-1 text-sm">{s.topMistakes.map((m, i) => <li key={i}>&quot;{m.quote}&quot; → &quot;{m.correction}&quot; <span className="font-mono text-xs">({m.rule})</span></li>)}</ul></div>
      )}
      {s.bestSentence && <p className="text-sm"><strong>Best sentence:</strong> {s.bestSentence}</p>}
      {s.upgradedExpression && <p className="text-sm"><strong>Upgrade:</strong> &quot;{s.upgradedExpression.original}&quot; → &quot;{s.upgradedExpression.upgraded}&quot;</p>}
      {s.vocabularyLearned.length > 0 && <p className="text-sm"><strong>New words:</strong> {s.vocabularyLearned.join(', ')}</p>}
      <p className="text-sm"><strong>Next:</strong> {s.nextRecommendedActivity}</p>
      <button onClick={onRestart} className="w-fit rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900">New session</button>
    </div>
  );
}
