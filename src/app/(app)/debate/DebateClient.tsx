'use client';

import { useState } from 'react';
import type { DebateTopic } from '@/content/debate-topics';
import { RoleplayRunner } from '@/components/roleplay/RoleplayRunner';

export function DebateClient({ topics, modes }: { topics: DebateTopic[]; modes: string[] }) {
  const [topic, setTopic] = useState(topics[0]!);
  const [mode, setMode] = useState(modes[0]!);
  const [side, setSide] = useState<'against' | 'for' | 'ai-picks'>('against');
  const [session, setSession] = useState<{ id: string; opener: string | null } | null>(null);

  const start = async () => {
    const learnerSide = side === 'ai-picks' ? 'against' : side;
    const res = await fetch('/api/roleplay', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioSlug: `debate:${topic.slug}`,
        mode: `${topic.topic} (learner argues ${learnerSide}; AI position: ${topic.aiPosition}; mode: ${mode})`,
      }),
    });
    const d = await res.json();
    if (res.ok) setSession(d);
  };

  if (session) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <button onClick={() => setSession(null)} className="text-xs text-fg-muted underline">← topics</button>
        <h1 className="text-xl font-semibold">{topic.topic} <span className="text-xs text-fg-muted">mode: {mode}</span></h1>
        <p className="text-sm text-fg-muted">
          Language and reasoning are scored separately — reasoning judges structure and defence, not whether you are right.
        </p>
        <RoleplayRunner rpId={session.id} opener={session.opener} title={topic.topic}
          role={`debater (${side === 'ai-picks' ? 'AI picks' : side})`} counterpart="AI opponent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Debate</h1>
      <ul className="space-y-2">
        {topics.map((t) => (
          <li key={t.slug}>
            <button onClick={() => setTopic(t)}
              className={`w-full rounded-xl border p-3 text-left text-sm ${topic.slug === t.slug ? 'border-accent bg-accent/5' : 'border-border'}`}>
              <strong>{t.topic}</strong>
              <span className="ml-2 text-xs text-fg-muted">AI argues: {t.aiPosition}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        Mode:
        {modes.map((m) => <button key={m} onClick={() => setMode(m)}
          className={`rounded-full border px-3 py-1 text-xs ${mode === m ? 'border-accent' : 'border-border'}`}>{m}</button>)}
        Side:
        {(['against', 'for', 'ai-picks'] as const).map((s) => <button key={s} onClick={() => setSide(s)}
          className={`rounded-full border px-3 py-1 text-xs ${side === s ? 'border-accent' : 'border-border'}`}>{s}</button>)}
      </div>
      <button onClick={start} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white">Start debate</button>
    </div>
  );
}
