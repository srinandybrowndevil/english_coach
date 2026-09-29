import { clamp, linearScale, r1, result, type Confidence, type ScoreComponent, type ScoreResult } from './util';
import type { SpeechMetrics } from './speech-metrics';

// spec §50 weighted model: continuity .20, pause efficiency .20, idea completion
// .15, filler control .15, speaking rate .10, response latency .10, repair .10.
export function computeFluencyScore(
  m: SpeechMetrics,
  extra: { sentenceCount: number; completedSentenceCount: number; successfulRepairs?: number },
): ScoreResult {
  const minutes = m.durationSec / 60;
  const components: Record<string, ScoreComponent> = {};

  const longPerMin = minutes > 0 ? m.longPauseCount / minutes : m.longPauseCount * 60;
  components['continuity'] = {
    score: clamp(linearScale(longPerMin, [0, 100], [6, 0])),
    weight: 0.2,
    evidence: `${m.longPauseCount} long pauses in ${Math.round(m.durationSec)}s (${r1(longPerMin)}/min)`,
  };

  const pauseRatio = m.durationSec > 0 ? m.totalPauseSec / m.durationSec : 0;
  components['pauseEfficiency'] = {
    score: clamp(linearScale(pauseRatio, [0.15, 100], [0.5, 0])),
    weight: 0.2,
    evidence: `pause ratio ${(pauseRatio * 100).toFixed(1)}% of speaking time`,
  };

  let ideaScore: number;
  if (extra.sentenceCount === 0) ideaScore = m.wordCount < 5 ? 100 : 0;
  else ideaScore = (extra.completedSentenceCount / extra.sentenceCount) * 100;
  components['ideaCompletion'] = {
    score: clamp(ideaScore),
    weight: 0.15,
    evidence: `${extra.completedSentenceCount}/${extra.sentenceCount} sentences completed`,
  };

  const fillersPer100 = m.wordCount > 0 ? (m.fillerCount / m.wordCount) * 100 : 0;
  components['fillerControl'] = {
    score: clamp(linearScale(fillersPer100, [2, 100], [12, 0])),
    weight: 0.15,
    evidence: `${m.fillerCount} fillers in ${m.wordCount} words (${r1(fillersPer100)}/100w)`,
  };

  const wpm = m.wordsPerMinute;
  components['speakingRate'] = {
    score: wpm < 120 ? clamp(linearScale(wpm, [60, 0], [120, 100])) : clamp(linearScale(wpm, [170, 100], [230, 0])),
    weight: 0.1,
    evidence: `${Math.round(wpm)} words/minute (target 120–170)`,
  };

  if (m.responseLatencySec !== undefined) {
    components['responseLatency'] = {
      score: clamp(linearScale(m.responseLatencySec, [1, 100], [6, 0])),
      weight: 0.1,
      evidence: `${r1(m.responseLatencySec)}s to start responding`,
    };
  }

  if (m.selfCorrectionCount === 0) {
    components['repair'] = { score: 80, weight: 0.1, evidence: 'no repairs observed' };
  } else {
    const ok = extra.successfulRepairs ?? 0;
    components['repair'] = {
      score: clamp((ok / m.selfCorrectionCount) * 100),
      weight: 0.1,
      evidence: `${ok}/${m.selfCorrectionCount} repair attempts succeeded`,
    };
  }

  const confidence: Confidence = m.durationSec < 20 ? 'low' : m.durationSec < 60 ? 'medium' : 'high';
  return result(components, confidence);
}

