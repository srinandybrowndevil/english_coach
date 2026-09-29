import { requireSession } from '@/lib/auth/session';
import { DEBATE_TOPICS } from '@/content/debate-topics';
import { DebateClient } from './DebateClient';

export const metadata = { title: 'Debate' };

const MODES = ['Friendly', 'Academic', 'Fast', 'Aggressive-but-professional', 'Cross-examination'];

export default async function DebatePage() {
  await requireSession();
  return <DebateClient topics={DEBATE_TOPICS} modes={MODES} />;
}
