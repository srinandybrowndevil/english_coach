// §41 — single source of truth for canonical mistake rule ids.
// The fossilised detectors (fossilised.ts) and the LLM evaluators
// (SHARED_RULES in evaluators.ts) both resolve through this registry so the
// same underlying mistake always lands on one signature: `${domain}:${rule}`.

export interface CanonicalRule {
  label: string;
  domain: 'grammar' | 'vocabulary' | 'register' | 'pronunciation' | 'fluency';
  subcategory: string;
  aliases: string[];
}

const kebab = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const CANONICAL_RULES: Record<string, CanonicalRule> = {
  // SHARED_RULES ids (evaluator prompt contract)
  'did-plus-past-form': { label: 'did + past form ("didn\'t went")', domain: 'grammar', subcategory: 'Past tense > auxiliary did', aliases: ['did-past-form', 'didnt-plus-past', 'do-does-did-plus-past'] },
  'article-missing': { label: 'missing article (a/an/the)', domain: 'grammar', subcategory: 'Articles', aliases: ['missing-article', 'no-article', 'article-omission'] },
  'article-wrong': { label: 'wrong article (a/an/the)', domain: 'grammar', subcategory: 'Articles', aliases: ['wrong-article', 'incorrect-article'] },
  'preposition-wrong': { label: 'wrong preposition', domain: 'grammar', subcategory: 'Prepositions', aliases: ['preposition-error', 'wrong-preposition', 'preposition-missing'] },
  'subject-verb-agreement': { label: 'subject–verb agreement', domain: 'grammar', subcategory: 'Agreement', aliases: ['sv-agreement', 'subject-verb-mismatch'] },
  'one-of-plural': { label: '"one of" + plural noun', domain: 'grammar', subcategory: 'Noun plurality', aliases: ['one-of-my-singular', 'one-of-singular', 'one-of-plurality'] },
  'stative-progressive': { label: 'stative verb in -ing ("I am knowing")', domain: 'grammar', subcategory: 'Stative vs progressive', aliases: ['stative-verb-progressive', 'stative-ing'] },
  'tense-consistency': { label: 'tense consistency', domain: 'grammar', subcategory: 'Tense consistency', aliases: ['tense-shift', 'tense-mixing'] },
  'uncountable-plural': { label: 'uncountable noun pluralised ("informations")', domain: 'grammar', subcategory: 'Uncountable nouns', aliases: ['uncountable-noun-plural', 'mass-noun-plural'] },
  'question-word-order': { label: 'question word order', domain: 'grammar', subcategory: 'Question forms', aliases: ['question-inversion', 'question-form', 'wh-question-order'] },
  'reported-speech-tense': { label: 'reported speech tense shift', domain: 'grammar', subcategory: 'Reported speech', aliases: ['reported-tense', 'indirect-speech-tense'] },
  'comparative-form': { label: 'comparative form ("more better")', domain: 'grammar', subcategory: 'Comparison', aliases: ['comparative', 'double-comparative'] },
  'relative-pronoun': { label: 'relative pronoun choice', domain: 'grammar', subcategory: 'Relative clauses', aliases: ['relative-clause-pronoun', 'who-which-that'] },
  'gerund-vs-infinitive': { label: 'gerund vs infinitive', domain: 'grammar', subcategory: 'Verb patterns', aliases: ['gerund-infinitive', 'verb-pattern'] },
  'conditional-form': { label: 'conditional form', domain: 'grammar', subcategory: 'Conditionals', aliases: ['conditional', 'if-clause'] },
  'passive-form': { label: 'passive form', domain: 'grammar', subcategory: 'Passives', aliases: ['passive-voice-error', 'passive'] },
  'modal-plus-base': { label: 'modal + base form ("must to go")', domain: 'grammar', subcategory: 'Modals', aliases: ['modal-base-form', 'modal-infinitive'] },

  // Fossilised / regional detector ids (§42/§85 corpus)
  'discuss-about': { label: 'discuss about → discuss', domain: 'grammar', subcategory: 'Verb complementation', aliases: ['verb-complement', 'verb-complementation', 'discuss-about-preposition', 'explain-me', 'explain-to-me'] },
  'today-morning': { label: '"today morning" → "this morning"', domain: 'register', subcategory: 'Time adverbials', aliases: ['this-morning', 'time-adverbial-order'] },
  'have-a-doubt': { label: '"I have a doubt" → "I have a question"', domain: 'register', subcategory: 'Register / phrasing', aliases: ['i-have-a-doubt', 'have-doubt'] },
  'do-one-thing': { label: '"do one thing" → direct instruction', domain: 'register', subcategory: 'Register / phrasing', aliases: ['do-one-thing-first'] },
  'cope-up': { label: '"cope up" → "cope / cope with"', domain: 'vocabulary', subcategory: 'Phrasal verbs', aliases: ['cope-up-with', 'copeup'] },
  'prepone': { label: '"prepone" → "move earlier / bring forward"', domain: 'register', subcategory: 'Regional vocabulary', aliases: ['pre-pone'] },
  'do-the-needful': { label: '"do the needful" → specific request', domain: 'register', subcategory: 'Register / phrasing', aliases: ['kindly-do-the-needful'] },
  'good-name': { label: '"your good name?" → "what is your name?"', domain: 'register', subcategory: 'Register / phrasing', aliases: ['goodname'] },
  'years-back': { label: '"years back" → "years ago"', domain: 'register', subcategory: 'Time adverbials', aliases: ['back-time-adverbial'] },
  'sentence-final-only-itself': { label: 'sentence-final "only/itself" for emphasis', domain: 'register', subcategory: 'Emphasis particles', aliases: ['only-final', 'itself-final'] },
};

const ALIAS_TO_ID = new Map<string, string>();
for (const [id, r] of Object.entries(CANONICAL_RULES)) {
  for (const a of r.aliases) ALIAS_TO_ID.set(kebab(a), id);
}

const CATEGORY_DOMAIN: Record<string, CanonicalRule['domain']> = {
  grammar: 'grammar', vocabulary: 'vocabulary', lexical: 'vocabulary',
  register: 'register', pronunciation: 'pronunciation', fluency: 'fluency',
};

export const humaniseRule = (id: string) =>
  id.split('-').join(' ').replace(/^([a-z])/, (c) => c.toUpperCase());

/** Maps (category, rule) from a detector or an LLM error to the canonical id+domain. */
export function normaliseRule(
  category: string,
  rule: string,
): { ruleId: string; domain: CanonicalRule['domain']; subcategory: string; label: string } {
  const raw = kebab(rule);
  const ruleId = CANONICAL_RULES[raw] ? raw : (ALIAS_TO_ID.get(raw) ?? raw);
  const canonical = CANONICAL_RULES[ruleId];
  const fallbackDomain = CATEGORY_DOMAIN[kebab(category)] ?? 'grammar';
  return {
    ruleId,
    domain: canonical?.domain ?? fallbackDomain,
    subcategory: canonical?.subcategory ?? '',
    label: canonical?.label ?? humaniseRule(ruleId),
  };
}
