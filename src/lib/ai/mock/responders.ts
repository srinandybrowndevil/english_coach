import type { ChatMessage } from '../types';

export class MockResponderMissing extends Error {
  constructor(name: string) {
    super(`No mock responder registered for structured output "${name}". Add one in src/lib/ai/mock/responders.ts.`);
    this.name = 'MockResponderMissing';
  }
}

export type MockResponder = (messages: ChatMessage[]) => unknown;

import { detectFossilised } from '@/lib/memory/fossilised';

// Deterministic, honest mock evaluator outputs — see §52/§75: never fabricate.
const findTranscript = (messages: ChatMessage[]): string => {
  const lastContent = messages[messages.length - 1]?.content ?? '';
  const last = typeof lastContent === 'string' ? lastContent : lastContent.filter((p) => p.type === 'text').map((p) => p.text).join('\n');
  const m = last.match(/Transcript:\s*([\s\S]*?)(?:\n\n|$)/);
  return (m?.[1] ?? last).trim();
};

const fossilisedToErrors = (text: string) =>
  detectFossilised(text).map((d) => ({
    quote: d.span, correction: d.internationalForm,
    category: d.category, subcategory: d.subcategory,
    rule: d.signature.split(':').pop() ?? d.signature,
    severity: 1 as const, explanation: d.explanation, kind: 'regional' as const,
  }));

const sentenceCount = (text: string) => Math.max(1, text.split(/[.!?]+/).filter((s) => s.trim()).length);

