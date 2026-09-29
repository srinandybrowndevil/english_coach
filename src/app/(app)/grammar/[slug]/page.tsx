import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { contentItems } from '@/lib/db/schema';
import type { LessonSeed } from '@/content/grammar-lessons';
import { LessonClient } from './LessonClient';

export const metadata = { title: 'Grammar lesson' };

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireSession();
  const { slug } = await params;
  const item = await (await getDb()).query.contentItems.findFirst({
    where: eq(contentItems.slug, slug),
  });
  if (!item) notFound();
  return <LessonClient slug={slug} lesson={item.payload as unknown as LessonSeed} />;
}
