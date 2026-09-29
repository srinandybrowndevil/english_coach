// §17 dynamic prioritisation — maps grammar lessons to canonical mistake rules
// so a lesson whose topic matches an active pattern sorts first with the reason.
export const LESSON_RULE_IDS: Record<string, string[]> = {
  'lesson-parts-of-speech': [],
  'lesson-nouns': ['uncountable-plural', 'article-missing'],
  'lesson-articles': ['article-missing', 'article-wrong'],
  'lesson-pronouns': ['subject-verb-agreement'],
  'lesson-present-simple': ['subject-verb-agreement', 'stative-progressive'],
  'lesson-present-continuous': ['stative-progressive'],
  'lesson-past-simple': ['did-plus-past-form', 'tense-consistency'],
  'lesson-past-continuous': ['tense-consistency'],
  'lesson-present-perfect': ['tense-consistency'],
  'lesson-present-perfect-continuous': ['tense-consistency'],
  'lesson-future-forms': ['modal-plus-base'],
  'lesson-modal-verbs': ['modal-plus-base'],
  'lesson-conditionals': ['conditional-form'],
  'lesson-passives': ['passive-form'],
  'lesson-reported-speech': ['reported-speech-tense'],
  'lesson-questions': ['question-word-order'],
  'lesson-relative-clauses': ['relative-pronoun'],
  'lesson-gerunds-infinitives': ['gerund-vs-infinitive'],
  'lesson-comparatives-superlatives': ['comparative-form'],
  'lesson-prepositions': ['preposition-wrong', 'discuss-about'],
  'lesson-countable-uncountable': ['uncountable-plural', 'one-of-plural'],
  'lesson-subject-verb-agreement': ['subject-verb-agreement', 'one-of-plural'],
  'lesson-stative-verbs': ['stative-progressive'],
};

export function ruleIdsForLesson(slug: string): string[] {
  return LESSON_RULE_IDS[slug] ?? [];
}
