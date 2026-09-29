import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { journalEntries } from '@/lib/db/schema';

export const metadata = { title: 'Journal' };

export default async function JournalPage() {
  const session = await requireSession();
  const entries = await (await getDb()).query.journalEntries.findMany({
    where: eq(journalEntries.learnerId, session.userId),
    orderBy: desc(journalEntries.createdAt), limit: 60,
  });
  // group by month
  const byMonth = new Map<string, typeof entries>();
  for (const e of entries) {
    const k = e.createdAt.toISOString().slice(0, 7);
    byMonth.set(k, [...(byMonth.get(k) ?? []), e]);
  }
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Journal</h1>
        <Link href="/journal/new" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">New entry</Link>
      </div>
      {[...byMonth].map(([month, list]) => (
        <section key={month}>
          <h2 className="mb-1 text-sm font-semibold text-fg-muted">{month}</h2>
          <ul className="space-y-2">
            {list.map((e) => (
              <li key={e.id} className="rounded-xl border border-border p-3 text-sm">
                <span className="text-xs text-fg-muted">{e.createdAt.toISOString().slice(0, 10)}</span>
                <p className="line-clamp-2">{e.content ?? '(voice entry)'}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {!entries.length && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-muted">
          Your private journal — nothing analysed or shared until you press Analyse.
        </p>
      )}
    </div>
  );
}
