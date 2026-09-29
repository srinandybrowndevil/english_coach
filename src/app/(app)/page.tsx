import Link from 'next/link';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assessments, cefrEstimates, learnerProfiles, learningSessions } from '@/lib/db/schema';
import { CurriculumService } from '@/server/services/curriculum';
import { MistakeService } from '@/server/services/mistake';
import { ProgressService } from '@/server/services/progress';
import { VocabularyService } from '@/server/services/vocabulary';
import { SkillRadar } from './SkillRadar';

export const metadata = { title: 'Home' };

export default async function HomePage() {
  const session = await requireSession();
  const db = await getDb();
  const curriculum = new CurriculumService(db);
  const progress = new ProgressService(db);

  const [profile, latestCefr, streak, today, radar, improvement, mistakesDue, vocabDue, unfinished, initialDone] = await Promise.all([
    db.query.learnerProfiles.findFirst({ where: eq(learnerProfiles.learnerId, session.userId) }),
    db.query.cefrEstimates.findFirst({ where: eq(cefrEstimates.learnerId, session.userId), orderBy: desc(cefrEstimates.createdAt) }),
    progress.streak(session.userId),
    curriculum.todayPlan(session.userId),
    progress.skillRadar(session.userId),
    progress.recentImprovement(session.userId),
    new MistakeService(db).due(session.userId, 5),
    new VocabularyService(db).due(session.userId, 100),
    db.query.learningSessions.findFirst({
      where: and(eq(learningSessions.learnerId, session.userId), isNull(learningSessions.endedAt)),
      orderBy: desc(learningSessions.createdAt),
    }),
    db.query.assessments.findFirst({
      where: and(eq(assessments.learnerId, session.userId), eq(assessments.kind, 'initial'), eq(assessments.status, 'completed')),
    }),
  ]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = profile?.name ?? 'Srinivash';
  const doneItems = today?.items.filter((i) => i.status === 'done' || i.status === 'skipped').length ?? 0;
  const totalItems = today?.items.length ?? 0;
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : null;
  const challenge = today?.items.find((i) => i.status === 'pending') ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{greet}, {name}</h1>
        <p className="text-sm text-fg-muted">
          Level: {latestCefr?.level ? latestCefr.level.toUpperCase() : 'not measured yet'} · Streak: {streak} day{streak === 1 ? '' : 's'} · Today: {pct === null ? 'no plan yet' : `${pct}% done`}
        </p>
      </header>

      {!initialDone && (
        <div className="rounded-xl border border-accent/50 bg-accent/5 p-5">
          <h2 className="font-semibold">Complete your initial assessment</h2>
          <p className="mt-1 text-sm text-fg-muted">~45 minutes. It measures your level and builds your curriculum.</p>
          <Link href="/assessment/initial" className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
            Start assessment
          </Link>
        </div>
      )}

      <Link href="/daily" className="block rounded-xl bg-accent px-6 py-4 text-center text-lg font-semibold text-white">
        Start Today&apos;s Training
      </Link>

      <nav aria-label="Quick actions" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          ['Talk to Tutor', '/tutor'], ['5-Minute Fluency Drill', '/fluency?drill=60s'],
          ['Practice Pronunciation', '/pronunciation'], ['Start Negotiation', '/negotiation'],
          ['Quick Grammar', '/grammar'], ['Review Mistakes', '/mistakes'],
        ].map(([label, href]) => (
          <Link key={href} href={href!} className="rounded-lg border border-border px-3 py-2.5 text-center text-sm hover:bg-surface">
            {label}
          </Link>
        ))}
      </nav>

      <section>
        <h2 className="mb-2 font-semibold">Skill radar</h2>
        <SkillRadar data={radar} />
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Current focus</h2>
        {profile?.weakSkills && (profile.weakSkills as string[]).length ? (
          <ul className="list-inside list-disc text-sm text-fg-muted">
            {(profile.weakSkills as string[]).slice(0, 5).map((s) => <li key={s}>{s.replace(/-/g, ' ')}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-fg-muted">Your focus list appears after the assessment.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Recent improvement</h2>
        <ul className="space-y-1 text-sm">
          <li>Filler rate: {improvement.fillerRate ? `${improvement.fillerRate.from.toFixed(1)} → ${improvement.fillerRate.to.toFixed(1)} per 100 words ${improvement.fillerRate.to < improvement.fillerRate.from ? '↓' : '↑'}` : 'Not enough data yet'}</li>
          <li>Past-tense error patterns: {improvement.pastTenseErrors ? `${improvement.pastTenseErrors.count} active` : 'Not enough data yet'}</li>
          <li>Speaking duration: {improvement.speakingDuration ? `${Math.round(improvement.speakingDuration.from)}s → ${Math.round(improvement.speakingDuration.to)}s ${improvement.speakingDuration.to > improvement.speakingDuration.from ? '↑' : '↓'}` : 'Not enough data yet'}</li>
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-1 font-semibold">Continue learning</h2>
          {unfinished ? (
            <Link href={`/sessions/${unfinished.id}`} className="text-sm text-accent underline">
              Resume {unfinished.sessionType} session
            </Link>
          ) : (
            <p className="text-sm text-fg-muted">Nothing in progress.</p>
          )}
        </section>
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-1 font-semibold">Daily challenge</h2>
          {challenge ? (
            <Link href={challenge.moduleRoute ?? '/daily'} className="text-sm text-accent underline">{challenge.title} (~{challenge.estMinutes} min)</Link>
          ) : (
            <p className="text-sm text-fg-muted">Generate today&apos;s plan to get your challenge.</p>
          )}
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-1 font-semibold">Mistakes due</h2>
          {mistakesDue.length ? (
            <ul className="text-sm text-fg-muted">
              {mistakesDue.map((m) => <li key={m.id}>{m.errorSignature} — ×{m.occurrenceCount}</li>)}
            </ul>
          ) : <p className="text-sm text-fg-muted">No mistakes due for review.</p>}
        </section>
        <section className="rounded-xl border border-border p-4">
          <h2 className="mb-1 font-semibold">Vocabulary due</h2>
          <p className="text-sm text-fg-muted">{vocabDue.length} item{vocabDue.length === 1 ? '' : 's'} ready for review.</p>
        </section>
      </div>
    </div>
  );
}
