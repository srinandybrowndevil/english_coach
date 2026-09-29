import { requireSession } from '@/lib/auth/session';
import { SpeakClient } from './SpeakClient';

export default async function SpeakPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <h1 className="text-xl font-semibold">Speak</h1>
      <p className="mt-1 text-sm text-neutral-500">Timed speaking drills. Answer aloud, then analyse your English.</p>
      <SpeakClient />
    </div>
  );
}
