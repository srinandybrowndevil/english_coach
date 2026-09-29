import { z } from 'zod';

// spec §66 — every evaluator output is validated before touching state.
// Shapes only; prompts are authored separately.

const Scored = z.object({ score: z.number().min(0).max(100), evidence: z.string() });

export const GrammarErrorSchema = z.object({
  quote: z.string(),
  correction: z.string(),
  category: z.string(),
  subcategory: z.string(),
  rule: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'rule must be kebab-case'),
  severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  explanation: z.string(),
  kind: z.enum(['error', 'unnatural', 'regional', 'register']),
});
export type GrammarError = z.infer<typeof GrammarErrorSchema>;

export const SpeechEvaluationSchema = z.object({
  correctedText: z.string(),
  naturalText: z.string(),
  professionalText: z.string().nullable(),
  grammarErrors: z.array(GrammarErrorSchema),
  naturalnessNotes: z.array(z.string()),
  vocabularyOpportunities: z.array(
    z.object({ original: z.string(), better: z.string(), why: z.string() }),
  ),
  registerNotes: z.array(z.string()),
  sentenceCount: z.number().int().nonnegative(),
  completedSentenceCount: z.number().int().nonnegative(),
  subordinateClauseCount: z.number().int().nonnegative(),
  vocabularyRatings: z.object({
    appropriateness: Scored, precision: Scored, register: Scored, collocation: Scored,
  }),
  primaryFocus: z.string(),
  followUpExercise: z.object({ type: z.string(), prompt: z.string() }),
  bestSentence: z.string().nullable(),
  upgradedExpression: z.object({ original: z.string(), upgraded: z.string() }).nullable(),
  newVocabulary: z.array(z.object({ word: z.string(), meaning: z.string(), example: z.string() })),
});
export type SpeechEvaluation = z.infer<typeof SpeechEvaluationSchema>;

const WRITING_DIMS = [
  'grammar', 'clarity', 'coherence', 'structure', 'vocabulary',
  'naturalness', 'register', 'conciseness', 'mechanics',
] as const;

export const WritingEvaluationSchema = z.object({
  issues: z.array(
    z.object({ quote: z.string(), fix: z.string(), explanation: z.string(), dimension: z.enum(WRITING_DIMS) }),
  ),
  correctedVersion: z.string(),
  naturalVersion: z.string(),
  advancedVersion: z.string(),
  dimensions: z.object(Object.fromEntries(WRITING_DIMS.map((d) => [d, Scored])) as Record<(typeof WRITING_DIMS)[number], typeof Scored>),
  grammarErrors: z.array(GrammarErrorSchema),
  rewriteInstruction: z.string(),
});
export type WritingEvaluation = z.infer<typeof WritingEvaluationSchema>;

const LANG_DIMS = ['grammar', 'clarity', 'tone', 'vocabulary', 'fluency'] as const;
const NEG_DIMS = [
  'questionQuality', 'valueFraming', 'objectionHandling', 'concessionDiscipline',
  'boundaryClarity', 'alternativeGeneration', 'closing',
] as const;

export const NegotiationEvaluationSchema = z.object({
  language: z.object(Object.fromEntries(LANG_DIMS.map((d) => [d, Scored])) as Record<(typeof LANG_DIMS)[number], typeof Scored>),
  negotiation: z.object(Object.fromEntries(NEG_DIMS.map((d) => [d, Scored])) as Record<(typeof NEG_DIMS)[number], typeof Scored>),
  moments: z.array(
    z.object({
      learnerSaid: z.string(),
      whyItWorkedOrNot: z.string(),
      betterResponse: z.string(),
      alternativeResponse: z.string(),
    }),
  ),
  retryChallenge: z.string(),
  grammarErrors: z.array(GrammarErrorSchema),
});
export type NegotiationEvaluation = z.infer<typeof NegotiationEvaluationSchema>;

const PRESENTATION_DIMS = [
  'opening', 'structure', 'logicalFlow', 'transitions', 'clarity', 'language',
  'pacing', 'pauses', 'emphasis', 'audienceFraming', 'conclusion',
] as const;

export const PresentationEvaluationSchema = z.object({
  dimensions: z.object(Object.fromEntries(PRESENTATION_DIMS.map((d) => [d, Scored])) as Record<(typeof PRESENTATION_DIMS)[number], typeof Scored>),
  grammarErrors: z.array(GrammarErrorSchema),
  highlightMoment: z.string().nullable(),
  weakestMoment: z.string().nullable(),
  retryInstruction: z.string(),
});
export type PresentationEvaluation = z.infer<typeof PresentationEvaluationSchema>;

