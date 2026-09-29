import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { ProgressService } from '@/server/services/progress';
import { ProgressClient } from './ProgressClient';

export const metadata = { title: 'Progress' };

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await requireSession();
  const range = ((await searchParams).range ?? '30d') as '7d' | '30d' | '90d' | '6m' | 'all';
  const data = await new ProgressService(await getDb()).timeseries(session.userId, range);
  return <ProgressClient data={data} range={range} />;
}
