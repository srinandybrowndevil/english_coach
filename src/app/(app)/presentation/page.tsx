import { requireSession } from '@/lib/auth/session';
import { PRESENTATION_TOPICS } from '@/content/presentation-topics';
import { PresentationClient } from './PresentationClient';

export const metadata = { title: 'Presentation' };

export default async function PresentationPage() {
  await requireSession();
  const modes = [...new Set(PRESENTATION_TOPICS.map((t) => t.mode))];
  return <PresentationClient topics={PRESENTATION_TOPICS} modes={modes} />;
}
