import { requireSession } from '@/lib/auth/session';
import { SIMULATOR_SCENARIOS } from '@/content/scenarios';
import { ScenarioStarter } from '@/components/roleplay/ScenarioStarter';

export const metadata = { title: 'Real-Life Simulator' };

export default async function SimulatorPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold">Real-life simulator</h1>
      <ScenarioStarter
        scenarios={SIMULATOR_SCENARIOS.map((s) => ({
          slug: s.slug, title: s.title, description: `${s.setting} · difficulty ${s.difficulty}/5`,
          aiRole: s.aiRole, learnerRole: s.learnerRole, register: 'neutral / polite',
        }))}
      />
    </div>
  );
}
