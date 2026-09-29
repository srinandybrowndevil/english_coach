import { requireSession } from '@/lib/auth/session';
import { JournalClient } from './JournalClient';

export const metadata = { title: 'New journal entry' };

const PROMPTS = [
  'What went well today, and why?',
  'Describe a conversation that stuck with you.',
  'Something that surprised you this week.',
  'What are you avoiding right now, honestly?',
  'A small win you haven\'t told anyone about.',
];

export default async function NewJournalPage() {
  await requireSession();
  return <JournalClient prompts={PROMPTS} />;
}
