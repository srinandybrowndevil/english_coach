import { desc } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { aiEvaluationEvents } from '@/lib/db/schema';

export const metadata = { title: 'AI usage' };

export default async function UsagePage() {
  await requireSession();
  const db = await getDb();
  const events = await db.query.aiEvaluationEvents.findMany({
    orderBy: desc(aiEvaluationEvents.createdAt), limit: 500,
  });
  const byDay = new Map<string, { calls: number; tokens: number; ms: number }>();
  const byKind = new Map<string, { calls: number; tokens: number }>();
  for (const e of events) {
    const d = e.createdAt.toISOString().slice(0, 10);
    const t = (e.inputTokens ?? 0) + (e.outputTokens ?? 0);
    byDay.set(d, { calls: (byDay.get(d)?.calls ?? 0) + 1, tokens: (byDay.get(d)?.tokens ?? 0) + t, ms: (byDay.get(d)?.ms ?? 0) + (e.ms ?? 0) });
    byKind.set(e.kind, { calls: (byKind.get(e.kind)?.calls ?? 0) + 1, tokens: (byKind.get(e.kind)?.tokens ?? 0) + t });
  }
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">AI usage</h1>
      <p className="text-sm text-fg-muted">Local counters — no provider billing fields are read.</p>
      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-2 font-semibold">By day</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-fg-muted"><th>Day</th><th>Calls</th><th>Tokens</th><th>Latency ms</th></tr></thead>
          <tbody>
            {[...byDay].map(([d, v]) => <tr key={d}><td>{d}</td><td>{v.calls}</td><td>{v.tokens || '—'}</td><td>{v.ms}</td></tr>)}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-2 font-semibold">By kind</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-fg-muted"><th>Kind</th><th>Calls</th><th>Tokens</th></tr></thead>
          <tbody>
            {[...byKind].map(([k, v]) => <tr key={k}><td>{k}</td><td>{v.calls}</td><td>{v.tokens || '—'}</td></tr>)}
          </tbody>
        </table>
      </section>
    </div>
  );
}
