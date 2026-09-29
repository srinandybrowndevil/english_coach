import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import {
  learningSessions, sessionTurns, speechMetrics, mistakePatterns, mistakeOccurrences,
  mistakeReviews, learnerVocabulary, vocabularyReviews, learnerSkillStates,
  dailyPlans, dailyPlanItems, assessments, assessmentResponses, journalEntries,
  weeklyReports, monthlyReports, tutorMemories, cefrEstimates, curriculumPlans,
  exerciseAttempts, roleplaySessions, roleplayTurns, writingSubmissions,
  readingAttempts, listeningAttempts, aiEvaluationEvents,
} from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

const Body = z.object({ confirm: z.literal('DELETE') });

// §45/§71 — wipes learner-generated rows; user + settings + seed content survive
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  assertSameOrigin(req);
  Body.parse(await req.json());
  const db = await getDb();
  const uid = session.userId;
  await db.transaction(async (tx) => {
    const sessIds = (await tx.select({ id: learningSessions.id }).from(learningSessions)
      .where(eq(learningSessions.learnerId, uid))).map((s) => s.id);
    if (sessIds.length) {
      await tx.delete(sessionTurns).where(inArray(sessionTurns.sessionId, sessIds));
      await tx.delete(speechMetrics).where(inArray(speechMetrics.sessionId, sessIds));
    }
    const rpIds = (await tx.select({ id: roleplaySessions.id }).from(roleplaySessions)
      .where(eq(roleplaySessions.learnerId, uid))).map((s) => s.id);
    if (rpIds.length) await tx.delete(roleplayTurns).where(inArray(roleplayTurns.roleplaySessionId, rpIds));
    const planIds = (await tx.select({ id: dailyPlans.id }).from(dailyPlans)
      .where(eq(dailyPlans.learnerId, uid))).map((s) => s.id);
    if (planIds.length) await tx.delete(dailyPlanItems).where(inArray(dailyPlanItems.dailyPlanId, planIds));
    const patIds = (await tx.select({ id: mistakePatterns.id }).from(mistakePatterns)
      .where(eq(mistakePatterns.learnerId, uid))).map((s) => s.id);
    if (patIds.length) {
      await tx.delete(mistakeOccurrences).where(inArray(mistakeOccurrences.mistakePatternId, patIds));
      await tx.delete(mistakeReviews).where(inArray(mistakeReviews.mistakePatternId, patIds));
    }
    const assessIds = (await tx.select({ id: assessments.id }).from(assessments)
      .where(eq(assessments.learnerId, uid))).map((s) => s.id);
    if (assessIds.length) await tx.delete(assessmentResponses).where(inArray(assessmentResponses.assessmentId, assessIds));

    await tx.delete(roleplaySessions).where(eq(roleplaySessions.learnerId, uid));
    await tx.delete(learningSessions).where(eq(learningSessions.learnerId, uid));
    await tx.delete(mistakePatterns).where(eq(mistakePatterns.learnerId, uid));
    const lvIds = (await tx.select({ id: learnerVocabulary.id }).from(learnerVocabulary)
      .where(eq(learnerVocabulary.learnerId, uid))).map((s) => s.id);
    if (lvIds.length) await tx.delete(vocabularyReviews).where(inArray(vocabularyReviews.learnerVocabularyId, lvIds));
    await tx.delete(learnerVocabulary).where(eq(learnerVocabulary.learnerId, uid));
    await tx.delete(learnerSkillStates).where(eq(learnerSkillStates.learnerId, uid));
    await tx.delete(dailyPlans).where(eq(dailyPlans.learnerId, uid));
    await tx.delete(assessments).where(eq(assessments.learnerId, uid));
    await tx.delete(journalEntries).where(eq(journalEntries.learnerId, uid));
    await tx.delete(weeklyReports).where(eq(weeklyReports.learnerId, uid));
    await tx.delete(monthlyReports).where(eq(monthlyReports.learnerId, uid));
    await tx.delete(tutorMemories).where(eq(tutorMemories.learnerId, uid));
    await tx.delete(cefrEstimates).where(eq(cefrEstimates.learnerId, uid));
    await tx.delete(curriculumPlans).where(eq(curriculumPlans.learnerId, uid));
    await tx.delete(exerciseAttempts).where(eq(exerciseAttempts.learnerId, uid));
    await tx.delete(writingSubmissions).where(eq(writingSubmissions.learnerId, uid));
    await tx.delete(readingAttempts).where(eq(readingAttempts.learnerId, uid));
    await tx.delete(listeningAttempts).where(eq(listeningAttempts.learnerId, uid));
    await tx.delete(aiEvaluationEvents);
  });
  return NextResponse.json({ ok: true });
}
