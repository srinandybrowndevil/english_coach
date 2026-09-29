import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { readingAttempts } from '@/lib/db/schema';
import { READING_PASSAGES } from '@/content/reading';
import { nextReadingLevel, type Level } from '@/lib/learning/reading-level';
import { ReadingClient } from './ReadingClient';

export const metadata = { title: 'Reading' };

export default async function ReadingPage() {
  const session = await requireSession();
  const db = await getDb();
  const last = await db.query.readingAttempts.findMany({
    where: eq(readingAttempts.learnerId, session.userId),
    orderBy: desc(readingAttempts.createdAt), limit: 3,
  });
  const last3 = last.map((a) => (a.score as { total?: number } | null)?.total ?? 0);
  const level: Level = nextReadingLevel('B1', last3);
  const pool = READING_PASSAGES.filter((p) => p.level === level);
  const list = pool.length ? pool : READING_PASSAGES;
  return <ReadingClient passages={list} level={level} />;
}
