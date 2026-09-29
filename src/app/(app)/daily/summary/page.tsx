import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { CurriculumService } from '@/server/services/curriculum';

export const metadata = { title: 'Day summary' };

export default async function DailySummaryPage() {
  const session = await requireSession();
  const today = await new CurriculumService(await getDb()).todayPlan(session.userId);
  const items = today?.items ?? [];
  const done = items.filter((i) => i.status === 'done');
  const minutes = done.reduce((s, i) => s + i.estMinutes, 0);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Today&apos;s summary</h1>
      {!items.length ? (
        <p className="text-sm text-fg-muted">No plan for today yet.</p>
      ) : (
        <>
          <p className="text-sm text-fg-muted">
            {done.length} item{done.length === 1 ? '' : 's'} completed · ~{minutes} minutes
          </p>
          <ul className="space-y-1 text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between rounded bg-surface px-3 py-1.5">
                <span>{i.title}</span>
                <span className="text-fg-muted">{i.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link href="/" className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white">Back to Home</Link>
    </div>
  );
}
