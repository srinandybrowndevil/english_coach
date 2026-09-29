'use client';

import { useState } from 'react';
import { RoleplayRunner } from './RoleplayRunner';

export type ScenarioCard = {
  slug: string; title: string; description?: string | null;
  personas?: { slug: string; name: string }[];
  difficulties?: string[];
  aiRole?: string; learnerRole?: string; register?: string;
};

export function ScenarioStarter({ scenarios }: {
  scenarios: ScenarioCard[];
}) {
  const [sel, setSel] = useState<ScenarioCard | null>(null);
  const [persona, setPersona] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [session, setSession] = useState<{ id: string; opener: string | null; title: string } | null>(null);

  const start = async () => {
    if (!sel) return;
    const res = await fetch('/api/roleplay', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioSlug: sel.slug, personaSlug: persona || undefined, difficulty: difficulty || undefined }),
    });
    const d = await res.json();
    if (res.ok) setSession(d);
  };

  if (session && sel) {
    return (
      <div className="space-y-4">
        <button onClick={() => setSession(null)} className="text-xs text-fg-muted underline">← scenarios</button>
        <RoleplayRunner rpId={session.id} opener={session.opener} title={session.title}
          role={sel.learnerRole ?? 'You'} counterpart={sel.aiRole ?? 'Counterpart'} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sel && (
        <div className="rounded-xl border border-accent/40 p-4 space-y-3">
          <h2 className="font-semibold">{sel.title}</h2>
          <p className="text-sm text-fg-muted">{sel.description}</p>
          {sel.personas && (
            <label className="block text-sm">Counterpart:
              <select value={persona} onChange={(e) => setPersona(e.target.value)}
                className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm">
                <option value="">Pick a persona</option>
                {sel.personas.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
          )}
          {sel.difficulties && (
            <label className="block text-sm">Difficulty:
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
                className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm">
                <option value="">Realistic (default)</option>
                {sel.difficulties.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </label>
          )}
          {sel.register && <p className="text-xs text-fg-muted">Register expected: {sel.register}</p>}
          <button onClick={start} className="rounded-lg bg-accent px-4 py-2 text-sm text-white">Start roleplay</button>
        </div>
      )}
      <ul className="grid gap-2 md:grid-cols-2">
        {scenarios.map((s) => (
          <li key={s.slug}>
            <button onClick={() => setSel(s)}
              className={`w-full rounded-xl border p-3 text-left text-sm ${sel?.slug === s.slug ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface'}`}>
              <strong>{s.title}</strong>
              {s.description && <div className="mt-0.5 text-xs text-fg-muted line-clamp-2">{s.description}</div>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
