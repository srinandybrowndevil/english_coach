import Link from 'next/link';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { contentItems, learnerSkillStates, mistakePatterns } from '@/lib/db/schema';
import { ruleIdsForLesson } from '@/content/lesson-rules';

export const metadata = { title: 'Grammar' };

type LessonPayload = { skillSlug: string; topic: string };

export default async function GrammarPage() {
  const session = await requireSession();
  const db = await getDb();

  const [lessons, states, defs, patterns, plan] = await Promise.all([
    db.query.contentItems.findMany({ where: eq(contentItems.contentKind, 'grammar_lesson'), orderBy: asc(contentItems.slug) }),
    db.query.learnerSkillStates.findMany({ where: eq(learnerSkillStates.learnerId, session.userId) }),
    db.query.skillDefinitions.findMany(),
    db.query.mistakePatterns.findMany({
      where: and(eq(mistakePatterns.learnerId, session.userId), inArray(mistakePatterns.status, ['recurring', 'relapsed'])),
    }),
    db.query.curriculumPlans.findFirst({ orderBy: (t, { desc }) => desc(t.generatedAt) }),
  ]);
  const defBySlug = new Map(defs.map((d) => [d.slug, d]));
  const stateBySkill = new Map(states.map((s) => [s.skillId, s]));
  const top8 = new Set(((plan?.plan as { orderedSkillSlugs?: string[] } | null)?.orderedSkillSlugs ?? []).slice(0, 8));
  const activeRules = new Map(patterns.map((p) => [p.errorSignature.split(':').pop()!, p]));

  const items = lessons.map((l) => {
    const payload = l.payload as LessonPayload;
    const def = defBySlug.get(payload.skillSlug);
    const st = def ? stateBySkill.get(def.id) : undefined;
    const matchedRules = ruleIdsForLesson(l.slug).filter((r) => activeRules.has(r));
    return {
      slug: l.slug, title: l.title, domain: def?.domain ?? 'grammar',
      status: st?.status ?? 'unseen',
      recommended: top8.has(payload.skillSlug) || matchedRules.length > 0,
      reason: matchedRules.length
        ? `You have ${matchedRules.map((r) => activeRules.get(r)!.occurrenceCount).reduce((a, b) => a + b, 0)} recent ${matchedRules.map((r) => activeRules.get(r)!.label ?? r).join(', ')} error(s)`
        : top8.has(payload.skillSlug) ? 'Top priority in your curriculum' : null,
    };
  }).sort((a, b) => Number(b.recommended) - Number(a.recommended));

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Grammar curriculum</h1>
      <ul className="space-y-2">
        {items.map((l) => (
          <li key={l.slug}>
            <Link href={`/grammar/${l.slug}`}
              className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-surface">
              <div>
                <div className="text-sm font-medium">{l.title}</div>
                {l.reason && <div className="text-xs text-amber-700">{l.reason}</div>}
              </div>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-fg-muted">{l.status}</span>
            </Link>
          </li>
        ))}
        {!items.length && <li className="text-sm text-fg-muted">Run <code>pnpm db:seed</code> to load lessons.</li>}
      </ul>
    </div>
  );
}
