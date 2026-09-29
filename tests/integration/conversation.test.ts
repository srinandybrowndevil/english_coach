// Env must exist before the env module is touched (getEnv parses once).
process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://'; // recordAIEvent's getDb() gets its own throwaway instance

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { and, eq } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import { aiEvaluationEvents, mistakeOccurrences, mistakePatterns, sessionTurns, users } from '@/lib/db/schema';
import { SessionService } from '@/server/services/session';
import { TutorService } from '@/server/services/tutor';
import { EvaluationService } from '@/server/services/evaluation';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}

const TEXT = "Yesterday I didn't went to office and discuss about the project";

describe('tutor conversation → mistake memory', () => {
  it('records canonical signatures, dedupes on recurrence, evaluates a turn, summarises', async () => {
    const db = await testDb();
    // route service-internal usage logging (getDb()) at this same in-memory DB
    (globalThis as unknown as { __db?: unknown }).__db = db;
    const [user] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    const sessions = new SessionService(db);
    const s = await sessions.start(user!.id, { type: 'tutor_text', tutorMode: 'friendly_coach', correctionMode: 'balanced' });

    const out = await new TutorService(db).respond(s.id, TEXT);
    expect(out.tutorTurn.reply.length).toBeGreaterThan(0);
    expect(out.tutorTurn.corrections.length).toBeGreaterThan(0);

    const patterns = await db.select().from(mistakePatterns).where(eq(mistakePatterns.learnerId, user!.id));
    const sigs = patterns.map((p) => p.errorSignature);
    expect(sigs).toContain('grammar:did-plus-past-form');
    expect(sigs).toContain('grammar:discuss-about');

    const occ = await db.select().from(mistakeOccurrences);
    expect(occ.length).toBeGreaterThanOrEqual(2);

    const turns = await db.select().from(sessionTurns).where(eq(sessionTurns.sessionId, s.id));
    expect(turns.some((t) => t.role === 'tutor')).toBe(true);

    const events = await db.select().from(aiEvaluationEvents);
    expect(events.some((e) => e.promptVersionId)).toBe(true);

    // second identical turn → same rows, occurrenceCount 2
    await new TutorService(db).respond(s.id, TEXT);
    const p2 = await db.select().from(mistakePatterns).where(
      and(eq(mistakePatterns.learnerId, user!.id), eq(mistakePatterns.errorSignature, 'grammar:did-plus-past-form')),
    );
    expect(p2).toHaveLength(1);
    expect(p2[0]!.occurrenceCount).toBe(2);
    expect(p2[0]!.status).toBe('recurring');

    // evaluate the learner turn (mock speech-evaluation)
    const learnerTurn = turns.find((t) => t.role === 'learner')!;
    const ev = await new EvaluationService(db).evaluateTurn(learnerTurn.id, { taskPrompt: 'small talk', register: 'neutral' });
    expect(ev.scores.fluency.components).toBeTruthy();
    const metricRows = await db.select().from(schema.speechMetrics).where(eq(schema.speechMetrics.turnId, learnerTurn.id));
    expect(metricRows).toHaveLength(1);

    const summary = await sessions.end(s.id);
    expect(summary).toBeTruthy();
    expect(summary!.whatYouDid.length).toBeGreaterThan(0);
    const stored = await sessions.get(s.id);
    expect(stored!.overallSummary).toBeTruthy();
    expect(stored!.endedAt).toBeTruthy();
  });
});
