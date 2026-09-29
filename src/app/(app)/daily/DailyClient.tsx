'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Plan = {
  plan: { id: string; date: string; targetMinutes: number; status: string } | null | undefined;
  items: {
    id: string; position: number; kind: string; domain: string;
    moduleRoute: string | null; title: string; estMinutes: number;
    status: string;
  }[];
} | null;

const QUICK = [5, 15, 30, 45];
const BUILT_ROUTES = ['/tutor', '/speak', '/fluency', '/mistakes', '/vocabulary'];

export function DailyClient({ today, defaultMinutes }: { today: Plan; defaultMinutes: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState(defaultMinutes);

  const generate = async (minutes: number) => {
    setBusy(true);
    await fetch('/api/daily', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minutes }),
    });
    router.refresh();
    setBusy(false);
  };

  const mark = async (id: string, status: string) => {
    await fetch(`/api/daily/items/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  };

  if (!today?.plan) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Today&apos;s training</h1>
        <p className="text-sm text-fg-muted">No plan yet. Pick a duration:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((m) => (
            <button key={m} onClick={() => generate(m)} disabled={busy}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface disabled:opacity-50">
              {m} min
            </button>
          ))}
          <span className="flex items-center gap-2 text-sm">
            <input type="number" min={5} max={120} value={custom}
              onChange={(e) => setCustom(Number(e.target.value))}
              className="w-16 rounded border border-border bg-bg px-2 py-1" /> min
            <button onClick={() => generate(custom)} disabled={busy}
              className="rounded-lg bg-accent px-4 py-2 text-sm text-white disabled:opacity-50">Generate</button>
          </span>
        </div>
      </div>
    );
  }

  const items = today.items;
  const next = items.find((i) => i.status === 'pending');
  const doneCount = items.filter((i) => i.status === 'done' || i.status === 'skipped').length;
  const allDone = doneCount === items.length;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Today&apos;s training</h1>
        <span className="text-sm text-fg-muted">{today.plan!.targetMinutes} min · {doneCount}/{items.length}</span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {QUICK.map((m) => (
          <button key={m} onClick={() => generate(m)} disabled={busy}
            className="rounded border border-border px-2.5 py-1 hover:bg-surface disabled:opacity-50">
            {m}m
          </button>
        ))}
        <button onClick={() => generate(custom)} disabled={busy}
          className="rounded border border-border px-2.5 py-1 hover:bg-surface disabled:opacity-50">
          Regenerate {custom}m
        </button>
      </div>

      {allDone && (
        <button onClick={() => router.push('/daily/summary')}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white">
          All done — see today&apos;s summary →
        </button>
      )}

      <ol className="space-y-2">
        {items.map((item) => {
          const built = item.moduleRoute && BUILT_ROUTES.some((r) => item.moduleRoute!.startsWith(r));
          const isNext = item.id === next?.id;
          return (
            <li key={item.id}
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${isNext ? 'border-accent' : 'border-border'} ${item.status !== 'pending' ? 'opacity-60' : ''}`}>
              <div>
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-fg-muted">{item.kind} · {item.domain} · ~{item.estMinutes} min</div>
              </div>
              {item.status === 'pending' && (
                <div className="flex gap-2">
                  {built ? (
                    <a href={`${item.moduleRoute}${item.moduleRoute!.includes('?') ? '&' : '?'}planItem=${item.id}`}
                      className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white">
                      Start
                    </a>
                  ) : (
                    <span className="text-xs text-fg-muted">Coming in this module</span>
                  )}
                  <button onClick={() => mark(item.id, 'skipped')}
                    className="text-xs text-fg-muted underline">Skip</button>
                </div>
              )}
              {item.status !== 'pending' && <span className="text-xs capitalize text-fg-muted">{item.status}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
