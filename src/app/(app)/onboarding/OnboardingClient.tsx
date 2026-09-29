'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';

// §78 A — Welcome → Goals → Mic test → assessment
const GOALS = [
  'spoken fluency', 'grammar', 'pronunciation', 'conversation', 'business English',
  'sales communication', 'negotiation', 'executive communication', 'presentation',
  'international client communication',
];

export function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goals, setGoals] = useState<Set<string>>(new Set());
  const [minutes, setMinutes] = useState(45);
  const [business, setBusiness] = useState('');
  const [technical, setTechnical] = useState('');
  const [interests, setInterests] = useState('');
  const [lang, setLang] = useState<'en' | 'en_ta'>('en_ta');
  const [micOk, setMicOk] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const rec = useRecorder();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const toggle = (g: string) => {
    const s = new Set(goals);
    if (s.has(g)) s.delete(g); else s.add(g);
    setGoals(s);
  };

  const testMic = async () => {
    if (!rec.blob) return;
    setAudioUrl(URL.createObjectURL(rec.blob));
    const fd = new FormData();
    fd.append('audio', rec.blob, 'mic.webm');
    const res = await fetch('/api/speech/stt', { method: 'POST', body: fd });
    if (res.ok) setTranscript((await res.json()).text ?? '[no transcript]');
    setMicOk(true);
  };

  const finish = async (startAssessment: boolean) => {
    setBusy(true);
    await fetch('/api/onboarding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goals: [...goals], dailyAvailableMinutes: minutes,
        businessContext: business || null, technicalContext: technical || null,
        conversationInterests: interests.split(',').map((s) => s.trim()).filter(Boolean),
        explanationLanguage: lang,
      }),
    });
    if (startAssessment) {
      const a = await (await fetch('/api/assessments', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'initial' }),
      })).json();
      router.push(`/assessment/initial?id=${a.id}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="text-xs text-fg-muted">Step {step + 1} of 3</div>
      {step === 0 && (
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Welcome, Srinivash</h1>
          <p className="text-sm text-fg-muted">
            This is your private English operating system. First, tell me what you want to work on
            so the tutor can build your plan.
          </p>
          <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white" onClick={() => setStep(1)}>
            Continue
          </button>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Your goals</h2>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => toggle(g)}
                aria-pressed={goals.has(g)}
                className={`rounded-full border px-3 py-1 text-sm ${goals.has(g) ? 'border-accent bg-accent/10 text-fg' : 'border-border text-fg-muted'}`}
              >
                {g}
              </button>
            ))}
          </div>
          <label className="block text-sm">
            Daily practice time: <strong>{minutes} min</strong>
            <input type="range" min={15} max={90} step={5} value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))} className="mt-1 w-full" />
          </label>
          <label className="block text-sm">
            Business context (optional)
            <input value={business} onChange={(e) => setBusiness(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-bg px-3 py-2" placeholder="e.g. SaaS sales for US clients" />
          </label>
          <label className="block text-sm">
            Technical context (optional)
            <input value={technical} onChange={(e) => setTechnical(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-bg px-3 py-2" placeholder="e.g. software engineering" />
          </label>
          <label className="block text-sm">
            Interests (comma-separated)
            <input value={interests} onChange={(e) => setInterests(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-bg px-3 py-2" placeholder="cricket, tech, films" />
          </label>
          <fieldset className="space-y-1 text-sm">
            <legend className="font-medium">Explanation language</legend>
            <label className="flex items-center gap-2"><input type="radio" name="lang" checked={lang === 'en'} onChange={() => setLang('en')} /> English only</label>
            <label className="flex items-center gap-2"><input type="radio" name="lang" checked={lang === 'en_ta'} onChange={() => setLang('en_ta')} /> English with Tamil support</label>
          </fieldset>
          <div className="flex gap-2">
            <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white"
              disabled={!goals.size} onClick={() => setStep(2)}>Continue</button>
            <button className="text-sm text-fg-muted" onClick={() => finish(false)}>Do it later</button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Microphone check</h2>
          <p className="text-sm text-fg-muted">
            Record a few seconds — say anything, e.g. your name and what you did today. If the
            browser asks for permission, choose Allow. If it was blocked, enable the microphone for
            localhost in your browser settings and press Retry.
          </p>
          <RecorderControls r={rec} />
          {rec.blob && (
            <div className="space-y-2">
              <button className="rounded-lg border border-border px-4 py-2 text-sm" onClick={testMic}>Test & transcribe</button>
              {audioUrl && <audio src={audioUrl} controls className="block" />}
              {transcript && <p className="rounded bg-surface p-3 text-sm">Heard: “{transcript}”</p>}
            </div>
          )}
          <div className="flex gap-2">
            <button className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              disabled={!micOk || busy} onClick={() => finish(true)}>
              Sounds good — start my initial assessment
            </button>
            <button className="text-sm text-fg-muted" disabled={busy} onClick={() => finish(false)}>
              Do it later
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
