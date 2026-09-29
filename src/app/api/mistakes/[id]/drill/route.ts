import { NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { assertSameOrigin } from '@/lib/security/origin';
import { learningSessions, mistakePatterns, sessionTurns } from '@/lib/db/schema';
import { EvaluationService } from '@/server/services/evaluation';
import { getAI } from '@/lib/ai';
import { REGISTER_EVALUATOR_SYSTEM } from '@/lib/ai/prompts/evaluators';
import { RegisterEvaluationSchema } from '@/lib/evaluation/schemas';
import { MistakeService } from '@/server/services/mistake';
import { takeTokens } from '@/lib/security/rate-limit';

const Body = z.object({
  type: z.enum(['correct', 'produce', 'register']),
  text: z.string().min(1).max(4000),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const body = Body.parse(await req.json());
  const db = await getDb();

  const pattern = await db.query.mistakePatterns.findFirst({
    where: and(eq(mistakePatterns.id, id), eq(mistakePatterns.learnerId, session.userId)),
  });
  if (!pattern) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const words = body.text.trim().split(/\s+/).filter(Boolean);
  let success = false;
  let feedback = '';

  if (body.type === 'correct') {
    const wrong = (pattern.originalExample ?? '').toLowerCase();
    const fixed = body.text.toLowerCase();
    // learner re-wrote the sentence: the quoted error span must be gone
    success = words.length >= 4 && (!wrong || !fixed.includes(wrong.trim().toLowerCase()));
    feedback = success ? 'The original error is gone.' : 'The original error words still appear — rewrite the whole sentence.';
  } else {
    // produce / register: run the real evaluator, success = this signature absent
    const [sess] = await db.insert(learningSessions).values({
      learnerId: session.userId, sessionType: 'vault-drill', sessionGoal: `vault-drill:${body.type}`,
    }).returning();
    const [turn] = await db.insert(sessionTurns).values({
      sessionId: sess!.id, role: 'learner', content: body.text,
    }).returning();
    const { evaluation } = await new EvaluationService(db).evaluateTurn(turn!.id, {
      taskPrompt: `Produce a correct sentence using: ${pattern.label ?? pattern.errorSignature}`,
      register: 'neutral', learnerSignatures: [pattern.errorSignature],
    });
    const errors = (evaluation.grammarErrors as { rule: string; quote: string }[]);
    const sig = pattern.errorSignature;
    const reappeared = errors.some((e) =>
      sig === `${e.rule}` || sig.endsWith(`:${e.rule}`) || sig === e.rule);
    success = !reappeared && words.length >= 6;
    feedback = success
      ? 'Clean production — the pattern did not reappear.'
      : `The pattern reappeared: ${errors.find((e) => sig.endsWith(`:${e.rule}`))?.quote ?? 'check your sentence'}`;
    if (body.type === 'register') {
      const reg = await getAI().llm.structured({
        name: 'register-evaluation', schema: RegisterEvaluationSchema, tier: 'balanced',
        system: REGISTER_EVALUATOR_SYSTEM,
        messages: [{ role: 'user', content:
          `Meaning to express: ${pattern.originalExample ?? pattern.errorSignature}\nTarget register: formal\nAttempt: ${body.text}` }],
      });
      success = success && reg.data.registerFit.score >= 60 && reg.data.meaningPreserved.value;
      feedback = `${feedback} Register fit ${reg.data.registerFit.score}/100 — ${reg.data.oneAdjustment}`;
    }
  }

  const updated = await new MistakeService(db)
    .recordReview(pattern.id, success, `vault-drill:${body.type}`);
  return NextResponse.json({ success, feedback, status: updated.status });
}
