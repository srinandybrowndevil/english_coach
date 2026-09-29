'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';

type Card = { id: string; word: string; meaning: string; status: string };

// §40 — each card: recall (word hidden) → usage (sentence check) → SRS.
export function ReviewSession({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'recall' | 'usage'>('recall');
  const [recallGuess, setRecallGuess] = useState('');
  const [sentence, setSentence] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const rec = useRecorder();

  const card = cards[i];
  if (!card) {
    return <p className="rounded-xl bg-green-50 p-4 text-sm text-green-800">All done — {cards.length} cards reviewed.</p>;
  }

  const post = (result: string, s?: string) =>
    fetch('/api/vocabulary/review', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerVocabularyId: card.id, result, sentence: s }),
    });

  const checkRecall = async (hit: boolean) => {
    // 'recalled' = typed it correctly or self-marked; 'failed' resets
    await post(hit ? 'recalled' : 'failed');
    setPhase('usage');
    setFeedback(hit ? null : `The word was “${card.word}” — now use it in a sentence.`);
  };

  const checkUsage = async () => {
    const used = sentence.toLowerCase().includes(card.word.toLowerCase());
    if (!used) { setFeedback(`Your sentence must contain “${card.word}”.`); return; }
    await post('used_in_context', sentence);
    setSentence(''); setRecallGuess(''); setFeedback(null);
    setPhase('recall'); setI(i + 1); rec.reset();
  };

  const spokenSentence = async () => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 'v.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    if (t?.text) setSentence(t.text);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-fg-muted">Card {i + 1}/{cards.length} · {phase === 'recall' ? 'Recall' : 'Usage'}</p>
      {phase === 'recall' ? (
        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="text-sm text-fg-muted">Meaning:</p>
          <p className="text-lg">{card.meaning}</p>
          <input value={recallGuess} onChange={(e) => setRecallGuess(e.target.value)}
            placeholder="Type the word" className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <button onClick={() => checkRecall(recallGuess.trim().toLowerCase() === card.word.toLowerCase())}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white">Check</button>
            <button onClick={() => checkRecall(false)} className="text-sm text-fg-muted underline">Forgot it</button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border p-5 space-y-3">
          <p className="text-sm">Use <strong>{card.word}</strong> in your own sentence (type or speak):</p>
          <textarea value={sentence} onChange={(e) => setSentence(e.target.value)} rows={2}
            className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
          <RecorderControls r={rec} />
          {rec.blob && <button onClick={spokenSentence} className="text-xs underline">Transcribe</button>}
          <button onClick={checkUsage} disabled={!sentence.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Submit usage</button>
        </div>
      )}
      {feedback && <p className="text-sm text-amber-700">{feedback}</p>}
    </div>
  );
}
