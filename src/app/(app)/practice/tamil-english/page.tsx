import { desc, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { cefrEstimates } from '@/lib/db/schema';
import { TAMIL_ITEMS } from '@/content/tamil-english';
import { TamilLabClient } from './TamilLabClient';

export const metadata = { title: 'Tamil → English Lab' };

export default async function TamilLabPage() {
  const session = await requireSession();
  const db = await getDb();
  const latest = await db.query.cefrEstimates.findFirst({
    where: eq(cefrEstimates.learnerId, session.userId),
    orderBy: desc(cefrEstimates.createdAt),
  });
  // §32 reliance reduction — recommend Think-in-English once grammar ≥65
  const grammar = ((latest?.breakdown as { grammar?: { score?: number } } | null)?.grammar?.score ?? 0);
  const suggestThink = grammar >= 65;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Tamil → English Lab</h1>
      {suggestThink && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          Your grammar score is strong — move to the <a className="underline" href="/practice/think-english">Think-in-English Lab</a> instead.
        </p>
      )}
      <TamilLabClient items={TAMIL_ITEMS} />
    </div>
  );
}
