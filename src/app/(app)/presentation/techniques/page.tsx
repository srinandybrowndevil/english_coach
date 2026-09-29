import { requireSession } from '@/lib/auth/session';
import { PUBLIC_SPEAKING } from '@/content/public-speaking';
import { TechniquesClient } from './TechniquesClient';

export const metadata = { title: 'Public speaking techniques' };

export default async function TechniquesPage() {
  await requireSession();
  return <TechniquesClient techniques={PUBLIC_SPEAKING} />;
}
