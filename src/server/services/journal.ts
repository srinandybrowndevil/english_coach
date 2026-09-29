import { and, eq } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { journalEntries } from '@/lib/db/schema';
import { getAI } from '@/lib/ai';
import { JOURNAL_ANALYSIS_SYSTEM, EVALUATOR_PROMPT_VERSION } from '@/lib/ai/prompts/evaluators';
import { JournalAnalysisSchema } from '@/lib/evaluation/schemas';
import { MistakeService } from '@/server/services/mistake';
import { recordAIEvent } from '@/lib/ai/usage';
import { ensurePromptVersion } from '@/server/services/prompt-version';

export class JournalService {
  constructor(private db: Db) {}

  async analyse(userId: string, entryId: string) {
    const entry = await this.db.query.journalEntries.findFirst({
      where: and(eq(journalEntries.id, entryId), eq(journalEntries.learnerId, userId)),
    });
    if (!entry?.content) throw new Error('journal entry not found');
    const res = await getAI().llm.structured({
      name: 'journal-analysis', schema: JournalAnalysisSchema, tier: 'balanced',
      system: JOURNAL_ANALYSIS_SYSTEM,
      messages: [{ role: 'user', content: `Journal entry:\n${entry.content}` }],
    });
    await this.db.update(journalEntries).set({ analysis: res.data as never })
      .where(eq(journalEntries.id, entryId));
    if (res.data.grammarErrors.length) {
      await new MistakeService(this.db).recordDetected(userId, res.data.grammarErrors, entry.content,
        { context: 'journal' });
    }
    await recordAIEvent({
      kind: 'journal-analysis', provider: 'llm', model: res.model, ms: 0,
      evaluatorVersion: 'journal.v1',
      promptVersionId: await ensurePromptVersion(this.db, 'evaluators', EVALUATOR_PROMPT_VERSION, JOURNAL_ANALYSIS_SYSTEM),
      confidence: 'medium', inputEvidence: { words: entry.content.split(/\s+/).length },
    });
    return res.data;
  }
}
