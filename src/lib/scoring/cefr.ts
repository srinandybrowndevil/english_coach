import { type Confidence } from './util';

export type Cefr = 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
const ORDER: Cefr[] = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const CRITICAL = ['speaking', 'grammar', 'listening', 'writing'] as const;
const DOMAINS = ['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary'] as const;
type Domain = (typeof DOMAINS)[number];

export type DomainEvidence = { score: number; evidenceCount: number };

export type CefrEstimate = {
  level: Cefr | null;
  confidence: Confidence;
  breakdown: Partial<Record<Domain, { level: Cefr; score: number; evidenceCount: number }>>;
  gate?: string;
  evidence: string[];
};

function scoreToLevel(score: number): Cefr {
  if (score < 20) return 'a1';
  if (score < 35) return 'a2';
  if (score < 50) return 'b1';
  if (score < 65) return 'b2';
  if (score < 80) return 'c1';
  return 'c2';
}

// spec §57 — median of domain levels; a weak critical domain gates the overall.
export function estimateCefr(domains: Partial<Record<Domain, DomainEvidence>>): CefrEstimate {
  const breakdown: CefrEstimate['breakdown'] = {};
  const levels: number[] = [];
  const evidence: string[] = [];
  let totalEvidence = 0;

  for (const d of DOMAINS) {
    const e = domains[d];
    if (!e) continue;
    const lvl = scoreToLevel(e.score);
    breakdown[d] = { level: lvl, score: e.score, evidenceCount: e.evidenceCount };
    levels.push(ORDER.indexOf(lvl));
    totalEvidence += e.evidenceCount;
    evidence.push(`${d}: ${lvl.toUpperCase()} (score ${e.score}, ${e.evidenceCount} evidence items)`);
  }

  if (levels.length === 0) {
    return { level: null, confidence: 'low', breakdown, evidence };
  }

  levels.sort((a, b) => a - b);
  const mid = levels.length % 2 ? levels[(levels.length - 1) / 2]! : levels[levels.length / 2]!; // upper median
  let overall = mid;
  let gate: string | undefined;

  // Gate: overall cannot exceed lowest evidenced critical-domain level + 1 step.
  let lowestCritical = Infinity;
  let lowestCriticalDomain: Domain | null = null;
  for (const d of CRITICAL) {
    const b = breakdown[d];
    if (b && ORDER.indexOf(b.level) < lowestCritical) {
      lowestCritical = ORDER.indexOf(b.level);
      lowestCriticalDomain = d;
    }
  }
  if (lowestCriticalDomain && overall > lowestCritical + 1) {
    overall = lowestCritical + 1;
    gate = `Capped at ${ORDER[overall]!.toUpperCase()}: ${lowestCriticalDomain} is at ${ORDER[lowestCritical]!.toUpperCase()}`;
    evidence.push(gate);
  }

  const missingCritical = CRITICAL.some((d) => !breakdown[d]);
  const confidence: Confidence =
    missingCritical || totalEvidence < 6 ? 'low' : totalEvidence < 20 ? 'medium' : 'high';

  return { level: ORDER[overall]!, confidence, breakdown, ...(gate ? { gate } : {}), evidence };
}
