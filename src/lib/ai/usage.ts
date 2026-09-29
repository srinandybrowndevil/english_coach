import { getDb } from '@/lib/db/client';
import { aiEvaluationEvents } from '@/lib/db/schema';
import type { TokenUsage } from './types';

export type AIEvent = {
  provider: string;
  model: string;
  kind: string;
  ms: number;
  error?: string;
} & TokenUsage;

/** Best-effort usage logging for the §74 cost dashboard. Never throws. */
export function recordAIEvent(e: AIEvent): void {
  getDb()
    .then((db) =>
      db.insert(aiEvaluationEvents).values({
        provider: e.provider,
        model: e.model,
        kind: e.kind,
        inputTokens: e.inputTokens,
        outputTokens: e.outputTokens,
        ms: e.ms,
        error: e.error,
      }),
    )
    .catch((err) => console.warn('[ai] usage event write failed:', err));
}

export async function timed<T>(e: Omit<AIEvent, 'ms'>, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  try {
    const out = await fn();
    recordAIEvent({ ...e, ms: Date.now() - start });
    return out;
  } catch (err) {
    recordAIEvent({ ...e, ms: Date.now() - start, error: String(err) });
    throw err;
  }
}
