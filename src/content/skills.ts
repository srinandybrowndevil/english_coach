// spec §38 skill graph. prereq slugs reference other entries here.
export type SkillSeed = {
  slug: string; domain: string; name: string; description: string;
  difficulty: number; importance: number; cefr: 'a1'|'a2'|'b1'|'b2'|'c1'|'c2';
  exerciseTypes: string[]; masteryThreshold: number; prerequisites: string[];
};

const S = (
  slug: string, domain: string, name: string, description: string,
  difficulty: number, importance: number, cefr: SkillSeed['cefr'],
  exerciseTypes: string[], prerequisites: string[] = [], masteryThreshold = 0.8,
): SkillSeed => ({ slug, domain, name, description, difficulty, importance, cefr, exerciseTypes, prerequisites, masteryThreshold });

export const SKILLS: SkillSeed[] = [
  // ── grammar (§17 order roughly follows curriculum depth)
  S('parts-of-speech', 'grammar', 'Parts of Speech', 'Identify and use nouns, verbs, adjectives, adverbs, determiners, conjunctions.', 1, 0.9, 'a1', ['lesson', 'identify', 'quiz']),
  S('nouns', 'grammar', 'Nouns', 'Common, proper, countable and uncountable nouns.', 1, 0.8, 'a1', ['lesson', 'quiz'], ['parts-of-speech']),
  S('pronouns', 'grammar', 'Pronouns', 'Personal, possessive, reflexive and relative pronouns.', 1, 0.8, 'a1', ['lesson', 'quiz'], ['parts-of-speech']),
  S('basic-verb-forms', 'grammar', 'Basic Verb Forms', 'Base, past, past participle, -ing forms of common verbs.', 1, 1.0, 'a1', ['lesson', 'drill', 'quiz'], ['parts-of-speech']),
  S('present-simple', 'grammar', 'Present Simple', 'Habits, facts, schedules; third-person -s.', 1, 1.0, 'a1', ['lesson', 'drill', 'speaking'], ['basic-verb-forms']),
  S('present-continuous', 'grammar', 'Present Continuous', 'Actions in progress; contrast with stative verbs.', 1, 1.0, 'a1', ['lesson', 'drill', 'speaking'], ['basic-verb-forms', 'present-simple']),
  S('articles', 'grammar', 'Articles', 'a/an/the/zero article rules; countability interplay.', 2, 1.0, 'a2', ['lesson', 'drill', 'writing'], ['nouns', 'present-simple']),
  S('determiners', 'grammar', 'Determiners', 'this/that, some/any, much/many, few/little.', 2, 0.8, 'a2', ['lesson', 'quiz'], ['articles']),
  S('past-simple', 'grammar', 'Past Simple', 'Completed past events; irregular verbs; did + base form.', 1, 1.0, 'a2', ['lesson', 'drill', 'speaking'], ['basic-verb-forms']),
  S('adjectives-adverbs', 'grammar', 'Adjectives & Adverbs', 'Order, comparison, manner adverbs.', 2, 0.7, 'a2', ['lesson', 'writing'], ['parts-of-speech']),
  S('prepositions', 'grammar', 'Prepositions', 'Time, place and dependent prepositions (interested in, depend on).', 2, 1.0, 'a2', ['lesson', 'drill'], ['articles']),
  S('conjunctions', 'grammar', 'Conjunctions', 'Coordinating and basic subordinating conjunctions.', 2, 0.8, 'a2', ['lesson', 'writing'], ['past-simple']),
  S('questions', 'grammar', 'Questions', 'Yes/no, wh-, subject vs object questions, tag questions.', 2, 1.0, 'a2', ['drill', 'speaking'], ['past-simple', 'present-simple']),
  S('negation', 'grammar', 'Negation', 'do/does/did + not; no/never/none; double-negation traps.', 2, 0.9, 'a2', ['drill'], ['past-simple']),
  S('auxiliary-modal-verbs', 'grammar', 'Auxiliary & Modal Verbs', 'do/be/have auxiliaries; can/could/should/must/might for ability, advice, obligation, probability.', 2, 1.0, 'a2', ['lesson', 'drill', 'speaking'], ['basic-verb-forms', 'negation']),
  S('present-perfect', 'grammar', 'Present Perfect', 'Experience, recent events, for/since/just/already/yet.', 3, 1.0, 'b1', ['lesson', 'drill', 'speaking'], ['past-simple']),
  S('past-continuous', 'grammar', 'Past Continuous', 'Interrupted actions, background setting in stories.', 2, 0.8, 'b1', ['lesson', 'speaking'], ['past-simple', 'present-continuous']),
  S('countable-uncountable', 'grammar', 'Countable & Uncountable Nouns', 'Quantifiers; advice/information/feedback never take -s.', 2, 0.9, 'b1', ['lesson', 'writing'], ['nouns', 'determiners']),
  S('subject-verb-agreement', 'grammar', 'Subject–Verb Agreement', 'Agreement with long subjects, each/every, there is/are.', 3, 1.0, 'b1', ['drill', 'writing'], ['nouns', 'present-simple']),
  S('comparatives-superlatives', 'grammar', 'Comparatives & Superlatives', 'Regular and irregular forms; than vs then.', 2, 0.8, 'a2', ['lesson', 'drill'], ['adjectives-adverbs']),
  S('future-forms', 'grammar', 'Future Forms', 'will / going to / present continuous for arrangements.', 2, 0.9, 'b1', ['lesson', 'speaking'], ['present-simple', 'present-continuous']),
  S('conditionals', 'grammar', 'Conditionals', 'Zero through third conditional; mixed conditionals.', 3, 1.0, 'b2', ['lesson', 'drill', 'writing'], ['present-perfect', 'future-forms']),
  S('passive-voice', 'grammar', 'Passive Voice', 'Form, use, agent omission; formal reporting.', 3, 0.9, 'b1', ['lesson', 'writing'], ['past-simple', 'auxiliary-modal-verbs']),
  S('reported-speech', 'grammar', 'Reported Speech', 'Backshift, reporting verbs, questions and commands.', 3, 0.8, 'b1', ['lesson', 'writing'], ['past-simple', 'questions']),
  S('relative-clauses', 'grammar', 'Relative Clauses', 'Defining/non-defining; who/which/that/whose; commas.', 3, 0.9, 'b2', ['lesson', 'writing'], ['conjunctions', 'pronouns']),
  S('gerunds-infinitives', 'grammar', 'Gerunds & Infinitives', 'Verb + -ing vs to-infinitive; meaning changes (stop/remember/try).', 3, 1.0, 'b1', ['lesson', 'drill'], ['basic-verb-forms', 'prepositions']),
  S('participles', 'grammar', 'Participles', 'Present/past participles as adjectives and reduced clauses.', 4, 0.7, 'b2', ['lesson', 'writing'], ['relative-clauses', 'passive-voice']),
  S('phrasal-structures', 'grammar', 'Phrasal Structures', 'Noun phrases, verb phrases, prepositional phrases in sentences.', 3, 0.7, 'b2', ['lesson'], ['prepositions', 'determiners']),
  S('clauses', 'grammar', 'Clauses', 'Main vs subordinate; noun, adverbial clauses.', 3, 0.8, 'b2', ['lesson', 'writing'], ['conjunctions', 'relative-clauses']),
  S('compound-complex-sentences', 'grammar', 'Compound & Complex Sentences', 'Building multi-clause sentences without run-ons.', 3, 1.0, 'b2', ['writing', 'speaking'], ['clauses', 'conjunctions']),
  S('parallel-structure', 'grammar', 'Parallel Structure', 'Balanced lists and comparisons in formal English.', 4, 0.8, 'b2', ['writing', 'drill'], ['compound-complex-sentences']),
  S('emphasis-inversion', 'grammar', 'Emphasis & Inversion', 'Cleft sentences; negative-adverb inversion; do-emphasis.', 4, 0.7, 'c1', ['lesson', 'writing'], ['compound-complex-sentences', 'negation']),
  S('subjunctive', 'grammar', 'Subjunctive & Unreal Forms', 'I suggest that he go; if I were; wish/if only.', 4, 0.7, 'c1', ['lesson', 'writing'], ['conditionals']),
  S('advanced-punctuation', 'grammar', 'Advanced Punctuation', 'Semicolon, colon, dash, parenthetical commas.', 4, 0.6, 'c1', ['writing'], ['compound-complex-sentences']),
  S('register-grammar', 'grammar', 'Register-Sensitive Grammar', 'How grammar shifts between casual and formal registers.', 4, 0.8, 'c1', ['lesson', 'writing'], ['compound-complex-sentences']),
  S('narrative-consistency', 'grammar', 'Narrative Tense Consistency', 'Sustaining a time frame while telling stories and updates.', 3, 1.0, 'b2', ['speaking', 'drill'], ['past-continuous', 'present-perfect']),
  S('indian-english-repair', 'grammar', 'Indian English Patterns', 'Repair fossilised patterns: discuss about, one of my friend, stative progressives.', 2, 1.0, 'b1', ['drill', 'speaking'], ['past-simple', 'prepositions']),

  // ── pronunciation (§11)
  S('th-sounds', 'pronunciation', 'TH Sounds θ/ð', 'think vs this; tongue between teeth.', 2, 1.0, 'a2', ['minimal-pairs', 'drill']),
  S('v-w-contrast', 'pronunciation', 'V/W Contrast', 'very vs wary; lower-lip vs rounded-lips.', 2, 1.0, 'a2', ['minimal-pairs', 'drill']),
  S('f-p-contrast', 'pronunciation', 'F/P Contrast', 'feel vs peel; friction vs stop.', 2, 0.8, 'a2', ['minimal-pairs']),
  S('z-s-contrast', 'pronunciation', 'Z/S Contrast', 'zoo vs Sue; voicing control.', 2, 0.9, 'a2', ['minimal-pairs', 'drill']),
  S('zh-sh-contrast', 'pronunciation', 'ʒ/ʃ Contrast', 'measure vs mesh.', 3, 0.7, 'b1', ['minimal-pairs'], ['z-s-contrast']),
  S('r-l-contrast', 'pronunciation', 'R/L Contrast', 'correct vs collect; tongue position.', 2, 0.9, 'a2', ['minimal-pairs']),
  S('vowel-contrasts', 'pronunciation', 'Vowel Contrasts æ/ɑ/ʌ', 'cat/cart/cut; jaw and tongue height.', 3, 1.0, 'b1', ['minimal-pairs', 'drill']),
  S('word-final-consonants', 'pronunciation', 'Word-Final Consonants', 'Audible final consonants; no vowel insertion or dropping.', 3, 1.0, 'b1', ['drill', 'shadowing'], ['v-w-contrast']),
  S('consonant-clusters', 'pronunciation', 'Consonant Clusters', 'str-, -sks, -sts; no inserted vowels.', 3, 0.9, 'b1', ['drill', 'shadowing'], ['word-final-consonants']),
  S('word-stress', 'pronunciation', 'Word Stress', 'PHOtograph vs phoTOgrapher; stress placement.', 3, 1.0, 'b1', ['drill', 'shadowing'], ['vowel-contrasts']),
  S('sentence-stress-rhythm', 'pronunciation', 'Sentence Stress & Rhythm', 'Content-word stress, weak forms, English rhythm.', 4, 1.0, 'b2', ['shadowing', 'listening'], ['word-stress']),
  S('connected-speech', 'pronunciation', 'Connected Speech', 'Linking, elision, assimilation, weak forms.', 4, 1.0, 'b2', ['shadowing', 'listening'], ['sentence-stress-rhythm']),
  S('intonation', 'pronunciation', 'Intonation', 'Rising/falling patterns; questions, lists, attitude.', 4, 0.9, 'b2', ['shadowing', 'speaking'], ['sentence-stress-rhythm']),
  S('ipa-literacy', 'pronunciation', 'IPA Literacy', 'Read IPA for vowels, consonants, diphthongs, stress marks.', 2, 0.8, 'a2', ['lesson', 'quiz'], ['vowel-contrasts']),

  // ── fluency & speaking (§14, §49)
  S('response-latency', 'fluency', 'Response Latency', 'Start answering within ~1s without translation delay.', 3, 1.0, 'b1', ['drill', 'speaking']),
  S('continuity-30-60', 'fluency', 'Nonstop Speaking 30–60s', 'Sustain speech without long pauses.', 2, 1.0, 'b1', ['speaking', 'drill'], ['response-latency']),
  S('filler-control', 'fluency', 'Filler Control', 'Reduce um/like/basically/you know; keep natural discourse markers.', 3, 1.0, 'b1', ['speaking'], ['continuity-30-60']),
  S('self-correction', 'fluency', 'Self-Correction & Repair', 'Recover smoothly when a word or grammar slips.', 3, 0.9, 'b1', ['speaking'], ['continuity-30-60']),
  S('idea-organisation', 'fluency', 'Idea Organisation', 'Point → reason → example; finish thoughts.', 3, 1.0, 'b2', ['speaking', 'writing'], ['continuity-30-60', 'compound-complex-sentences']),
  S('spontaneous-retrieval', 'fluency', 'Spontaneous Retrieval', 'Speak from keywords without preparing sentences.', 3, 1.0, 'b2', ['speaking', 'drill'], ['response-latency']),
  S('conversation-recovery', 'fluency', 'Conversation Recovery', '"What I mean is…" strategies when a word is lost (§34).', 2, 0.9, 'b1', ['speaking', 'drill'], ['self-correction']),
  S('storytelling', 'fluency', 'Storytelling', 'Structured narratives with tense control and pacing.', 3, 0.9, 'b2', ['speaking'], ['narrative-consistency', 'idea-organisation']),
  S('think-in-english', 'fluency', 'Think in English', 'Internal monologue and rapid naming; no translation step.', 3, 1.0, 'b2', ['drill', 'speaking'], ['spontaneous-retrieval']),

  // ── vocabulary (§18–23, §35)
  S('core-vocabulary', 'vocabulary', 'Core Vocabulary', 'High-frequency daily-life and work vocabulary.', 1, 1.0, 'a2', ['lesson', 'srs']),
  S('business-vocabulary', 'vocabulary', 'Business Vocabulary', 'Meetings, deadlines, deliverables, stakeholders.', 2, 1.0, 'b1', ['lesson', 'srs'], ['core-vocabulary']),
  S('phrasal-verbs-use', 'vocabulary', 'Phrasal Verbs', 'High-value phrasal verbs in context (§19).', 3, 0.9, 'b1', ['lesson', 'drill'], ['core-vocabulary']),
  S('idioms-use', 'vocabulary', 'Idioms', 'Useful idioms with register awareness (§20).', 3, 0.8, 'b2', ['lesson', 'srs'], ['phrasal-verbs-use']),
  S('collocations-use', 'vocabulary', 'Collocations', 'make a decision, raise a concern, deliver results (§21).', 3, 1.0, 'b2', ['drill', 'writing'], ['business-vocabulary']),
  S('modern-english', 'vocabulary', 'Modern English', 'Current conversational expressions and when not to use them (§22).', 3, 0.6, 'b2', ['lesson'], ['idioms-use']),
  S('precision-english', 'vocabulary', 'Precision English', 'Replace vague words with exact ones; precision > sophistication (§35).', 4, 0.9, 'c1', ['writing', 'drill'], ['collocations-use']),
  S('register-switching', 'vocabulary', 'Register Switching', 'Same meaning across casual→executive registers (§23).', 4, 1.0, 'c1', ['writing', 'speaking', 'drill'], ['register-grammar', 'collocations-use']),

  // ── listening & reading (§15, §24)
  S('sentence-comprehension', 'listening', 'Sentence Comprehension', 'Understand single sentences at natural speed.', 1, 0.9, 'a2', ['listening', 'dictation']),
  S('fast-speech', 'listening', 'Fast & Connected Speech', 'Handle 1.15x–1.3x natural connected speech.', 4, 1.0, 'b2', ['listening'], ['sentence-comprehension', 'connected-speech']),
  S('accent-exposure', 'listening', 'Accent Exposure', 'Indian, General American, Modern British, Australian, international business English.', 3, 0.9, 'b2', ['listening'], ['sentence-comprehension']),
  S('listening-inference', 'listening', 'Listening Inference', 'Implied meaning, tone, and intent.', 3, 0.9, 'b2', ['listening'], ['fast-speech']),
  S('shadowing-skill', 'listening', 'Shadowing', 'Repeat model speech with matched timing, stress, rhythm (§16).', 3, 0.9, 'b1', ['shadowing'], ['sentence-stress-rhythm']),
  S('reading-comprehension', 'reading', 'Reading Comprehension', 'Main ideas, detail, and structure of texts.', 2, 0.9, 'b1', ['reading', 'quiz']),
  S('reading-inference', 'reading', 'Reading Inference & Tone', 'Infer meaning and identify tone/argument.', 3, 0.9, 'b2', ['reading'], ['reading-comprehension']),
  S('business-documents', 'reading', 'Business Documents', 'Contracts, proposals, reports, product docs.', 4, 0.8, 'c1', ['reading'], ['reading-inference', 'business-vocabulary']),

  // ── writing (§25)
  S('sentence-writing', 'writing', 'Sentence Writing', 'Accurate sentences; punctuation; clarity.', 1, 1.0, 'a2', ['writing'], ['articles', 'subject-verb-agreement']),
  S('professional-email', 'writing', 'Professional Email', 'Clear, courteous, structured business email.', 2, 1.0, 'b1', ['writing'], ['sentence-writing', 'business-vocabulary']),
  S('formal-writing', 'writing', 'Formal & Executive Writing', 'Proposals, reports, executive summaries.', 4, 0.9, 'c1', ['writing'], ['professional-email', 'parallel-structure']),
  S('messaging-english', 'writing', 'Chat & Messaging English', 'WhatsApp/professional chat tone; concise replies.', 1, 0.8, 'a2', ['writing'], ['sentence-writing']),
  S('rewrite-practice', 'writing', 'Rewrite & Improve', 'Reproduce corrections; iterative improvement loop (§25).', 2, 0.9, 'b1', ['writing'], ['sentence-writing']),

  // ── professional domains (§26–31)
  S('self-introduction', 'business', 'Self & Company Introduction', 'Introduce yourself and your company credibly.', 2, 1.0, 'b1', ['scenario', 'speaking'], ['storytelling']),
  S('meeting-leadership', 'business', 'Meetings & Leadership', 'Run meetings, update status, give feedback.', 4, 1.0, 'b2', ['scenario'], ['self-introduction', 'idea-organisation']),
  S('client-communication', 'business', 'Client Communication', 'Discovery calls, updates, delays, complaints, escalations.', 4, 1.0, 'b2', ['scenario', 'speaking'], ['self-introduction']),
  S('negotiation-basics', 'negotiation', 'Negotiation Fundamentals', 'Anchoring, clarifying, offers and counteroffers.', 3, 1.0, 'b2', ['scenario'], ['client-communication', 'conditionals']),
  S('objection-handling', 'negotiation', 'Objection Handling', 'Respond to price/competitor/scope pressure.', 4, 1.0, 'c1', ['scenario', 'speaking'], ['negotiation-basics']),
  S('concession-control', 'negotiation', 'Concessions & Boundaries', 'Trade, don\'t give; defend scope and price.', 4, 0.9, 'c1', ['scenario'], ['negotiation-basics']),
  S('presentation-delivery', 'presentation', 'Presentation Delivery', 'Openings, structure, transitions, pace, closing.', 4, 0.9, 'b2', ['scenario', 'speaking'], ['idea-organisation', 'sentence-stress-rhythm']),
  S('debate-argumentation', 'debate', 'Debate & Argumentation', 'Claim, evidence, reasoning, rebuttal (§30).', 4, 0.7, 'c1', ['scenario', 'speaking'], ['idea-organisation']),
];
