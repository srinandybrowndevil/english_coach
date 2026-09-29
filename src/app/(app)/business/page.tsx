import { requireSession } from '@/lib/auth/session';
import { BUSINESS_SCENARIOS } from '@/content/scenarios';
import { ScenarioStarter } from '@/components/roleplay/ScenarioStarter';

export const metadata = { title: 'Business English' };

export default async function BusinessPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold">Business English</h1>
      <p className="text-sm text-fg-muted">22 scenario modules — pick one, choose a difficulty, and run the call.</p>
      <ScenarioStarter
        scenarios={BUSINESS_SCENARIOS.map((s) => ({
          slug: s.slug, title: s.title, description: `${s.setting} — you: ${s.learnerRole}; counterpart: ${s.aiRole}`,
          difficulties: s.difficultyVariants, aiRole: s.aiRole, learnerRole: s.learnerRole,
        }))}
      />
    </div>
  );
}
