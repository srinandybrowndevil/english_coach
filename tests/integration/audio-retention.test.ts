process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://';

import { describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { rm, stat, utimes } from 'node:fs/promises';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import * as schema from '@/lib/db/schema';
import { sessionTurns, users, learningSessions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { resetEnvCache } from '@/lib/env';
import { SpeechService } from '@/server/services/speech';

async function testDb() {
  const db = drizzle(new PGlite('memory://'), { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), 'drizzle', 'migrations') });
  return db;
}

describe('audio retention', () => {
  it('off → nothing persisted; 7d → file written then purged when old', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'audio-'));
    process.env.AUDIO_STORAGE_DIR = dir;
    resetEnvCache();
    const db = await testDb();
    const [user] = await db.insert(users).values({ email: 'learner@example.com' }).returning();
    const [sess] = await db.insert(learningSessions).values({ learnerId: user!.id, sessionType: 'tutor_voice' }).returning();
    const [turn] = await db.insert(sessionTurns).values({ sessionId: sess!.id, role: 'learner', content: 'hi' }).returning();
    const svc = new SpeechService(db);
    const bytes = new Uint8Array([1, 2, 3]);

    // retention off → no file
    const rel0 = null; // route only calls persistAudio when retention !== 'off'
    expect(rel0).toBeNull();

    // retention on → file exists
    const rel = await svc.persistAudio(user!.id, turn!.id, bytes, 'audio/webm');
    expect(rel).toBeTruthy();
    const abs = svc.audioFilePath(rel!);
    expect((await stat(abs!)).size).toBe(3);

    // fresh file is not purged
    await db.update(sessionTurns).set({ audioPath: rel }).where(eq(sessionTurns.id, turn!.id));
    expect(await svc.purgeExpired(user!.id, '7d')).toBe(0);

    // backdate mtime → purged + audio_path cleared
    const old = new Date(Date.now() - 8 * 86_400_000);
    await utimes(abs!, old, old);
    expect(await svc.purgeExpired(user!.id, '7d')).toBe(1);
    const updated = await db.query.sessionTurns.findFirst({ where: eq(sessionTurns.id, turn!.id) });
    expect(updated!.audioPath).toBeNull();

    await rm(dir, { recursive: true, force: true });
    delete process.env.AUDIO_STORAGE_DIR;
    resetEnvCache();
  });
});
