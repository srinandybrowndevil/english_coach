import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { learningSessions } from '@/lib/db/schema';
import type { SessionSummary } from '@/lib/types-eval';
import { SessionService } from '@/server/services/session';

export default async function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const db = await getDb();
  const row = await db.query.learningSessions.findFirst({ where: eq(learningSessions.id, id) });
  if (!row || row.learnerId !== session.userId) notFound();
  const summary = (row.overallSummary as SessionSummary | null) ?? null;
  const turns = await new SessionService(db).recentTurns(id, 100);

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-8">
      <Link href="/tutor" className="text-sm underline">← Tutor</Link>
      <h1 className="mt-2 text-xl font-semibold">Session summary</h1>
      <p className="text-sm text-neutral-500">
        {row.sessionType} · {Math.round((row.durationSeconds ?? 0) / 60)} min · {turns.length} turns
      </p>
      {!summary ? (
        <p className="mt-6 text-sm text-neutral-500">No summary yet — end the session from the tutor page.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">What you did</h4><p className="mt-1 text-sm">{summary.whatYouDid}</p></section>
          <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">What improved</h4><p className="mt-1 text-sm">{summary.whatImproved}</p></section>
          {summary.topMistakes.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Top mistakes</h4>
              <ul className="mt-2 space-y-2">
                {summary.topMistakes.map((m, i) => (
                  <li key={i} className="rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800">
                    "{m.quote}" → "{m.correction}" <span className="font-mono text-xs text-neutral-500">{m.rule}</span>
                  </li>
                ))}
              </ul>
              <Link href="/mistakes" className="mt-2 inline-block text-sm underline">Review in Mistake Vault →</Link>
            </section>
          )}
          {summary.bestSentence && <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Best sentence</h4><p className="mt-1 text-sm">"{summary.bestSentence}"</p></section>}
          {summary.upgradedExpression && <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Upgraded</h4><p className="mt-1 text-sm">"{summary.upgradedExpression.original}" → "{summary.upgradedExpression.upgraded}"</p></section>}
          {summary.vocabularyLearned.length > 0 && <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Vocabulary</h4><p className="mt-1 text-sm">{summary.vocabularyLearned.join(' · ')}</p></section>}
          {summary.practiceScheduled.length > 0 && <section><h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Practice scheduled</h4><ul className="mt-1 list-disc pl-5 text-sm">{summary.practiceScheduled.map((p, i) => <li key={i}>{p}</li>)}</ul></section>}
          <section className="rounded-xl bg-neutral-900 p-4 text-white dark:bg-neutral-100 dark:text-neutral-900">
            <h4 className="text-xs font-semibold uppercase tracking-wide opacity-70">Next recommended</h4>
            <p className="mt-1 text-sm">{summary.nextRecommendedActivity}</p>
          </section>
        </div>
      )}
    </div>
  );
}
