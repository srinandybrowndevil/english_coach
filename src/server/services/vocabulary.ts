import { and, asc, eq, lte, or, isNull } from 'drizzle-orm';
import type { Db } from '@/lib/db/client';
import { learnerVocabulary, vocabularyItems } from '@/lib/db/schema';

const kebab = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export class VocabularyService {
  constructor(private db: Db) {}

  async addFromEvaluation(
    userId: string,
    items: { word: string; meaning: string; example: string }[],
  ): Promise<void> {
    for (const item of items.slice(0, 3)) {
      const slug = kebab(item.word);
      if (!slug) continue;
      const [row] = await this.db.insert(vocabularyItems).values({
        slug, word: item.word, meaning: item.meaning,
        exampleNatural: item.example, category: 'learned-in-context',
      }).onConflictDoUpdate({
        target: vocabularyItems.slug,
        set: { meaning: item.meaning, exampleNatural: item.example },
      }).returning();
      const itemId = row?.id ?? (await this.db.query.vocabularyItems.findFirst({
        where: eq(vocabularyItems.slug, slug),
      }))!.id;
      await this.db.insert(learnerVocabulary).values({
        learnerId: userId, vocabularyItemId: itemId,
        nextReviewAt: new Date(Date.now() + 10 * 60_000), // SRS index 0 = same session
      }).onConflictDoNothing();
    }
  }

  async due(userId: string, limit = 6) {
    return this.db
      .select({
        id: learnerVocabulary.id, word: vocabularyItems.word, meaning: vocabularyItems.meaning,
        nextReviewAt: learnerVocabulary.nextReviewAt, status: learnerVocabulary.status,
      })
      .from(learnerVocabulary)
      .innerJoin(vocabularyItems, eq(learnerVocabulary.vocabularyItemId, vocabularyItems.id))
      .where(and(
        eq(learnerVocabulary.learnerId, userId),
        or(isNull(learnerVocabulary.nextReviewAt), lte(learnerVocabulary.nextReviewAt, new Date())),
      ))
      .orderBy(asc(learnerVocabulary.nextReviewAt))
      .limit(limit);
  }
}
