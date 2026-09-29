import { describe, expect, it } from 'vitest';
import {
  AssessmentItemGradeSchema, CefrDomainJudgementSchema, DebateEvaluationSchema,
  GrammarErrorSchema, JournalAnalysisSchema, NegotiationEvaluationSchema,
  PresentationEvaluationSchema, PronunciationNotesSchema, ReadingEvaluationSchema,
  SpeechEvaluationSchema, TutorTurnSchema, WritingEvaluationSchema,
} from '@/lib/evaluation/schemas';

const S = { score: 50, evidence: 'ev' };
const err = {
  quote: "didn't went", correction: "didn't go", category: 'grammar',
  subcategory: 'past tense', rule: 'did-plus-past-form', severity: 3,
  explanation: 'after did use base form', kind: 'error',
};

const valid: Record<string, unknown> = {
  speech: {
    correctedText: 'a', naturalText: 'a', professionalText: null,
    grammarErrors: [err], naturalnessNotes: [], vocabularyOpportunities: [],
    registerNotes: [], sentenceCount: 4, completedSentenceCount: 3, subordinateClauseCount: 1,
    vocabularyRatings: { appropriateness: S, precision: S, register: S, collocation: S },
    primaryFocus: 'past tense', followUpExercise: { type: 'drill', prompt: 'p' },
    bestSentence: 's', upgradedExpression: null, newVocabulary: [],
  },
  writing: {
    issues: [{ quote: 'q', fix: 'f', explanation: 'e', dimension: 'clarity' }],
    correctedVersion: 'c', naturalVersion: 'n', advancedVersion: 'a',
    dimensions: {
      grammar: S, clarity: S, coherence: S, structure: S, vocabulary: S,
      naturalness: S, register: S, conciseness: S, mechanics: S,
    },
    grammarErrors: [err], rewriteInstruction: 'rewrite it',
  },
  negotiation: {
    language: { grammar: S, clarity: S, tone: S, vocabulary: S, fluency: S },
    negotiation: {
      questionQuality: S, valueFraming: S, objectionHandling: S,
      concessionDiscipline: S, boundaryClarity: S, alternativeGeneration: S, closing: S,
    },
    moments: [{ learnerSaid: 'x', whyItWorkedOrNot: 'y', betterResponse: 'b', alternativeResponse: 'a' }],
    retryChallenge: 'r', grammarErrors: [err],
  },
  presentation: {
    dimensions: {
      opening: S, structure: S, logicalFlow: S, transitions: S, clarity: S, language: S,
      pacing: S, pauses: S, emphasis: S, audienceFraming: S, conclusion: S,
    },
    grammarErrors: [], highlightMoment: null, weakestMoment: null, retryInstruction: 'r',
  },
  debate: {
    language: { grammar: S, clarity: S, tone: S, vocabulary: S, fluency: S },
    reasoning: {
      claim: S, evidence: S, reasoning: S, counterargument: S,
      rebuttal: S, clarification: S, concession: S, summary: S,
    },
    grammarErrors: [],
  },
  pronunciation: { notes: ['watch th'], targetWords: ['think'] },
  journal: {
    grammarErrors: [err], vocabularyNotes: [], expressionNotes: [], naturalnessNotes: [],
    recurringPatterns: ['past tense'], newWordsWorthLearning: [{ word: 'w', meaning: 'm' }],
  },
  reading: {
    comprehensionScore: S,
    answers: [{ item: 'q1', correct: true, note: 'n' }],
    vocabularyHighlights: [], summaryFeedback: 'ok',
  },
  tutorTurn: {
    reply: 'hi', corrections: [err], followUpQuestion: null, difficultyAdjustment: 0,
    memoryCandidates: [{ kind: 'learner', content: 'c' }], tamilNote: null,
  },
  grade: { score: 80, correct: true, feedback: 'f', evidence: 'e' },
  cefrJudgement: { domain: 'speaking', score: 65, evidence: 'e' },
};

const SCHEMAS: Record<string, { schema: { parse: (x: unknown) => unknown }; key: string }> = {
  GrammarError: { schema: GrammarErrorSchema, key: 'err' },
  Speech: { schema: SpeechEvaluationSchema, key: 'speech' },
  Writing: { schema: WritingEvaluationSchema, key: 'writing' },
  Negotiation: { schema: NegotiationEvaluationSchema, key: 'negotiation' },
  Presentation: { schema: PresentationEvaluationSchema, key: 'presentation' },
  Debate: { schema: DebateEvaluationSchema, key: 'debate' },
  Pronunciation: { schema: PronunciationNotesSchema, key: 'pronunciation' },
  Journal: { schema: JournalAnalysisSchema, key: 'journal' },
  Reading: { schema: ReadingEvaluationSchema, key: 'reading' },
  TutorTurn: { schema: TutorTurnSchema, key: 'tutorTurn' },
  AssessmentGrade: { schema: AssessmentItemGradeSchema, key: 'grade' },
  CefrJudgement: { schema: CefrDomainJudgementSchema, key: 'cefrJudgement' },
};

describe('evaluation schemas', () => {
  for (const [name, { schema, key }] of Object.entries(SCHEMAS)) {
    const sample = key === 'err' ? err : valid[key];
    it(`${name} accepts a valid fixture`, () => {
      expect(() => schema.parse(sample)).not.toThrow();
    });
    it(`${name} rejects a broken fixture`, () => {
      expect(() => schema.parse({})).toThrow();
    });
  }

  it('severity 4 is rejected on GrammarError', () => {
    expect(() => GrammarErrorSchema.parse({ ...err, severity: 4 })).toThrow();
  });
  it('missing required key is rejected', () => {
    const rest = { ...(valid['tutorTurn'] as Record<string, unknown>) };
    delete rest['reply'];
    expect(() => TutorTurnSchema.parse(rest)).toThrow();
  });
});
