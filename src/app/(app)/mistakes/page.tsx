import Link from 'next/link';
import { requireSession } from '@/lib/auth/session';
import { getDb } from '@/lib/db/client';
import { MistakeService } from '@/server/services/mistake';

export const metadata = { title: 'Mistake Vault' };

const STATUSES = ['new', 'recurring', 'improving', 'monitoring', 'mastered', 'relapsed'];
const PILL: Record<string, string> = {
  new: 'bg-sky-100 text-sky-800', recurring: 'bg-amber-100 text-amber-800',
  improving: 'bg-emerald-100 text-emerald-800', monitoring: 'bg-indigo-100 text-indigo-800',
  mastered: 'bg-green-100 text-green-800', relapsed: 'bg-red-100 text-red-800',
};

export default async function MistakesPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; domain?: string }> }) {
  const session = await requireSession();
  const { status, domain } = await searchParams;
  const rows = await new MistakeService(await getDb()).list(session.userId, { status, limit: 100 });
  const filtered = domain ? rows.filter((r) => r.domain === domain) : rows;
  const domains = [...new Set(rows.map((r) => r.domain))];

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mistake Vault</h1>
        <Link href="/mistakes/review" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white">
          Review due →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link href="/mistakes" className={`rounded-full border px-3 py-1 ${!status ? 'border-accent' : 'border-border'}`}>all</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/mistakes?status=${s}${domain ? `&domain=${domain}` : ''}`}
            className={`rounded-full border px-3 py-1 ${status === s ? 'border-accent' : 'border-border'}`}>{s}</Link>
        ))}
        <span className="mx-1 text-fg-muted">|</span>
        {domains.map((d) => (
          <Link key={d} href={`/mistakes?domain=${d}${status ? `&status=${status}` : ''}`}
            className={`rounded-full border px-3 py-1 ${domain === d ? 'border-accent' : 'border-border'}`}>{d}</Link>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((p) => (
          <li key={p.id}>
            <Link href={`/mistakes/${p.id}`}
              className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-surface">
              <div>
                <div className="text-sm font-medium">{p.label ?? p.errorSignature}</div>
                <div className="text-xs text-fg-muted">
                  {p.domain} · {p.subcategory} · ×{p.occurrenceCount} · first {p.firstSeenAt.toISOString().slice(0, 10)}
                  {p.nextReviewAt && ` · review ${p.nextReviewAt.toISOString().slice(0, 10)}`}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${PILL[p.status] ?? ''}`}>{p.status}</span>
            </Link>
          </li>
        ))}
        {!filtered.length && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-muted">
            No patterns {status ? `with status "${status}"` : 'recorded yet'} — mistakes are captured automatically
            when you speak or write.
          </li>
        )}
      </ul>
    </div>
  );
}
