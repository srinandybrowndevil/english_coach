import { requireSession } from '@/lib/auth/session';
import { TutorClient } from './TutorClient';

export default async function TutorPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <h1 className="text-xl font-semibold">My Tutor</h1>
      <p className="mt-1 text-sm text-neutral-500">Your private English professor. Voice or text, corrected your way.</p>
      <TutorClient />
    </div>
  );
}
