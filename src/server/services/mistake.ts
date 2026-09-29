import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { mistakeOccurrences, mistakePatterns, mistakeReviews, sessionTurns } from '@/lib/db/schema';
import { detectFossilised } from '@/lib/memory/fossilised';
import { normaliseRule } from '@/lib/memory/rules';
import { applyOccurrence, applyReview, buildSignature, type MistakePatternState } from '@/lib/memory/mistakes';
import type { GrammarError } from '@/lib/evaluation/schemas';

type PatternRow = typeof mistakePatterns.$inferSelect;

// DB row -> pure state used by src/lib/memory/mistakes.ts
export function toState(row: PatternRow): MistakePatternState {
  return {
    errorSignature: row.errorSignature,
    domain: row.domain,
    subcategory: row.subcategory ?? '',
    severity: row.severity,
    status: row.status,
    occurrenceCount: row.occurrenceCount,
    contextsSeen: row.contextsSeen,
    successfulReviewCount: row.successfulReviewCount,
    reviewStreak: row.reviewStreak,
    firstSeenAt: row.firstSeenAt,
    lastSeenAt: row.lastSeenAt,
    nextReviewAt: row.nextReviewAt,
    intervalIndex: row.intervalIndex,
    easeFactor: row.easeFactor,
    successHistory: row.successHistory.map((h) => ({ at: new Date(h.at), context: h.context })),
    monitoringSince: row.monitoringSince ?? undefined,
  };
}

function fromState(s: MistakePatternState) {
  return {
    domain: s.domain, subcategory: s.subcategory || '', severity: s.severity,
    status: s.status, occurrenceCount: s.occurrenceCount, contextsSeen: s.contextsSeen,
    successfulReviewCount: s.successfulReviewCount, reviewStreak: s.reviewStreak,
    firstSeenAt: s.firstSeenAt, lastSeenAt: s.lastSeenAt, nextReviewAt: s.nextReviewAt,
    intervalIndex: s.intervalIndex, easeFactor: s.easeFactor,
    successHistory: s.successHistory.map((h) => ({ at: h.at.toISOString(), context: h.context })),
    monitoringSince: s.monitoringSince ?? null, updatedAt: new Date(),
  };
}

// Pure merge: fossilised detections + LLM errors → one item per signature.
export function mergeDetections(errors: GrammarError[], text: string): {
  signature: string; quote: string; correction: string; explanation: string;
  category: string; subcategory: string; label: string; severity: 1 | 2 | 3; kind: string;
}[] {
  const out = new Map<string, ReturnType<typeof mergeDetections>[number]>();
  for (const e of errors) {
    const canon = normaliseRule(e.category, e.rule);
    const signature = buildSignature({ domain: canon.domain, rule: canon.ruleId });
    if (!out.has(signature))
      out.set(signature, {
        signature, quote: e.quote, correction: e.correction, explanation: e.explanation,
        category: canon.domain, subcategory: e.subcategory || canon.subcategory,
        label: canon.label, severity: e.severity, kind: e.kind,
      });
  }
  for (const d of detectFossilised(text)) {
    const canon = normaliseRule(d.category, d.signature.split(':').pop()!);
    const signature = buildSignature({ domain: canon.domain, rule: canon.ruleId });
    if (!out.has(signature))
      out.set(signature, {
        signature, quote: d.span, correction: d.internationalForm,
        explanation: d.explanation, category: canon.domain,
        subcategory: d.subcategory || canon.subcategory,
        label: canon.label, severity: 1, kind: 'regional',
      });
  }
  return [...out.values()];
}

export class MistakeService {
  constructor(private db: Db) {}

  async recordDetected(
    userId: string,
    errors: GrammarError[],
    text: string,
    ctx: { sessionId?: string; turnId?: string; context: string },
  ): Promise<PatternRow[]> {
    const items = mergeDetections(errors, text);
    if (!items.length) return [];
    const now = new Date();
    const updated: PatternRow[] = [];

    await this.db.transaction(async (tx) => {
      for (const item of items) {
        const existing = await tx.query.mistakePatterns.findFirst({
          where: and(eq(mistakePatterns.learnerId, userId), eq(mistakePatterns.errorSignature, item.signature)),
        });
        const state = applyOccurrence(existing ? toState(existing) : null, {
          context: ctx.context, at: now, severity: item.severity,
          signature: item.signature, domain: item.category, subcategory: item.subcategory,
        });
        const fields = fromState(state);
        let row: PatternRow | undefined;
        if (existing) {
          [row] = await tx.update(mistakePatterns).set({
            ...fields,
            originalExample: existing.originalExample ?? item.quote,
            correctedExample: item.correction,
            explanation: existing.explanation ?? item.explanation,
            label: existing.label ?? item.label,
          }).where(eq(mistakePatterns.id, existing.id)).returning();
        } else {
          [row] = await tx.insert(mistakePatterns).values({
            learnerId: userId, errorSignature: item.signature,
            originalExample: item.quote, correctedExample: item.correction,
            explanation: item.explanation, label: item.label, ...fields,
          }).returning();
        }
        await tx.insert(mistakeOccurrences).values({
          mistakePatternId: row!.id, sessionId: ctx.sessionId, turnId: ctx.turnId,
          originalText: item.quote, correctedText: item.correction, context: ctx.context,
        });
        updated.push(row!);
      }
    });
    return updated;
  }

  async recordReview(patternId: string, success: boolean, context: string): Promise<PatternRow> {
    const row = await this.db.query.mistakePatterns.findFirst({ where: eq(mistakePatterns.id, patternId) });
    if (!row) throw new Error(`mistake pattern ${patternId} not found`);
    const state = applyReview(toState(row), { success, context, at: new Date() });
    const [updated] = await this.db.update(mistakePatterns).set(fromState(state))
      .where(eq(mistakePatterns.id, patternId)).returning();
    await this.db.insert(mistakeReviews).values({ mistakePatternId: patternId, successful: success, context });
    return updated!;
  }

  async due(userId: string, limit = 10): Promise<PatternRow[]> {
    const rows = await this.db.query.mistakePatterns.findMany({
      where: and(eq(mistakePatterns.learnerId, userId), inArray(mistakePatterns.status, ['relapsed', 'recurring', 'improving', 'new'])),
      limit: 200,
    });
    const rank = (r: PatternRow) => (r.status === 'relapsed' ? 0 : r.status === 'recurring' ? 1 : 2);
    return rows
      .sort((a, b) => rank(a) - rank(b)
        || (a.nextReviewAt?.getTime() ?? 0) - (b.nextReviewAt?.getTime() ?? 0))
      .slice(0, limit);
  }

  async list(userId: string, opts: { status?: string; limit?: number; offset?: number } = {}) {
    return this.db.query.mistakePatterns.findMany({
      where: and(
        eq(mistakePatterns.learnerId, userId),
        opts.status ? eq(mistakePatterns.status, opts.status as PatternRow['status']) : sql`true`,
      ),
      orderBy: desc(mistakePatterns.lastSeenAt),
      limit: opts.limit ?? 50, offset: opts.offset ?? 0,
    });
  }

  async getTurn(turnId: string) {
    return this.db.query.sessionTurns.findFirst({ where: eq(sessionTurns.id, turnId) });
  }
}
