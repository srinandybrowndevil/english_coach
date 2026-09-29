import { requireSession } from '@/lib/auth/session';
import { LISTENING_SCRIPTS } from '@/content/listening-scripts';
import { LISTENING_MODES } from '@/content/listening-templates';
import { ListeningClient } from './ListeningClient';

export const metadata = { title: 'Listening' };

export default async function ListeningPage() {
  await requireSession();
  // modes map kept for descriptions; scripts carry the per-item accent/label
  void LISTENING_MODES;
  return <ListeningClient scripts={LISTENING_SCRIPTS} />;
}
