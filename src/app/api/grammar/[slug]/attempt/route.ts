import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { contentItems, learningSessions, sessionTurns } from '@/lib/db/schema';
import { ruleIdsForLesson } from '@/content/lesson-rules';
import { EvaluationService } from '@/server/services/evaluation';
import { CurriculumService } from '@/server/services/curriculum';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  kind: z.enum(['quiz', 'speaking', 'writing']),
  correct: z.boolean().optional(),
  text: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const { slug } = await ctx.params;
  const body = Body.parse(await req.json());
  const db = await getDb();

  const item = await db.query.contentItems.findFirst({ where: eq(contentItems.slug, slug) });
  if (!item) return NextResponse.json({ error: 'lesson_not_found' }, { status: 404 });
  const skillSlug = (item.payload as { skillSlug: string }).skillSlug;
  const ruleIds = new Set(ruleIdsForLesson(slug));
  const curriculum = new CurriculumService(db);

  if (body.kind === 'quiz') {
    const upd = await curriculum.recordSkillAttempt(session.userId, skillSlug, !!body.correct, `grammar-quiz:${slug}`);
    return NextResponse.json({ ok: true, skillStatus: upd?.status });
  }

  const text = body.text?.trim() ?? '';
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 });

  const [sess] = await db.insert(learningSessions).values({
    learnerId: session.userId, sessionType: 'grammar-lesson', sessionGoal: `grammar:${slug}:${body.kind}`,
  }).returning();
  const [turn] = await db.insert(sessionTurns).values({
    sessionId: sess!.id, role: 'learner', content: text,
  }).returning();
  const { evaluation } = await new EvaluationService(db).evaluateTurn(turn!.id, {
    taskPrompt: (item.payload as { speakingPrompt?: string; writingPrompt?: string })[
      body.kind === 'speaking' ? 'speakingPrompt' : 'writingPrompt'] ?? 'Produce correct English.',
    register: 'neutral',
  });
  const errs = evaluation.grammarErrors as { rule: string }[];
  const hit = ruleIds.size ? errs.filter((e) => ruleIds.has(e.rule)) : errs;
  const correct = hit.length === 0;
  const upd = await curriculum.recordSkillAttempt(session.userId, skillSlug, correct, `grammar-${body.kind}:${slug}`);
  return NextResponse.json({
    correct, errors: errs, skillStatus: upd?.status,
    nextReviewAt: upd?.nextReviewAt ?? null,
  });
}
