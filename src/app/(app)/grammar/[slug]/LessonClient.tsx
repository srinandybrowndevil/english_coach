'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { LessonSeed } from '@/content/grammar-lessons';

// §17 lesson flow, in order: concept → why → rule → examples → Indian-English
// mistakes → speaking → writing → quiz → real-world → review schedule.
export function LessonClient({ slug, lesson }: { slug: string; lesson: LessonSeed }) {
  const [written, setWritten] = useState('');
  const [result, setResult] = useState<{ correct: boolean; note: string; nextReview?: string | null } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const rec = useRecorder();

  const attempt = async (kind: 'speaking' | 'writing' | 'quiz', text?: string, correct?: boolean) => {
    setBusy(true);
    const res = await fetch(`/api/grammar/${slug}/attempt`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, text, correct }),
    });
    const d = await res.json();
    if (kind !== 'quiz') {
      setResult({
        correct: !!d.correct,
        note: d.correct ? 'Clean — the lesson pattern did not appear.' : `${(d.errors ?? []).length} error(s) flagged.`,
        nextReview: d.nextReviewAt,
      });
    }
    setBusy(false);
    return d;
  };

  const submitSpoken = async () => {
    if (!rec.blob) return;
    const fd = new FormData();
    fd.append('audio', rec.blob, 'lesson.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    if (t?.text) await attempt('speaking', t.text);
    rec.reset();
  };

  const exBlock = (title: string, items: string[]) => (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="list-inside list-disc text-sm text-fg-muted">{items.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">{lesson.topic}</h1>

      <section className="space-y-1"><h2 className="font-semibold">Concept</h2><p className="text-sm">{lesson.concept}</p></section>
      <section className="space-y-1"><h2 className="font-semibold">Why it matters</h2><p className="text-sm text-fg-muted">{lesson.whyItMatters}</p></section>
      <section className="space-y-1"><h2 className="font-semibold">Rule</h2><p className="rounded-lg bg-surface p-3 text-sm">{lesson.rule}</p></section>

      {exBlock('Simple', lesson.simpleExamples)}
      {exBlock('Natural', lesson.naturalExamples)}
      {exBlock('Business', lesson.businessExamples)}

      {!!lesson.indianEnglishMistakes.length && (
        <section>
          <h2 className="font-semibold">Common Indian-English mistakes</h2>
          <ul className="space-y-1 text-sm">
            {lesson.indianEnglishMistakes.map((m) => (
              <li key={m.wrong}><span className="text-red-600 line-through">{m.wrong}</span>{' → '}<span className="text-green-700">{m.right}</span> <span className="text-fg-muted">({m.note})</span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Speaking exercise</h2>
        <p className="text-sm text-fg-muted">{lesson.speakingPrompt}</p>
        <RecorderControls r={rec} />
        <button onClick={submitSpoken} disabled={!rec.blob || busy}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Evaluate</button>
      </section>

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Writing exercise</h2>
        <p className="text-sm text-fg-muted">{lesson.writingPrompt}</p>
        <textarea value={written} onChange={(e) => setWritten(e.target.value)} rows={4}
          className="w-full rounded-lg border border-border bg-bg p-3 text-sm" />
        <button onClick={() => attempt('writing', written)} disabled={!written.trim() || busy}
          className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-40">Check</button>
      </section>

      {result && (
        <p className={`rounded p-3 text-sm ${result.correct ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
          {result.correct ? '✓' : '✗'} {result.note}
          {result.nextReview && <span className="block text-xs">Next review: {String(result.nextReview).slice(0, 10)}</span>}
        </p>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Mini quiz</h2>
        <div className="space-y-4">
          {lesson.quiz.map((q, qi) => {
            const chosen = quizAnswers[qi];
            return (
              <div key={qi} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium">{q.q}</p>
                <div className="mt-1 space-y-1">
                  {q.options.map((o, oi) => (
                    <label key={o} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={`q${qi}`} disabled={chosen !== undefined}
                        checked={chosen === oi}
                        onChange={() => {
                          setQuizAnswers((a) => ({ ...a, [qi]: oi }));
                          void attempt('quiz', undefined, oi === q.answer);
                        }} />
                      {o}
                    </label>
                  ))}
                </div>
                {chosen !== undefined && (
                  <p className={`mt-1 text-xs ${chosen === q.answer ? 'text-green-700' : 'text-amber-700'}`}>
                    {chosen === q.answer ? '✓ Correct. ' : '✗ '}{q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-1"><h2 className="font-semibold">Real-world use</h2><p className="text-sm text-fg-muted">{lesson.realWorldUse}</p></section>
      <section className="space-y-1 text-sm text-fg-muted">
        <h2 className="font-semibold text-fg">Review schedule</h2>
        <p>Attempts are spaced by SRS — the next review date appears above after your first attempt.</p>
      </section>
    </div>
  );
}
