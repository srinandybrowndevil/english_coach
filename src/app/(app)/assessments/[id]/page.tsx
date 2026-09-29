import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assessments } from '@/lib/db/schema';

export const metadata = { title: 'Assessment results' };

type Result = {
  overall?: { level: string | null; confidence: string; gate?: string; breakdown?: Record<string, { level: string; score: number }> };
  domainScores?: Record<string, { score: number; evidenceCount: number }>;
  strengths?: string[];
  weaknesses?: string[];
  recurringPatterns?: string[];
  pronunciationFocus?: string[];
  fluencyProfile?: { count: number; meanFluency: number } | null;
  vocabularyProfile?: { domainScore: number | null };
  businessProfile?: { domainScore: number | null; note?: string };
  recommendedCurriculum?: string[];
};

export default async function AssessmentResultPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const a = await (await getDb()).query.assessments.findFirst({
    where: and(eq(assessments.id, id), eq(assessments.learnerId, session.userId)),
  });
  if (!a) notFound();
  const r = (a.result ?? {}) as Result;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold capitalize">{a.kind} assessment — results</h1>

      <section className="rounded-xl border border-border p-5">
        <div className="text-xs uppercase text-fg-muted">Estimated level (application estimate)</div>
        <div className="mt-1 text-3xl font-bold uppercase">
          {r.overall?.level ?? '—'}
          <span className="ml-2 align-middle text-sm font-normal text-fg-muted">
            confidence: {r.overall?.confidence ?? 'low'}
          </span>
        </div>
        {r.overall?.gate && <p className="mt-1 text-sm text-fg-muted">{r.overall.gate}</p>}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Domain breakdown</h2>
        <ul className="space-y-1 text-sm">
          {Object.entries(r.domainScores ?? {}).map(([d, v]) => (
            <li key={d} className="flex justify-between rounded bg-surface px-3 py-1.5">
              <span className="capitalize">{d}</span>
              <span>{v.evidenceCount ? `${Math.round(v.score / Math.max(1, v.evidenceCount))}/100` : 'no evidence'}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <h2 className="mb-2 font-semibold">Strengths</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-fg-muted">
            {(r.strengths ?? []).map((s, i) => <li key={i}>{s}</li>)}
            {!r.strengths?.length && <li>No strong evidence yet.</li>}
          </ul>
        </section>
        <section>
          <h2 className="mb-2 font-semibold">Weaknesses</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-fg-muted">
            {(r.weaknesses ?? []).map((s, i) => <li key={i}>{s}</li>)}
            {!r.weaknesses?.length && <li>Nothing flagged.</li>}
          </ul>
        </section>
      </div>

      {!!r.recurringPatterns?.length && (
        <section>
          <h2 className="mb-2 font-semibold">Recurring patterns</h2>
          <ul className="list-inside list-disc text-sm text-fg-muted">
            {r.recurringPatterns.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </section>
      )}

      {!!r.pronunciationFocus?.length && (
        <section>
          <h2 className="mb-2 font-semibold">Pronunciation focus</h2>
          <ul className="list-inside list-disc text-sm text-fg-muted">
            {r.pronunciationFocus.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </section>
      )}

      <section className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-fg-muted">Fluency</div>
          <div>{r.fluencyProfile ? `${r.fluencyProfile.meanFluency}/100 across ${r.fluencyProfile.count} spoken items` : 'Not enough spoken evidence'}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-fg-muted">Vocabulary</div>
          <div>{r.vocabularyProfile?.domainScore != null ? 'see domain breakdown' : 'No evidence'}</div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-xs text-fg-muted">Business</div>
          <div>{r.businessProfile?.note ?? 'see domain breakdown'}</div>
        </div>
      </section>

      {!!r.recommendedCurriculum?.length && (
        <section>
          <h2 className="mb-2 font-semibold">Recommended starting curriculum</h2>
          <ol className="list-inside list-decimal text-sm text-fg-muted">
            {r.recommendedCurriculum.map((s) => <li key={s}>{s.replace(/-/g, ' ')}</li>)}
          </ol>
        </section>
      )}

      <Link href="/" className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white">
        Go to Home
      </Link>
    </div>
  );
}
