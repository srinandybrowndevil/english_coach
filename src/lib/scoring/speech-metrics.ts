// spec §49 — observable speaking metrics, no DB, pure function.

export type WordTiming = { word: string; start: number; end: number };

export type SpeechMetrics = {
  durationSec: number;
  wordCount: number;
  wordsPerMinute: number;
  pauses: { start: number; end: number; dur: number }[];
  pauseCount: number;
  averagePauseSec: number;
  longPauseCount: number;
  totalPauseSec: number;
  fillers: Record<string, number>;
  fillerCount: number;
  repetitionCount: number;
  selfCorrectionCount: number;
  responseLatencySec?: number;
};

const PAUSE_GAP_SEC = 0.5;
const LONG_PAUSE_SEC = 1.5;

// §14 filler list — whole-token/bigram, case-insensitive
const FILLER_PHRASES = [
  'you know', 'i mean',
  'actually', 'basically', 'like', 'so', 'okay', 'right', 'hmm', 'uh', 'um',
];

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

export function deriveSpeechMetrics(
  words: WordTiming[],
  transcript: string,
  opts: { responseLatencySec?: number } = {},
): SpeechMetrics {
  const tokens = tokenize(transcript);
  const wordCount = tokens.length;

  const pauses: { start: number; end: number; dur: number }[] = [];
  for (let i = 1; i < words.length; i++) {
    const gap = words[i]!.start - words[i - 1]!.end;
    if (gap > PAUSE_GAP_SEC) pauses.push({ start: words[i - 1]!.end, end: words[i]!.start, dur: gap });
  }
  const totalPauseSec = pauses.reduce((s, p) => s + p.dur, 0);
  const longPauseCount = pauses.filter((p) => p.dur > LONG_PAUSE_SEC).length;

  const durationSec =
    words.length >= 2
      ? words[words.length - 1]!.end - words[0]!.start
      : wordCount / 2.5; // fallback: ~150wpm when no timings exist
  const wordsPerMinute = durationSec > 0 ? (wordCount / durationSec) * 60 : 0;

  const fillers: Record<string, number> = {};
  for (const phrase of FILLER_PHRASES) {
    const parts = phrase.split(' ');
    let n = 0;
    for (let i = 0; i + parts.length <= tokens.length; i++) {
      if (parts.every((p, j) => tokens[i + j] === p)) {
        n++;
        i += parts.length - 1;
      }
    }
    if (n) fillers[phrase] = n;
  }
  const fillerCount = Object.values(fillers).reduce((s, n) => s + n, 0);

  let repetitionCount = 0;
  for (let i = 1; i < tokens.length; i++) if (tokens[i] === tokens[i - 1]) repetitionCount++;

  // heuristic: 'i mean' / 'sorry' / 'no' immediately followed by a re-start of the
  // utterance counts as a self-repair attempt. Rough proxy only — refine with
  // real repair detection later.
  const selfCorrectionCount =
    (fillers['i mean'] ?? 0) +
    tokens.filter((t, i) => (t === 'sorry' || t === 'no') && i + 1 < tokens.length).length;

  return {
    durationSec,
    wordCount,
    wordsPerMinute,
    pauses,
    pauseCount: pauses.length,
    averagePauseSec: pauses.length ? totalPauseSec / pauses.length : 0,
    longPauseCount,
    totalPauseSec,
    fillers,
    fillerCount,
    repetitionCount,
    selfCorrectionCount,
    ...(opts.responseLatencySec !== undefined ? { responseLatencySec: opts.responseLatencySec } : {}),
  };
}
