// Word-level diff between a target and an STT transcript — case/punctuation-insensitive.
export type WordDiff = {
  matched: number; total: number;
  skipped: string[];   // target words not heard
  extra: string[];     // words the learner said that aren't in the target
  substituted: { expected: string; heard: string }[];
  accuracy: number;    // matched / total
};

const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');

export function wordDiff(target: string, heard: string): WordDiff {
  const t = target.split(/\s+/).map(norm).filter(Boolean);
  const h = heard.split(/\s+/).map(norm).filter(Boolean);
  // classic LCS alignment
  const dp: number[][] = Array.from({ length: t.length + 1 }, () => new Array(h.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = h.length - 1; j >= 0; j--)
      dp[i]![j] = t[i] === h[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);

  const skipped: string[] = [];
  const extra: string[] = [];
  const substituted: { expected: string; heard: string }[] = [];
  let matched = 0;
  let i = 0, j = 0;
  while (i < t.length && j < h.length) {
    if (t[i] === h[j]) { matched += 1; i += 1; j += 1; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      // target word skipped OR substituted — if the heard word is close by alignment, count as substitute
      if (j + 1 < h.length && dp[i + 1]![j + 1]! === dp[i + 1]![j]! && t[i + 1] === h[j + 1]) {
        substituted.push({ expected: t[i]!, heard: h[j]! }); i += 1; j += 1;
      } else { skipped.push(t[i]!); i += 1; }
    } else { extra.push(h[j]!); j += 1; }
  }
  skipped.push(...t.slice(i));
  extra.push(...h.slice(j));
  return { matched, total: t.length, skipped, extra, substituted, accuracy: t.length ? matched / t.length : 0 };
}
