// Idempotent repair for Phase 5 signature canonicalisation (migration 0002).
// Rewrites `error_signature` to `${domain}:${rule}` and merges duplicate rows.
import { and, eq } from 'drizzle-orm';
import { getDb, type Db } from './client';
import {
  mistakeOccurrences, mistakePatterns, mistakeReviews,
} from './schema';
import { buildSignature } from '@/lib/memory/mistakes';
import { CANONICAL_RULES, normaliseRule } from '@/lib/memory/rules';

const STATUS_RANK = ['new', 'improving', 'monitoring', 'mastered', 'recurring', 'relapsed'];

export async function repairSignatures(dbParam?: Db) {
  const db = dbParam ?? await getDb();
  const rows = await db.query.mistakePatterns.findMany();
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const segs = r.errorSignature.split(':');
    const canon = normaliseRule(segs[0] ?? r.domain, segs[segs.length - 1]!);
    const sig = buildSignature({ domain: canon.domain, rule: canon.ruleId });
    const key = `${r.learnerId}|${sig}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  let merged = 0, rewritten = 0;
  for (const [key, members] of groups) {
    const sig = key.split('|')[1]!;
    const canon = normaliseRule(sig.split(':')[0]!, sig.split(':').pop()!);
    // repoint children onto the row that survives
    const keep = members.sort(
      (a, b) => a.firstSeenAt.getTime() - b.firstSeenAt.getTime(),
    )[0]!;
    const rest = members.slice(1);
    for (const dup of rest) {
      await db.update(mistakeOccurrences).set({ mistakePatternId: keep.id })
        .where(eq(mistakeOccurrences.mistakePatternId, dup.id));
      await db.update(mistakeReviews).set({ mistakePatternId: keep.id })
        .where(eq(mistakeReviews.mistakePatternId, dup.id));
      merged += 1;
    }
    const agg = members.reduce((acc, r) => ({
      occurrenceCount: acc.occurrenceCount + r.occurrenceCount,
      firstSeenAt: r.firstSeenAt < acc.firstSeenAt ? r.firstSeenAt : acc.firstSeenAt,
      lastSeenAt: r.lastSeenAt > acc.lastSeenAt ? r.lastSeenAt : acc.lastSeenAt,
      status: STATUS_RANK.indexOf(r.status) > STATUS_RANK.indexOf(acc.status) ? r.status : acc.status,
      contextsSeen: [...new Set([...acc.contextsSeen, ...r.contextsSeen])],
      severity: Math.max(acc.severity, r.severity),
    }), { occurrenceCount: 0, firstSeenAt: keep.firstSeenAt, lastSeenAt: keep.lastSeenAt,
          status: keep.status as string, contextsSeen: [] as string[], severity: keep.severity });

    if (keep.errorSignature !== sig || !keep.label) rewritten += 1;
    await db.update(mistakePatterns).set({
      errorSignature: sig,
      domain: canon.domain,
      label: keep.label ?? CANONICAL_RULES[sig.split(':').pop()!]?.label ?? null,
      occurrenceCount: agg.occurrenceCount,
      firstSeenAt: agg.firstSeenAt, lastSeenAt: agg.lastSeenAt,
      status: agg.status as typeof keep.status,
      contextsSeen: agg.contextsSeen, severity: agg.severity,
      updatedAt: new Date(),
    }).where(and(eq(mistakePatterns.id, keep.id)));

    for (const dup of rest) {
      await db.delete(mistakePatterns).where(eq(mistakePatterns.id, dup.id));
    }
  }
  return { patterns: rows.length, merged, rewritten };
}

// tsx runs scripts as CJS — import.meta.url is unreliable; match argv instead.
if (process.argv[1]?.endsWith('repair-signatures.ts')) {
  repairSignatures().then((r) => { console.log('repair-signatures:', r); process.exit(0); })
    .catch((e) => { console.error(e); process.exit(1); });
}
