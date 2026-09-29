import { requireSession } from '@/lib/auth/session';
import { ThinkLabClient } from './ThinkLabClient';

export const metadata = { title: 'Think-in-English Lab' };

const DRILLS = [
  { slug: 'describe-surroundings', label: 'Describe your surroundings', hint: 'Look around and describe what you see for 30 seconds.' },
  { slug: 'explain-what-doing', label: 'Explain what you are doing', hint: 'Narrate your current task as if teaching a shadow.' },
  { slug: 'internal-monologue', label: 'Internal monologue', hint: 'Speak your thoughts aloud for 60 seconds.' },
  { slug: 'rapid-naming', label: 'Rapid naming (30 s)', hint: 'Name as many items in the shown category as you can in 30 s.', category: true },
  { slug: 'storytelling-beats', label: 'Story from 3 beats', hint: 'Tell a story that includes these three elements.' },
];

export default async function ThinkEnglishPage() {
  await requireSession();
  return <ThinkLabClient drills={DRILLS} />;
}
