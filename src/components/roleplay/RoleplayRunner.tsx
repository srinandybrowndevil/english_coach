'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import { useTts } from '@/hooks/useTts';
import { ScoreCard } from '@/components/voice/ScoreCard';

type Turn = { role: string; content: string };
type Eval = {
  kind: string;
  raw?: { moments?: { learnerSaid: string; whyItWorkedOrNot: string; betterResponse: string; alternativeResponse: string }[]; retryChallenge?: string };
  scores?: { language: import('@/lib/scoring/util').ScoreResult; negotiation: import('@/lib/scoring/util').ScoreResult };
  objectivesForSelfCheck?: string[]; counterpartNotes?: string[];
};

export function RoleplayRunner({ rpId, opener, title, role, counterpart }: {
  rpId: string; opener: string | null; title: string; role: string; counterpart: string;
}) {
  const [turns, setTurns] = useState<Turn[]>(opener ? [{ role: 'ai', content: opener }] : []);
  const [text, setText] = useState('');
  const [ended, setEnded] = useState(false);
  const [evaluation, setEvaluation] = useState<Eval | null>(null);
  const [busy, setBusy] = useState(false);
  const rec = useRecorder();
  const tts = useTts();

  const send = async (spoken: string) => {
    if (!spoken.trim() || busy) return;
    setBusy(true);
    setTurns((t) => [...t, { role: 'learner', content: spoken }]);
    const res = await fetch(`/api/roleplay/${rpId}/turn`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: spoken }),
    });
    const d = await res.json();
    if (res.ok) {
      setTurns((t) => [...t, { role: 'ai', content: d.reply }]);
      void tts.speak(d.reply);
      if (d.ended) { setEnded(true); if (d.evaluation) setEvaluation(d.evaluation); }
    }
    setText(''); setBusy(false);
  };

  const submitAudio = async () => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 'rp.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    rec.reset();
    if (t?.text) await send(t.text);
  };

  const finish = async () => {
    setBusy(true);
    const d = await (await fetch(`/api/roleplay/${rpId}/end`, { method: 'POST' })).json();
    setEvaluation(d); setEnded(true); setBusy(false);
  };

  if (evaluation) {
    const neg = evaluation.kind === 'negotiation' ? evaluation.raw : null;
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold">Result — {title}</h2>
        {evaluation.scores && (
          <>
            <p className="text-xs text-fg-muted">Language and negotiation are scored separately (§55).</p>
            <div className="grid gap-3 md:grid-cols-2">
              <ScoreCard title="Language" result={evaluation.scores.language} />
              <ScoreCard title="Negotiation" result={evaluation.scores.negotiation} />
            </div>
          </>
        )}
        {neg?.moments && (
          <div className="space-y-2">
            <h3 className="font-medium">Key moments</h3>
            {neg.moments.map((m, i) => (
              <div key={i} className="rounded-lg border border-border p-3 text-sm space-y-1">
                <p><strong>You said:</strong> “{m.learnerSaid}”</p>
                <p className="text-fg-muted">{m.whyItWorkedOrNot}</p>
                <p><strong>Better:</strong> {m.betterResponse}</p>
                <p className="text-fg-muted"><strong>Alternative:</strong> {m.alternativeResponse}</p>
              </div>
            ))}
          </div>
        )}
        {evaluation.objectivesForSelfCheck && (
          <div className="rounded-lg border border-border p-3 text-sm">
            <p className="font-medium">Self-check objectives</p>
            <ul className="list-inside list-disc text-fg-muted">
              {evaluation.objectivesForSelfCheck.map((o) => <li key={o}>{o}</li>)}
            </ul>
            {!!evaluation.counterpartNotes?.length && (
              <div className="mt-2">
                <p className="text-xs font-medium text-fg-muted">Counterpart&rsquo;s private notes (revealed after the session):</p>
                <ul className="list-inside list-disc text-xs text-fg-muted">
                  {evaluation.counterpartNotes.map((n, i) => <li key={i}>{n}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">You: <strong>{role}</strong> · Counterpart: <strong>{counterpart}</strong></p>
      <div className="space-y-2">
        {turns.map((t, i) => (
          <div key={i} className={`rounded-lg p-3 text-sm ${t.role === 'ai' ? 'bg-surface' : 'border border-accent/40'}`}>
            <span className="text-xs font-medium text-fg-muted">{t.role === 'ai' ? counterpart : 'You'}</span>
            <p>{t.content}</p>
          </div>
        ))}
      </div>
      {!ended && (
        <>
          <RecorderControls r={rec} onSend={submitAudio} />
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send(text)}
              placeholder="…or type your reply" className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
            <button onClick={() => send(text)} disabled={busy || !text.trim()}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Say</button>
          </div>
          <button onClick={finish} disabled={busy} className="text-sm text-fg-muted underline">End roleplay → evaluate</button>
        </>
      )}
    </div>
  );
}
