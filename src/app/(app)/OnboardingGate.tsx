'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ALLOWED = ['/onboarding', '/assessment', '/assessments', '/settings'];

export function OnboardingGate({ needs, children }: { needs: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const blocked = needs && !ALLOWED.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (blocked) router.replace('/onboarding');
  }, [blocked, router]);

  if (blocked) return null;
  return <>{children}</>;
}
