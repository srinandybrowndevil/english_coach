import { requireSession } from '@/lib/auth/session';
import { OnboardingClient } from './OnboardingClient';

export const metadata = { title: 'Welcome' };

export default async function OnboardingPage() {
  await requireSession();
  return <OnboardingClient />;
}