const responders: Record<string, MockResponder> = {
  default: () => ({ notes: ['mock note: nothing to check'] }),

  'tutor-turn': (messages) => {
    const text = findTranscript(messages);
    const corrections = fossilisedToErrors(text);
    return {
      reply: corrections.length
        ? `Good effort. One thing to fix: you said "${corrections[0]!.quote}" — the standard form is "${corrections[0]!.correction}". Can you say it once more?`
        : 'Good, keep going. Tell me more about that.',
      corrections,
      followUpQuestion: 'What happened next?',
      difficultyAdjustment: 0,
      memoryCandidates: [],
      tamilNote: null,
    };
  },

  'speech-evaluation': (messages) => {
    const text = findTranscript(messages);
    const errors = fossilisedToErrors(text);
    const rating = { score: 50, evidence: 'mock provider — no model judgement' };
    return {
      correctedText: errors.reduce((t, e) => t.replace(e.quote, e.correction), text),
      naturalText: errors.reduce((t, e) => t.replace(e.quote, e.correction), text),
      professionalText: null,
      grammarErrors: errors,
      naturalnessNotes: [], vocabularyOpportunities: [], registerNotes: [],
      sentenceCount: sentenceCount(text), completedSentenceCount: sentenceCount(text),
      subordinateClauseCount: (text.match(/\b(because|although|when|which|that|if)\b/gi) ?? []).length,
      vocabularyRatings: { appropriateness: rating, precision: rating, register: rating, collocation: rating },
      primaryFocus: errors[0]?.explanation ?? 'Keep speaking in full sentences.',
      followUpExercise: { type: 'repeat-pattern', prompt: 'Say the corrected version once more.' },
      bestSentence: null, upgradedExpression: null, newVocabulary: [],
    };
  },

  'assessment-grade': (messages) => {
    const text = findTranscript(messages);
    const errors = fossilisedToErrors(text);
    return {
      score: 60, correct: errors.length === 0,
      feedback: 'mock grade — no model judgement',
      evidence: 'mock provider — deterministic placeholder',
    };
  },

  'cefr-domain-judgement': (messages) => {
    const m = JSON.stringify(messages).match(/domain["'\s:]+(\w+)/i);
    const domain = (m?.[1] ?? 'speaking') as string;
    return {
      domain: ['speaking', 'listening', 'reading', 'writing', 'grammar', 'vocabulary'].includes(domain) ? domain : 'speaking',
      score: 50, evidence: 'mock provider — no model judgement',
    };
  },

  'pronunciation-notes': () => ({
    notes: ['mock provider — no phoneme evidence; confidence low'],
    targetWords: [],
  }),

  'roleplay-turn': (messages) => {
    const text = findTranscript(messages);
    const errors = fossilisedToErrors(text);
    const turns = messages.filter((m) => m.role === 'assistant').length;
    const ends = turns >= 5 || /(deal|agree|done|ok,? let'?s proceed)/i.test(text);
    const note = `Counterpart's private note: ${errors.length ? 'learner made a phrasing slip' : 'learner is holding position'}`;
    return {
      reply: ends ? 'Alright — we have a deal. Good working this through with you.'
        : errors.length
          ? `I hear you. (Aside: "${errors[0]!.quote}" sounded off to me.) Can you explain why I should accept that?`
          : 'I see. But why should I agree to that over the alternative?',
      ended: ends, internalNote: note,
    };
  },

  'negotiation-evaluation': (messages) => {
    const text = findTranscript(messages);
    const errors = fossilisedToErrors(text);
    const dim = () => ({ score: 50, evidence: 'mock provider — no model judgement' });
    return {
      language: { grammar: dim(), clarity: dim(), tone: dim(), vocabulary: dim(), fluency: dim() },
      negotiation: {
        questionQuality: dim(), valueFraming: dim(), objectionHandling: dim(),
        concessionDiscipline: dim(), boundaryClarity: dim(), alternativeGeneration: dim(), closing: dim(),
      },
      moments: [{
        learnerSaid: 'the quoted line', whyItWorkedOrNot: 'mock — evaluation shape only',
        betterResponse: 'a stronger phrasing', alternativeResponse: 'a different approach',
      }],
      retryChallenge: 'mock objection — retry value framing',
      grammarErrors: errors,
    };
  },

  'presentation-evaluation': (messages) => {
    const text = findTranscript(messages);
    const dim = () => ({ score: 50, evidence: 'mock provider — no model judgement' });
    return {
      dimensions: Object.fromEntries(
        ['opening','structure','logicalFlow','transitions','clarity','language','pacing','pauses','emphasis','audienceFraming','conclusion'].map((d) => [d, dim()]),
      ),
      grammarErrors: fossilisedToErrors(text),
      highlightMoment: null, weakestMoment: null,
      retryInstruction: 'mock — try again with a clearer structure',
    };
  },

  'debate-evaluation': (messages) => {
    const dim = () => ({ score: 50, evidence: 'mock provider — no model judgement' });
    return {
      language: { grammar: dim(), clarity: dim(), tone: dim(), vocabulary: dim(), fluency: dim() },
      reasoning: {
        claim: dim(), evidence: dim(), reasoning: dim(), counterargument: dim(),
        rebuttal: dim(), clarification: dim(), concession: dim(), summary: dim(),
      },
      grammarErrors: fossilisedToErrors(findTranscript(messages)),
    };
  },

  'writing-evaluation': (messages) => {
    const text = findTranscript(messages);
    const errors = fossilisedToErrors(text);
    const fixed = errors.reduce((t, e) => t.replace(e.quote, e.correction), text);
    const dim = () => ({ score: 50, evidence: 'mock provider — no model judgement' });
    return {
      issues: errors.map((e) => ({ quote: e.quote, fix: e.correction, explanation: e.explanation, dimension: 'grammar' })),
      correctedVersion: fixed, naturalVersion: fixed, advancedVersion: fixed,
      dimensions: Object.fromEntries(
        ['grammar','clarity','coherence','structure','vocabulary','naturalness','register','conciseness','mechanics'].map((d) => [d, dim()]),
      ),
      grammarErrors: errors,
      rewriteInstruction: 'Fix the flagged grammar points and rewrite yourself.',
    };
  },

  'reading-evaluation': () => {
    return {
      comprehensionScore: { score: 50, evidence: 'mock provider — no model judgement' },
      answers: [{ item: 'q', correct: true, note: 'mock' }],
      vocabularyHighlights: [],
      summaryFeedback: 'mock — covers the main idea',
    };
  },

  'journal-analysis': (messages) => {
    const text = findTranscript(messages);
    return {
      grammarErrors: fossilisedToErrors(text), vocabularyNotes: [], expressionNotes: [],
      naturalnessNotes: [], recurringPatterns: [], newWordsWorthLearning: [],
      improvedParagraph: null,
    };
  },

  'tamil-to-english': (messages) => {
    const text = findTranscript(messages);
    return {
      literalBasic: text, natural: text, professional: text, formal: null,
      grammarErrors: fossilisedToErrors(text), notes: ['mock'], keyDifference: 'mock — register',
    };
  },

  'register-evaluation': () => ({
    registerFit: { score: 50, evidence: 'mock provider — no model judgement' },
    detectedRegister: 'neutral',
    meaningPreserved: { value: true, reason: 'mock' },
    grammarErrors: [],
    modelVersion: 'mock model version', oneAdjustment: 'mock — tighten formality',
  }),
  'session-summary': () => ({
    whatYouDid: 'You completed a practice session.',
    whatImproved: 'no comparison data yet',
    topMistakes: [], bestSentence: null, upgradedExpression: null,
    vocabularyLearned: [], practiceScheduled: [],
    nextRecommendedActivity: 'Continue with a short conversation.',
  }),
};

export function registerMockResponder(name: string, fn: MockResponder): void {
  responders[name] = fn;
}

export function getMockResponder(name: string): MockResponder {
  const fn = responders[name];
  if (!fn) throw new MockResponderMissing(name);
  return fn;
}
