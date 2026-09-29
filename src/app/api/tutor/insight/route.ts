import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { MistakeService } from '@/server/services/mistake';
import { VocabularyService } from '@/server/services/vocabulary';

// Powers the "Tutor Insight" panel — shows exactly what gets injected into the prompt.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const db = await getDb();
  const [mistakes, vocab] = await Promise.all([
    new MistakeService(db).due(session.userId, 8),
    new VocabularyService(db).due(session.userId, 6),
  ]);
  return NextResponse.json({
    recurringMistakes: mistakes.map((m) => ({
      signature: m.errorSignature, example: m.originalExample,
      correction: m.correctedExample, occurrences: m.occurrenceCount, status: m.status,
    })),
    vocabularyDue: vocab,
  });
}
