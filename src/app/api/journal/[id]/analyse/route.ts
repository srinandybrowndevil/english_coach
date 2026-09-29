import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { getAI } from '@/lib/ai';
import { assertSameOrigin } from '@/lib/security/origin';
import { JOURNAL_ANALYSIS_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { JournalAnalysisSchema } from '@/lib/evaluation/schemas';
import { journalEntries } from '@/lib/db/schema';
import { MistakeService } from '@/server/services/mistake';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';
import { takeTokens } from '@/lib/security/rate-limit';

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!takeTokens(session.userId)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  assertSameOrigin(req);
  const { id } = await ctx.params;
  const db = await getDb();
  const entry = await db.query.journalEntries.findFirst({
    where: and(eq(journalEntries.id, id), eq(journalEntries.learnerId, session.userId)),
  });
  if (!entry?.content) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const res = await getAI().llm.structured({
    name: 'journal-analysis', schema: JournalAnalysisSchema, tier: 'balanced',
    system: JOURNAL_ANALYSIS_SYSTEM,
    messages: [{ role: 'user', content: `Journal entry:\n${entry.content}` }],
  });
  await db.update(journalEntries).set({ analysis: res.data as never })
    .where(eq(journalEntries.id, id));
  if (res.data.grammarErrors.length) {
    await new MistakeService(db).recordDetected(session.userId, res.data.grammarErrors, entry.content,
      { context: 'journal' });
  }
  await recordAIEvent({
    kind: 'journal-analysis', provider: 'llm', model: res.model, ms: 0,
    evaluatorVersion: 'journal.v1',
    promptVersionId: await ensurePromptVersion(db, 'evaluators', EVALUATOR_PROMPT_VERSION, JOURNAL_ANALYSIS_SYSTEM),
    confidence: 'medium', inputEvidence: { words: entry.content.split(/\s+/).length },
  });
  return NextResponse.json(res.data);
}
