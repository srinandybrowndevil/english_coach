import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { VocabularyService } from '@/server/services/vocabulary';
import { ReviewSession } from './ReviewSession';

export const metadata = { title: 'Vocabulary review' };

export default async function VocabReviewPage() {
  const session = await requireSession();
  const due = await new VocabularyService(await getDb()).due(session.userId, 25);
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <h1 className="text-2xl font-semibold">Review session</h1>
      {due.length ? (
        <ReviewSession cards={due.map((d) => ({ id: d.id, word: d.word, meaning: d.meaning, status: d.status }))} />
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-muted">
          Nothing due right now — your next reviews are scheduled automatically.
        </p>
      )}
    </div>
  );
}
