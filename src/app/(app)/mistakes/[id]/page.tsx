import { notFound } from 'next/navigation';
import { and, asc, desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { mistakeOccurrences, mistakePatterns, mistakeReviews } from '@/lib/db/schema';
import { MistakeDrill } from './MistakeDrill';

export const metadata = { title: 'Mistake detail' };

export default async function MistakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const db = await getDb();
  const p = await db.query.mistakePatterns.findFirst({
    where: and(eq(mistakePatterns.id, id), eq(mistakePatterns.learnerId, session.userId)),
  });
  if (!p) notFound();
  const [occurrences, reviews] = await Promise.all([
    db.query.mistakeOccurrences.findMany({
      where: eq(mistakeOccurrences.mistakePatternId, id), orderBy: asc(mistakeOccurrences.detectedAt),
    }),
    db.query.mistakeReviews.findMany({
      where: eq(mistakeReviews.mistakePatternId, id), orderBy: desc(mistakeReviews.reviewedAt), limit: 20,
    }),
  ]);
  const explanation = p.explanation
    ?? [...occurrences].reverse().find((o) => o.correctedText)?.correctedText
    ?? 'No explanation recorded yet.';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{p.label ?? p.errorSignature}</h1>
        <code className="text-xs text-fg-muted">{p.errorSignature}</code>
        <p className="mt-1 text-sm text-fg-muted">
          {p.domain} · {p.subcategory} · {p.occurrenceCount} occurrence{p.occurrenceCount === 1 ? '' : 's'} ·
          first seen {p.firstSeenAt.toISOString().slice(0, 10)} · last {p.lastSeenAt.toISOString().slice(0, 10)} ·
          status {p.status}
        </p>
      </div>

      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-1 font-semibold">Explanation</h2>
        <p className="text-sm">{explanation}</p>
        {p.recommendedPattern && (
          <p className="mt-2 text-sm text-fg-muted">Recommended: {p.recommendedPattern}</p>
        )}
      </section>

      <MistakeDrill patternId={p.id} originalExample={p.originalExample} correctedExample={p.correctedExample} />

      <section>
        <h2 className="mb-2 font-semibold">Occurrences</h2>
        <ul className="space-y-2">
          {occurrences.map((o) => (
            <li key={o.id} className="rounded-lg border border-border p-3 text-sm">
              <div><span className="text-red-600 line-through">{o.originalText}</span>{' → '}<span className="text-green-700">{o.correctedText}</span></div>
              <div className="text-xs text-fg-muted">{o.context} · {o.detectedAt.toISOString().slice(0, 10)}</div>
            </li>
          ))}
        </ul>
      </section>

      {!!reviews.length && (
        <section>
          <h2 className="mb-2 font-semibold">Review history</h2>
          <ul className="space-y-1 text-sm text-fg-muted">
            {reviews.map((r) => (
              <li key={r.id}>{r.reviewedAt.toISOString().slice(0, 10)} — {r.successful ? 'success' : 'missed'} ({r.context})</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
