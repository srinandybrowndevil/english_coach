// Re-exports of client-safe evaluation types (server code stays in src/server).
import type { SpeechEvaluation as SE, TutorTurn as TT, SessionSummary as SS } from '@/lib/evaluation/schemas';
export type SpeechEvaluation = SE;
export type TutorTurn = TT;
export type SessionSummary = SS;
export type { SpeechMetrics, WordTiming } from '@/lib/scoring/speech-metrics';
