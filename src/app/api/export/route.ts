import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import {
  learnerProfiles, mistakePatterns,
  learnerVocabulary, vocabularyItems, learningSessions, journalEntries,
  assessments, cefrEstimates, learnerSkillStates,
} from '@/lib/db/schema';
import { ProgressService } from '@/server/services/progress';

const toCsv = (rows: Record<string, unknown>[]) => {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
};

// §71 — full export; CSV per entity via ?entity=
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const entity = url.searchParams.get('entity');
  const db = await getDb();
  const uid = session.userId;

  const vocab = await db
    .select({ word: vocabularyItems.word, meaning: vocabularyItems.meaning, status: learnerVocabulary.status, nextReviewAt: learnerVocabulary.nextReviewAt })
    .from(learnerVocabulary).innerJoin(vocabularyItems, eq(learnerVocabulary.vocabularyItemId, vocabularyItems.id))
    .where(eq(learnerVocabulary.learnerId, uid));

  const flat = {
    mistakes: (await db.query.mistakePatterns.findMany({ where: eq(mistakePatterns.learnerId, uid) }))
      .map((m) => ({ label: m.label, signature: m.errorSignature, status: m.status, occurrences: m.occurrenceCount })),
    vocabulary: vocab,
    sessions: (await db.query.learningSessions.findMany({ where: eq(learningSessions.learnerId, uid), orderBy: desc(learningSessions.createdAt), limit: 2000 }))
      .map((s) => ({ type: s.sessionType, at: s.createdAt, minutes: s.durationSeconds })),
    journal: (await db.query.journalEntries.findMany({ where: eq(journalEntries.learnerId, uid) }))
      .map((j) => ({ at: j.createdAt, prompt: j.prompt, content: j.content })),
    assessments: (await db.query.assessments.findMany({ where: eq(assessments.learnerId, uid) }))
      .map((a) => ({ id: a.id, status: a.status, at: a.createdAt, result: a.result })),
    progress: (await new ProgressService(db).timeseries(uid, 'all')).buckets,
  } as const;

  if (entity) {
    const rows = flat[entity as keyof typeof flat];
    if (!rows) return NextResponse.json({ error: 'bad entity', index: Object.keys(flat) }, { status: 404 });
    return new NextResponse(toCsv(rows as unknown as Record<string, unknown>[]), {
      headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="export-${entity}.csv"` },
    });
  }

  const [profile, occs, reviews, cefr, skills] = await Promise.all([
    db.query.learnerProfiles.findFirst({ where: eq(learnerProfiles.learnerId, uid) }),
    db.query.mistakeOccurrences.findMany({ limit: 5000 }),
    db.query.mistakeReviews.findMany({ limit: 5000 }),
    db.query.cefrEstimates.findMany({ where: eq(cefrEstimates.learnerId, uid) }),
    db.query.learnerSkillStates.findMany({ where: eq(learnerSkillStates.learnerId, uid) }),
  ]);
  const out = {
    profile, progress: flat.progress,
    mistakes: { patterns: flat.mistakes, occurrences: occs, reviews },
    vocabulary: flat.vocabulary, sessions: flat.sessions,
    journal: flat.journal, assessments: flat.assessments,
    cefrEstimates: cefr, skillStates: skills,
  };
  return NextResponse.json(out, {
    headers: { 'Content-Disposition': 'attachment; filename="english-mastery-export.json"' },
  });
}
