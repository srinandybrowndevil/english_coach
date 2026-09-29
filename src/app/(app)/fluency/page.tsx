import { requireSession } from '@/lib/auth/session';
import { FluencyClient } from './FluencyClient';

export default async function FluencyPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <h1 className="text-xl font-semibold">Fluency Gym</h1>
      <p className="mt-1 text-sm text-neutral-500">Short drills that build speed, smoothness and recovery.</p>
      <FluencyClient />
    </div>
  );
}
