import { requireSession } from '@/lib/auth/session';
import { NEGOTIATION_PERSONAS, NEGOTIATION_SITUATIONS, NEGOTIATION_DIFFICULTIES } from '@/content/scenarios';
import { ScenarioStarter } from '@/components/roleplay/ScenarioStarter';

export const metadata = { title: 'Negotiation' };

export default async function NegotiationPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h1 className="text-2xl font-semibold">Negotiation simulator</h1>
      <p className="text-sm text-fg-muted">
        Pick a situation, a counterpart persona, and a difficulty. Language and negotiation are scored separately.
      </p>
      <ScenarioStarter
        scenarios={NEGOTIATION_SITUATIONS.map((s) => ({
          slug: s.slug, title: s.title, description: s.setup,
          personas: NEGOTIATION_PERSONAS.map((p) => ({ slug: p.slug, name: p.name })),
          difficulties: NEGOTIATION_DIFFICULTIES.map((d) => d.level),
          aiRole: 'Buyer / counterpart', learnerRole: 'You (negotiating)',
        }))}
      />
    </div>
  );
}
