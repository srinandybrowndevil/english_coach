import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { VocabularyService } from '@/server/services/vocabulary';
import { VOCABULARY } from '@/content/vocabulary';
import { IDIOMS } from '@/content/idioms';
import { PHRASAL_VERBS } from '@/content/phrasal-verbs';
import { COLLOCATIONS } from '@/content/collocations';
import { MODERN_ENGLISH } from '@/content/modern-english';
import { REGISTERS, REGISTER_TRANSFORMS } from '@/content/register';
import { RECOVERY } from '@/content/recovery';
import { PRECISION_MAP } from '@/content/precision';
import { eq } from 'drizzle-orm';
import { learnerVocabulary, vocabularyItems } from '@/lib/db/schema';
import { VocabBrowser } from './VocabBrowser';

export const metadata = { title: 'Vocabulary' };

export default async function VocabularyPage() {
  const session = await requireSession();
  const db = await getDb();
  const [mine, due] = await Promise.all([
    db.select({ lv: learnerVocabulary, w: vocabularyItems })
      .from(learnerVocabulary)
      .innerJoin(vocabularyItems, eq(learnerVocabulary.vocabularyItemId, vocabularyItems.id))
      .where(eq(learnerVocabulary.learnerId, session.userId)).limit(200),
    new VocabularyService(db).due(session.userId, 100),
  ]);
  return (
    <VocabBrowser
      myWords={mine.map((r) => ({ id: r.lv.id, status: r.lv.status, word: r.w.word, meaning: r.w.meaning }))}
      dueCount={due.length}
      vocabulary={VOCABULARY} idioms={IDIOMS} phrasalVerbs={PHRASAL_VERBS}
      collocations={COLLOCATIONS} modern={MODERN_ENGLISH}
      registers={REGISTERS} registerTransforms={REGISTER_TRANSFORMS}
      recovery={RECOVERY} precision={PRECISION_MAP}
    />
  );
}
