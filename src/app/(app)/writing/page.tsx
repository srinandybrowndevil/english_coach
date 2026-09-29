import { requireSession } from '@/lib/auth/session';
import { WRITING_MODES } from '@/content/writing-templates';
import { WritingClient } from './WritingClient';

export const metadata = { title: 'Writing' };

export default async function WritingPage() {
  await requireSession();
  return <WritingClient modes={WRITING_MODES} />;
}