const DEBATE_REASONING_DIMS = [
  'claim', 'evidence', 'reasoning', 'counterargument', 'rebuttal',
  'clarification', 'concession', 'summary',
] as const;

// spec §30 — language feedback and reasoning feedback stay separate.
export const DebateEvaluationSchema = z.object({
  language: z.object(Object.fromEntries(LANG_DIMS.map((d) => [d, Scored])) as Record<(typeof LANG_DIMS)[number], typeof Scored>),
  reasoning: z.object(Object.fromEntries(DEBATE_REASONING_DIMS.map((d) => [d, Scored])) as Record<(typeof DEBATE_REASONING_DIMS)[number], typeof Scored>),
  grammarErrors: z.array(GrammarErrorSchema),
});
export type DebateEvaluation = z.infer<typeof DebateEvaluationSchema>;

// §52 — notes only, never fabricated phoneme scores
export const PronunciationNotesSchema = z.object({
  notes: z.array(z.string()),
  targetWords: z.array(z.string()).optional(),
});
export type PronunciationNotes = z.infer<typeof PronunciationNotesSchema>;

export const JournalAnalysisSchema = z.object({
  grammarErrors: z.array(GrammarErrorSchema),
  vocabularyNotes: z.array(z.string()),
  expressionNotes: z.array(z.string()),
  naturalnessNotes: z.array(z.string()),
  recurringPatterns: z.array(z.string()),
  newWordsWorthLearning: z.array(z.object({ word: z.string(), meaning: z.string() })),
});
export type JournalAnalysis = z.infer<typeof JournalAnalysisSchema>;

export const ReadingEvaluationSchema = z.object({
  comprehensionScore: Scored,
  answers: z.array(z.object({ item: z.string(), correct: z.boolean(), note: z.string() })),
  vocabularyHighlights: z.array(z.object({ word: z.string(), meaning: z.string() })),
  summaryFeedback: z.string(),
});
export type ReadingEvaluation = z.infer<typeof ReadingEvaluationSchema>;

export const TutorTurnSchema = z.object({
  reply: z.string(),
  corrections: z.array(GrammarErrorSchema),
  followUpQuestion: z.string().nullable(),
  difficultyAdjustment: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  memoryCandidates: z.array(
    z.object({ kind: z.enum(['episodic', 'learner', 'curriculum']), content: z.string() }),
  ),
  tamilNote: z.string().nullable(),
});
export type TutorTurn = z.infer<typeof TutorTurnSchema>;

export const AssessmentItemGradeSchema = z.object({
  score: z.number().min(0).max(100),
  correct: z.boolean(),
  feedback: z.string(),
  evidence: z.string(),
});
export type AssessmentItemGrade = z.infer<typeof AssessmentItemGradeSchema>;

export const CefrDomainJudgementSchema = z.object({
  domain: z.enum(['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary']),
  score: z.number().min(0).max(100),
  band: z.enum(['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']),
  confidence: z.enum(['low', 'medium', 'high']),
  strengths: z.array(z.string()).max(3),
  weaknesses: z.array(z.string()).max(3),
  patternRuleIds: z.array(z.string()),
  evidence: z.string(),
});
export type CefrDomainJudgement = z.infer<typeof CefrDomainJudgementSchema>;

export const SessionSummarySchema = z.object({
  whatYouDid: z.string(),
  whatImproved: z.string(),
  topMistakes: z
    .array(z.object({ rule: z.string(), quote: z.string(), correction: z.string() }))
    .max(3),
  bestSentence: z.string().nullable(),
  upgradedExpression: z.object({ original: z.string(), upgraded: z.string() }).nullable(),
  vocabularyLearned: z.array(z.string()),
  practiceScheduled: z.array(z.string()),
  nextRecommendedActivity: z.string(),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;

export const RoleplayTurnSchema = z.object({
  reply: z.string(),
  ended: z.boolean(),
  internalNote: z.string(),
});
export type RoleplayTurn = z.infer<typeof RoleplayTurnSchema>;

export const RegisterEvaluationSchema = z.object({
  registerFit: Scored,
  detectedRegister: z.string(),
  meaningPreserved: z.object({ value: z.boolean(), reason: z.string() }),
  grammarErrors: z.array(GrammarErrorSchema),
  modelVersion: z.string(),
  oneAdjustment: z.string(),
});
export type RegisterEvaluation = z.infer<typeof RegisterEvaluationSchema>;

export const TamilToEnglishSchema = z.object({
  literalBasic: z.string(),
  natural: z.string(),
  professional: z.string(),
  formal: z.string().nullable(),
  grammarErrors: z.array(GrammarErrorSchema),
  notes: z.array(z.string()),
  keyDifference: z.string(),
});
export type TamilToEnglish = z.infer<typeof TamilToEnglishSchema>;
