import { requireSession } from '@/lib/auth/session';
import { AssessmentRunner } from './AssessmentRunner';

export const metadata = { title: 'Assessment' };

export default async function AssessmentPage({
  params, searchParams,
}: { params: Promise<{ kind: string }>; searchParams: Promise<{ id?: string }> }) {
  await requireSession();
  const { kind } = await params;
  const { id } = await searchParams;
  return <AssessmentRunner kind={kind === 'monthly' ? 'monthly' : 'initial'} assessmentId={id ?? null} />;
}
