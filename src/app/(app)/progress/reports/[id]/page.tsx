import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { weeklyReports, monthlyReports } from '@/lib/db/schema';

type Report = {
  period: string; start: string; end: string; minutesPractised: number;
  sessionsCompleted: number; sessionTypes: string[]; wordsAddedToVocabulary: number;
  mistakesDetected: number; reviewItemsDone: number; patternsResolved: string[];
  activePatterns: string[]; avgScore: number | null;
  currentCefr: { level: string; confidence: string } | null;
  vsPriorPeriod: { minutesFrom: number; minutesTo: number };
  bestSpeakingSample: { turnId: string; excerpt: string; fluencyTotal: number } | null;
  recommendedNextFocus: string;
};

export default async function ReportPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ kind?: string }>;
}) {
  const session = await requireSession();
  const { id } = await params; const kind = (await searchParams).kind ?? 'weekly';
  const db = await getDb();
  const row = await (kind === 'monthly' ? db.query.monthlyReports : db.query.weeklyReports).findFirst({
    where: and(
      eq((kind === 'monthly' ? monthlyReports : weeklyReports).id, id),
      eq((kind === 'monthly' ? monthlyReports : weeklyReports).learnerId, session.userId),
    ),
  });
  if (!row) notFound();
  const r = row.report as Report;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{kind === 'monthly' ? 'Monthly' : 'Weekly'} report — {r.start}</h1>
      <div className="rounded-xl border border-border p-4 text-sm space-y-1">
        <p><strong>{r.minutesPractised}</strong> min practised across <strong>{r.sessionsCompleted}</strong> sessions ({r.sessionTypes.join(', ')})</p>
        <p>vs prior {r.period}: {r.vsPriorPeriod.minutesFrom} → {r.vsPriorPeriod.minutesTo} min</p>
        <p>Vocabulary added: {r.wordsAddedToVocabulary}</p>
        <p>Mistakes detected: {r.mistakesDetected} · reviews done: {r.reviewItemsDone}</p>
        <p>Average score: {r.avgScore ?? '—'}</p>
        {r.currentCefr && <p>CEFR estimate: <strong>{r.currentCefr.level}</strong> ({r.currentCefr.confidence})</p>}
      </div>
      {!!r.patternsResolved.length && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-semibold">Patterns mastered</p>
          <ul className="list-inside list-disc">{r.patternsResolved.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      {!!r.activePatterns.length && (
        <div className="rounded-xl border border-amber-200 p-4 text-sm">
          <p className="font-semibold">Still active</p>
          <ul className="list-inside list-disc">{r.activePatterns.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      {r.bestSpeakingSample && (
        <div className="rounded-xl border border-border p-4 text-sm">
          <p className="font-semibold">Best speaking sample (fluency {r.bestSpeakingSample.fluencyTotal})</p>
          <p className="mt-1 italic">“{r.bestSpeakingSample.excerpt}”</p>
        </div>
      )}
      <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 text-sm">
        <p className="font-semibold">{kind === 'monthly' ? 'Monthly objective' : 'Challenge for next week'}</p>
        <p>{r.recommendedNextFocus}</p>
      </div>
    </div>
  );
}
