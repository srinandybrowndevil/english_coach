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
const findTranscript = (messages: { role: string; content: string }[]): string => {
  const last = messages[messages.length - 1]?.content ?? '';
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
