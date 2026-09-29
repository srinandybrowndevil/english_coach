import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { isMockAI } from '@/lib/ai';
import { getDb } from '@/lib/db/client';
import { learnerProfiles } from '@/lib/db/schema';
import { OnboardingGate } from './OnboardingGate';
import { SwRegister } from './SwRegister';

// spec §7
const NAV = [
  ['Home', '/'], ['My Tutor', '/tutor'], ['Speak', '/speak'], ['Pronunciation', '/pronunciation'],
  ['Fluency', '/fluency'], ['Listening', '/listening'], ['Grammar', '/grammar'],
  ['Vocabulary', '/vocabulary'], ['Reading', '/reading'], ['Writing', '/writing'],
  ['Business English', '/business'], ['Negotiation', '/negotiation'], ['Presentation', '/presentation'],
  ['Debate', '/debate'], ['Real-Life Simulator', '/simulator'], ['Tongue Twisters', '/tongue-twisters'],
  ['Daily Training', '/daily'], ['Mistake Vault', '/mistakes'], ['Journal', '/journal'],
  ['Progress', '/progress'], ['Assessments', '/assessments'], ['Settings', '/settings'],
] as const;

const MOBILE_NAV = [
  ['Home', '/'], ['Tutor', '/tutor'], ['Speak', '/speak'], ['Practice', '/practice'], ['Progress', '/progress'],
] as const;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession(); // real DB validation — proxy only checks cookie shape
  const profile = await (await getDb()).query.learnerProfiles.findFirst({
    where: eq(learnerProfiles.learnerId, session.userId),
    columns: { onboardingCompletedAt: true },
  }).catch(() => null);
  const needsOnboarding = !profile?.onboardingCompletedAt;

  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-surface md:block">
        <div className="p-4 text-sm font-semibold">English Mastery OS</div>
        <nav aria-label="Main" className="flex flex-col px-2 pb-4">
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-1.5 text-sm text-fg-muted hover:bg-bg hover:text-fg"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <SwRegister />
        {isMockAI() && (
          <div role="status" className="border-b border-border bg-surface px-4 py-2 text-xs text-fg-muted">
            Mock AI provider active — set OPENAI_API_KEY to enable real providers.
          </div>
        )}
        <main className="flex-1 p-6 pb-20 md:pb-6">
          <OnboardingGate needs={needsOnboarding}>{children}</OnboardingGate>
        </main>

        <nav
          aria-label="Mobile"
          className="fixed inset-x-0 bottom-0 flex border-t border-border bg-surface md:hidden"
        >
          {MOBILE_NAV.map(([label, href]) => (
            <Link key={href} href={href} className="flex-1 py-3 text-center text-xs text-fg-muted">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
