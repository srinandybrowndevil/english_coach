import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { MistakeService } from '@/server/services/mistake';
import { ReviewQueue } from './ReviewQueue';

export const metadata = { title: 'Mistake review' };

export default async function MistakeReviewPage() {
  const session = await requireSession();
  const due = await new MistakeService(await getDb()).due(session.userId, 10);
  const patterns = due.map((p) => ({
    id: p.id, label: p.label ?? p.errorSignature, signature: p.errorSignature,
    status: p.status, occurrenceCount: p.occurrenceCount,
    originalExample: p.originalExample, correctedExample: p.correctedExample,
  }));
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Review due</h1>
      {patterns.length ? (
        <ReviewQueue patterns={patterns} />
      ) : (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-muted">
          Nothing due for review. New mistakes join the queue as you practise —{' '}
          <Link className="underline" href="/tutor">talk to the tutor</Link>.
        </p>
      )}
    </div>
  );
}
