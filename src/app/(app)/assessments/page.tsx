import Link from 'next/link';
import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assessments } from '@/lib/db/schema';
import { MonthlyButton } from './MonthlyButton';

export const metadata = { title: 'Assessments' };

export default async function AssessmentsPage() {
  const session = await requireSession();
  const rows = await (await getDb()).query.assessments.findMany({
    where: eq(assessments.learnerId, session.userId), orderBy: desc(assessments.startedAt),
  });
  const lastCompleted = rows.find((r) => r.status === 'completed');
  const monthlyReady = !lastCompleted
    // eslint-disable-next-line react-hooks/purity -- server component render timestamp
    || (Date.now() - lastCompleted.completedAt!.getTime()) >= 28 * 86_400_000;
  const inProgress = rows.find((r) => r.status === 'in_progress');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Assessments</h1>

      {inProgress && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
          <p className="text-sm font-medium">Assessment in progress</p>
          <Link className="text-sm text-accent underline"
            href={`/assessment/${inProgress.kind}?id=${inProgress.id}`}>
            Resume your {inProgress.kind} assessment →
          </Link>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/assessment/initial" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
          {rows.some((r) => r.kind === 'initial' && r.status === 'completed') ? 'Retake initial assessment' : 'Start initial assessment'}
        </Link>
        <MonthlyButton enabled={monthlyReady} />
      </div>
      {!monthlyReady && lastCompleted && (
        <p className="text-xs text-fg-muted">
          Monthly assessment unlocks 28 days after your last completed assessment.
        </p>
      )}

      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
            <span className="capitalize">{r.kind} — {r.status}</span>
            <span className="text-fg-muted">{r.startedAt.toISOString().slice(0, 10)}</span>
            {r.status === 'completed'
              ? <Link className="text-accent underline" href={`/assessments/${r.id}`}>Results</Link>
              : <Link className="text-accent underline" href={`/assessment/${r.kind}?id=${r.id}`}>Resume</Link>}
          </li>
        ))}
        {!rows.length && <li className="text-sm text-fg-muted">No assessments yet — the initial one measures your starting level.</li>}
      </ul>
    </div>
  );
}
