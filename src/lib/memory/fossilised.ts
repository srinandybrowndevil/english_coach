// spec §42/§85 — deterministic detectors for patterns common in Indian English.
// These flag *regional/fossilised* usage for teaching, never silently mark it wrong.

export type Detection = {
  signature: string;
  category: 'lexical' | 'grammar';
  subcategory: string;
  span: string;
  start: number;
  end: number;
  explanation: string;
  internationalForm: string;
  indianEnglishNote: string;
  professionalAlternative: string;
};

type Detector = {
  signature: string;
  pattern: RegExp;
  category: 'lexical' | 'grammar';
  subcategory: string;
  explanation: string;
  internationalForm: string;
  indianEnglishNote: string;
  professionalAlternative: string;
  /** optional post-filter on the regex match */
  filter?: (m: RegExpExecArray) => boolean;
};

const PAST_FORMS =
  'went|came|saw|told|said|took|made|had|got|gave|knew|thought|bought|wrote|spoke|ate|ran|met|left|did|swam|began|drank|drove|fell|flew|forgot|grew|kept|paid|put|read|rose|sold|sent|set|shut|slept|stood|taught|threw|understood|woke|won';

export const DETECTORS: Detector[] = [
  {
    signature: 'grammar:past-tense:did-plus-past-form', // canonical §41 example
    pattern: new RegExp(`\\b(didn't|did not|didnt)\\s+(${PAST_FORMS})\\b`, 'gi'),
    category: 'grammar',
    subcategory: 'Past tense > Auxiliary did',
    explanation: 'After "did", the main verb returns to its base form.',
    internationalForm: 'did + base verb',
    indianEnglishNote: 'Common across Indian English; marks the speaker as non-native.',
    professionalAlternative: '"I did not go", "I didn\'t see that".',
  },
  {
    signature: 'lexical:verb-complement:discuss-about',
    pattern: /\bdiscuss(?:es|ed|ing)?\s+about\b/gi,
    category: 'lexical',
    subcategory: 'Verb complementation',
    explanation: '"Discuss" is transitive — it takes a direct object, not "about".',
    internationalForm: 'discuss something',
    indianEnglishNote: 'Extremely common in Indian English; sounds wrong internationally.',
    professionalAlternative: '"Let\'s discuss the timeline" / "talk about the timeline".',
  },
  {
    signature: 'grammar:plurality:one-of-my-singular',
    pattern: /\bone of my (\w+)\b/gi,
    category: 'grammar',
    subcategory: 'Noun plurality',
    explanation: '"One of" requires a plural noun — one of many.',
    internationalForm: 'one of my friends',
    indianEnglishNote: 'Frequent in Indian English speech.',
    professionalAlternative: '"One of my colleagues said…"',
    filter: (m) => !m[1]!.toLowerCase().endsWith('s'),
  },
  {
    signature: 'lexical:time-adverbial:today-morning',
    pattern: /\b(today morning|today evening|yesterday night)\b/gi,
    category: 'lexical',
    subcategory: 'Time adverbials',
    explanation: 'Standard English uses "this morning/afternoon/evening", "last night".',
    internationalForm: 'this morning / this evening / last night',
    indianEnglishNote: 'Standard inside India; marked elsewhere.',
    professionalAlternative: '"This morning I checked the report."',
  },
  {
    signature: 'lexical:register:have-a-doubt',
    pattern: /\bI have a doubt\b/gi,
    category: 'lexical',
    subcategory: 'Register / phrasing',
    explanation: '"Doubt" in international English implies distrust; use "question".',
    internationalForm: 'I have a question',
    indianEnglishNote: 'Neutral and universal in Indian English classrooms/offices.',
    professionalAlternative: '"I have a question about the scope."',
  },
  {
    signature: 'grammar:aspect:stative-progressive',
    pattern: /\bI am having (a|an) (question|doubt|problem|meeting)\b/gi,
    category: 'grammar',
    subcategory: 'Stative vs progressive',
    explanation: '"Have" for possession/experience is stative; progressive form misleads.',
    internationalForm: 'I have a question / I\'m in a meeting',
    indianEnglishNote: '"I am having" is idiomatic in Indian English.',
    professionalAlternative: '"I have a question" / "I\'m in a meeting".',
  },
  {
    signature: 'lexical:register:do-one-thing',
    pattern: /\bdo one thing\b/gi,
    category: 'lexical',
    subcategory: 'Register / phrasing',
    explanation: 'Direct calque from Indian languages; sounds abrupt or unclear internationally.',
    internationalForm: 'here\'s what to do / do this for me',
    indianEnglishNote: 'Perfectly understood in India; opaque elsewhere.',
    professionalAlternative: '"Here\'s what I need you to do."',
  },
  {
    signature: 'lexical:phrasal-verb:cope-up',
    pattern: /\bcope up with\b/gi,
    category: 'lexical',
    subcategory: 'Phrasal verbs',
    explanation: '"Cope" already means manage — "up" is redundant.',
    internationalForm: 'cope with',
    indianEnglishNote: 'Very common in Indian English; marked error elsewhere.',
    professionalAlternative: '"I\'m coping with the workload."',
  },
  {
    signature: 'lexical:regional:prepone',
    pattern: /\bprepone\b/gi,
    category: 'lexical',
    subcategory: 'Regional vocabulary',
    explanation: '"Prepone" is a legitimate Indian English coinage, but international audiences won\'t know it.',
    internationalForm: 'move earlier / bring forward',
    indianEnglishNote: 'Valid in Indian English — not "wrong", just regional.',
    professionalAlternative: '"Can we bring the meeting forward to Tuesday?"',
  },
  {
    signature: 'lexical:register:do-the-needful',
    pattern: /\b(?:kindly\s+)?do the needful\b/gi,
    category: 'lexical',
    subcategory: 'Register / phrasing',
    explanation: 'Dated bureaucratic phrasing; international readers find it vague.',
    internationalForm: 'please handle this / please take care of X',
    indianEnglishNote: 'Legacy officialese, still common in Indian business email.',
    professionalAlternative: '"Could you please process the refund?"',
  },
  {
    signature: 'lexical:register:good-name',
    pattern: /\bwhat is your good name\b/gi,
    category: 'lexical',
    subcategory: 'Register / phrasing',
    explanation: 'Calque of Hindi "aapka shubh naam"; sounds odd internationally.',
    internationalForm: 'what is your name',
    indianEnglishNote: 'Politely formal in India.',
    professionalAlternative: '"May I have your name?"',
  },
  {
    signature: 'lexical:time-adverbial:years-back',
    pattern: /\byears back\b/gi,
    category: 'lexical',
    subcategory: 'Time adverbials',
    explanation: 'Standard form is "years ago".',
    internationalForm: 'years ago',
    indianEnglishNote: 'Common in Indian English.',
    professionalAlternative: '"I joined the company two years ago."',
  },
  {
    signature: 'lexical:emphasis:sentence-final-only-itself',
    pattern: /\b(only|itself)(?=[.!?]?\s*$)/gim,
    category: 'lexical',
    subcategory: 'Emphasis particles',
    explanation: 'Sentence-final "only/itself" for emphasis is a regional pattern.',
    internationalForm: 'restructure: "It only started yesterday" / "the meeting itself"',
    indianEnglishNote: '"I reached yesterday only" / "in the office itself" — natural in India.',
    professionalAlternative: '"I only reached yesterday." / "…in the office itself…" (mid-clause)',
  },
];

export function detectFossilised(text: string): Detection[] {
  const out: Detection[] = [];
  for (const d of DETECTORS) {
    d.pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = d.pattern.exec(text)) !== null) {
      if (d.filter && !d.filter(m)) continue;
      out.push({
        signature: d.signature,
        category: d.category,
        subcategory: d.subcategory,
        span: m[0],
        start: m.index,
        end: m.index + m[0].length,
        explanation: d.explanation,
        internationalForm: d.internationalForm,
        indianEnglishNote: d.indianEnglishNote,
        professionalAlternative: d.professionalAlternative,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
