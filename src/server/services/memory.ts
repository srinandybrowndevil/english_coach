import { createHash } from 'node:crypto';
import { and, desc, eq, inArray } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { tutorMemories } from '@/lib/db/schema';

export type MemoryKind = 'episodic' | 'learner' | 'curriculum';

// ponytail: keyword-overlap recall — embeddings (pgvector) deferred per docs/database.md.
export class MemoryService {
  constructor(private db: Db) {}

  async remember(userId: string, kind: MemoryKind, content: string): Promise<boolean> {
    const hash = createHash('sha256').update(`${userId}:${kind}:${content}`).digest('hex');
    // dedupe by hash stored inside the content jsonb
    const existing = await this.db.query.tutorMemories.findMany({
      where: and(eq(tutorMemories.learnerId, userId), eq(tutorMemories.kind, kind)),
      limit: 500,
    });
    if (existing.some((r) => (r.content as { hash?: string }).hash === hash)) return false;
    await this.db.insert(tutorMemories).values({
      learnerId: userId, kind, content: { hash, text: content },
    });
    return true;
  }

  async recall(userId: string, opts: { kinds?: MemoryKind[]; limit?: number; query?: string }) {
    const rows = await this.db.query.tutorMemories.findMany({
      where: and(
        eq(tutorMemories.learnerId, userId),
        opts.kinds?.length ? inArray(tutorMemories.kind, opts.kinds) : undefined,
      ),
      orderBy: desc(tutorMemories.createdAt),
      limit: 200,
    });
    const q = opts.query?.toLowerCase().split(/\W+/).filter((w) => w.length > 3) ?? [];
    const score = (text: string) =>
      q.length ? q.reduce((n, w) => n + (text.toLowerCase().includes(w) ? 1 : 0), 0) : 0;
    return rows
      .map((r) => ({ row: r, text: (r.content as { text: string }).text, k: score((r.content as { text: string }).text) }))
      .sort((a, b) => b.k - a.k || b.row.createdAt.getTime() - a.row.createdAt.getTime())
      .slice(0, opts.limit ?? 10)
      .map((r) => ({ id: r.row.id, kind: r.row.kind as MemoryKind, text: r.text, createdAt: r.row.createdAt }));
  }
}
