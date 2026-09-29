process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://';

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { and, eq } from 'drizzle-orm';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import { roleplaySessions, roleplayScenarios, users, mistakeOccurrences } from '@/lib/db/schema';
import { RoleplayService } from '@/server/services/roleplay';
import { WritingService } from '@/server/services/writing';
import { WRITING_MODES } from '@/content/writing-templates';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  (globalThis as unknown as { __db?: unknown }).__db = db;
  return db;
}

const makeUser = (db: Awaited<ReturnType<typeof testDb>>) =>
  db.insert(users).values({ email: 'learner@example.com' }).returning();

async function makeScenario(db: Awaited<ReturnType<typeof testDb>>, domain: string) {
  const [s] = await db.insert(roleplayScenarios).values({
    slug: `t-${domain}`, domain, title: `Test ${domain}`, description: 'test',
    persona: { aiRole: 'counterpart', learnerRole: 'you', objectives: ['obj1'] },
    config: domain === 'simulator' ? { hiddenScript: 'NEVER-LEAK', objectives: ['obj1'] } : { objectives: ['obj1'] },
    opener: 'Hello.',
  }).returning();
  return s!;
}

describe('roleplay engine (Phase 6)', () => {
  it('negotiation: start → 3 turns → end → separate language+negotiation scores, no total', async () => {
    const db = await testDb();
    const [u] = await makeUser(db);
    const s = await makeScenario(db, 'negotiation');
    const svc = new RoleplayService(db);
    const { rpSession } = await svc.start(u!.id, { scenarioSlug: s.slug });
    for (let i = 0; i < 3; i++) await svc.turn(u!.id, rpSession.id, `my turn ${i} hello there`);
    const got = await svc.get(u!.id, rpSession.id);
    // hidden goals absent pre-end
    expect(JSON.stringify(got?.scenario?.config)).not.toContain('hiddenScript');
    const { evaluation } = await svc.evaluate(u!.id, rpSession.id);
    const scores = (evaluation as { scores: { language: { total: number }; negotiation: { total: number } } }).scores;
    expect(scores.language.total).toBeGreaterThan(0);
    expect(scores.negotiation.total).toBeGreaterThan(0);
    expect((scores as unknown as Record<string, unknown>).total).toBeUndefined();
  });

  it('simulator: hiddenScript stripped from GET before end', async () => {
    const db = await testDb();
    const [u] = await makeUser(db);
    const s = await makeScenario(db, 'simulator');
    const svc = new RoleplayService(db);
    const { rpSession } = await svc.start(u!.id, { scenarioSlug: s.slug });
    const got = await svc.get(u!.id, rpSession.id);
    expect((got!.scenario!.config as Record<string, unknown>).hiddenScript).toBeUndefined();
  });

  it('debate: separate language and reasoning in evaluation', async () => {
    const db = await testDb();
    const [u] = await makeUser(db);
    const s = await makeScenario(db, 'debate');
    const svc = new RoleplayService(db);
    const { rpSession } = await svc.start(u!.id, { scenarioSlug: s.slug });
    await svc.turn(u!.id, rpSession.id, 'I claim X because Y');
    const { evaluation } = await svc.evaluate(u!.id, rpSession.id);
    const raw = (evaluation as { raw: { language: unknown; reasoning: unknown } }).raw;
    expect(raw.language).toBeDefined();
    expect(raw.reasoning).toBeDefined();
  });
});

describe('writing (§25)', () => {
  it('submit → rewrite stores v2 with delta', async () => {
    const db = await testDb();
    const [u] = await makeUser(db);
    const svc = new WritingService(db);
    const mode = WRITING_MODES[0]!;
    const r1 = await svc.evaluate(u!.id, mode, 'I didn\'t went today.');
    const r2 = await svc.evaluate(u!.id, mode, 'I did not go today.', r1.submission!.id);
    expect(r2.submission!.rewriteText).toBe('I did not go today.');
    expect((r2.submission!.scores as { delta: number | null }).delta).not.toBeNull();
  });
});

describe('journal (§36)', () => {
  it('analyse records patterns with context journal', async () => {
    const db = await testDb();
    const [u] = await makeUser(db);
    const [e] = await db.insert(schema.journalEntries).values({
      learnerId: u!.id, content: 'I didn\'t went there.',
    }).returning();
    const { JournalService } = await import('@/server/services/journal');
    await new JournalService(db).analyse(u!.id, e!.id);
    const occ = await db.select().from(mistakeOccurrences).where(and(
      eq(mistakeOccurrences.context, 'journal'),
    ));
    expect(occ.length).toBeGreaterThan(0);
  });
});
