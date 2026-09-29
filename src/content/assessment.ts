// §58/§59 assessment item bank. Each entry is a variant GROUP: `variants`
// holds ≥2 comparable-but-not-identical items so monthly assessments rotate
// without memorisation (§59). `selectItems(kind, monthIndex)` picks
// variants[monthIndex % variants.length] per group (initial → monthIndex 0).

export type AssessmentItemType =
  | 'mcq' | 'cloze' | 'short' | 'writing' | 'speaking' | 'listening_mcq'
  | 'dictation' | 'pronunciation' | 'conversation' | 'roleplay';

export type AssessmentDomain =
  | 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';

export interface AssessmentItem {
  slug: string;
  section: string;
  type: AssessmentItemType;
  prompt: string;
  options?: string[];
  answer?: string;
  skillSlugs: string[];
  domain: AssessmentDomain;
  cefrTarget: 'a2' | 'b1' | 'b2' | 'c1';
  timeLimitSec?: number;
  audioText?: string;
  passage?: string;
  rubric?: string;
}

export interface AssessmentItemGroup {
  slug: string; // group id; selected item slug = `${slug}-v${n}`
  section: string;
  variants: AssessmentItem[];
}

type Cefr = AssessmentItem['cefrTarget'];

const mcq = (
  group: string, section: string, domain: AssessmentDomain, cefr: Cefr,
  skills: string[], pairs: [string, string, string[]][], // [variantPrompt, answer, options]
): AssessmentItemGroup => ({
  slug: group,
  section,
  variants: pairs.map(([prompt, answer, options], i) => ({
    slug: `${group}-v${i}`,
    section, type: 'mcq', prompt, options, answer, skillSlugs: skills, domain, cefrTarget: cefr,
  })),
});

const open = (
  group: string, section: string, type: AssessmentItemType, domain: AssessmentDomain,
  cefr: Cefr, skills: string[], prompts: string[], extra?: Partial<AssessmentItem>,
): AssessmentItemGroup => ({
  slug: group,
  section,
  variants: prompts.map((prompt, i) => ({
    slug: `${group}-v${i}`, section, type, prompt, skillSlugs: skills,
    domain, cefrTarget: cefr, ...extra,
  })),
});

/* ------------------------------- Grammar (24 groups) ------------------------------- */
const GR = 'Grammar';
const grammar: AssessmentItemGroup[] = [
  mcq('g-past-simple', GR, 'grammar', 'a2', ['past-simple'], [
    ['Yesterday I ___ to the office early.', 'went', ['went', 'go', 'gone', 'was go']],
    ['Last week she ___ the client presentation.', 'gave', ['gave', 'give', 'gived', 'has given']],
  ]),
  mcq('g-did-aux', GR, 'grammar', 'a2', ['past-simple', 'question-forms'], [
    ['He didn\'t ___ the email yesterday.', 'send', ['send', 'sent', 'sended', 'sending']],
    ['They didn\'t ___ the invoice on time.', 'pay', ['pay', 'paid', 'payed', 'paying']],
  ]),
  mcq('g-present-perfect', GR, 'grammar', 'b1', ['present-perfect'], [
    ['I ___ in Chennai since 2015.', 'have lived', ['have lived', 'am living', 'live', 'was living']],
    ['We ___ three contracts this quarter.', 'have closed', ['have closed', 'close', 'are closing', 'closed since']],
  ]),
  mcq('g-pp-vs-past', GR, 'grammar', 'b1', ['present-perfect', 'past-simple'], [
    ['I ___ him at the conference last June.', 'met', ['met', 'have met', 'meet', 'had meet']],
    ['She ___ the report yesterday afternoon.', 'finished', ['finished', 'has finished', 'finishes', 'is finishing']],
  ]),
  mcq('g-articles-job', GR, 'grammar', 'a2', ['articles'], [
    ['I work as ___ project manager.', 'a', ['a', 'the', 'an', '— (no article)']],
    ['She is ___ honest negotiator.', 'an', ['an', 'a', 'the', '— (no article)']],
  ]),
  mcq('g-articles-the', GR, 'grammar', 'b1', ['articles'], [
    ['___ software we discussed is now ready.', 'The', ['The', 'A', 'An', '— (no article)']],
    ['___ information you sent was very useful.', 'The', ['The', 'An', 'A', '— (no article)']],
  ]),
  mcq('g-prepositions-time', GR, 'grammar', 'a2', ['prepositions'], [
    ['The meeting is ___ Monday ___ 3 pm.', 'on … at', ['on … at', 'in … on', 'at … in', 'in … at']],
    ['The deadline is ___ Friday morning.', 'on', ['on', 'in', 'at', 'by the']],
  ]),
  mcq('g-verb-prep', GR, 'grammar', 'b1', ['prepositions', 'verb-patterns'], [
    ['We need to discuss ___ the budget.', '— (no preposition)', ['— (no preposition)', 'about', 'on', 'regarding to']],
    ['She depends ___ her team for the numbers.', 'on', ['on', 'of', 'in', 'with']],
  ]),
  mcq('g-question-forms', GR, 'grammar', 'a2', ['question-forms'], [
    ['___ you finish the draft?', 'Did', ['Did', 'Have done', 'Are', 'Was']],
    ['___ he agree to the terms?', 'Does', ['Does', 'Do', 'Is', 'Has do']],
  ]),
  mcq('g-countable', GR, 'grammar', 'b1', ['articles', 'plurality'], [
    ['I need ___ information before the call.', 'some', ['some', 'an', 'a', 'many']],
    ['She gave me ___ useful feedback.', 'some', ['some', 'a', 'an', 'many']],
  ]),
  mcq('g-comparatives', GR, 'grammar', 'a2', ['comparison'], [
    ['This proposal is ___ than the last one.', 'better', ['better', 'more better', 'good', 'best']],
    ['The new plan is ___ detailed than the old one.', 'more', ['more', 'most', 'much', 'very']],
  ]),
  mcq('g-conditionals-1', GR, 'grammar', 'b1', ['conditionals'], [
    ['If the price ___ too high, we will walk away.', 'is', ['is', 'will be', 'would be', 'was be']],
    ['If they offer more than 20%, we ___ accept.', 'will', ['will', 'would', 'had', 'shall have']],
  ]),
  mcq('g-conditionals-2', GR, 'grammar', 'b2', ['conditionals'], [
    ['If we ___ the deadline, the client would have been angry.', 'had missed', ['had missed', 'missed', 'would miss', 'have missed']],
    ['If she ___ earlier, we could have avoided the escalation.', 'had called', ['had called', 'called', 'would call', 'has called']],
  ]),
  mcq('g-passives', GR, 'grammar', 'b1', ['passives'], [
    ['The contract ___ signed last Friday.', 'was', ['was', 'is', 'has', 'been']],
    ['The shipment ___ delivered tomorrow.', 'will be', ['will be', 'is being', 'was', 'shall']],
  ]),
  mcq('g-reported', GR, 'grammar', 'b2', ['reported-speech'], [
    ['He said he ___ the documents the next day.', 'would send', ['would send', 'will send', 'sends', 'send']],
    ['She told me the meeting ___ moved to Thursday.', 'had been', ['had been', 'has been', 'is', 'will']],
  ]),
  mcq('g-relative', GR, 'grammar', 'b1', ['relative-clauses'], [
    ['The vendor ___ delivered late apologised.', 'who', ['who', 'which', 'whose', 'whom']],
    ['The report ___ you asked for is attached.', 'that', ['that', 'who', 'what', 'whom']],
  ]),
  mcq('g-modal-advice', GR, 'grammar', 'a2', ['modals'], [
    ['You ___ confirm the address before shipping.', 'should', ['should', 'shall to', 'must to', 'ought']],
    ['Employees ___ wear ID cards on site.', 'must', ['must', 'should to', 'can to', 'may to']],
  ]),
  mcq('g-modal-deduction', GR, 'grammar', 'b2', ['modals'], [
    ['He isn\'t answering — he ___ be in a meeting.', 'might', ['might', 'must to', 'should to', 'can to']],
    ['That ___ be right — the figures don\'t add up.', 'can\'t', ['can\'t', 'mustn\'t', 'won\'t to', 'don\'t']],
  ]),
  mcq('g-gerund-inf', GR, 'grammar', 'b1', ['verb-patterns'], [
    ['I look forward to ___ from you.', 'hearing', ['hearing', 'hear', 'heard', 'hear from']],
    ['She suggested ___ a follow-up call.', 'scheduling', ['scheduling', 'to schedule', 'schedule', 'scheduled']],
  ]),
  mcq('g-future-forms', GR, 'grammar', 'b1', ['future-forms'], [
    ['The train ___ at 9:05 tomorrow.', 'leaves', ['leaves', 'will leaving', 'is leave', 'leave']],
    ['I ___ the client at 4 pm — it\'s on my calendar.', 'am meeting', ['am meeting', 'meet will', 'will to meet', 'meets']],
  ]),
  mcq('g-subject-verb', GR, 'grammar', 'a2', ['subject-verb-agreement'], [
    ['Each of the reports ___ reviewed.', 'was', ['was', 'were', 'are', 'have']],
    ['Neither of the offers ___ acceptable.', 'is', ['is', 'are', 'were', 'be']],
  ]),
  mcq('g-stative', GR, 'grammar', 'b1', ['aspect'], [
    ['I ___ what you mean about the pricing.', 'understand', ['understand', 'am understanding', 'understood', 'have understand']],
    ['She ___ the answer right now.', 'knows', ['knows', 'is knowing', 'has knew', 'know']],
  ]),
  mcq('g-indirect-q', GR, 'grammar', 'b2', ['question-forms', 'register'], [
    ['Could you tell me where the invoice ___ ?', 'is', ['is', 'is it', 'does it', 'it is']],
    ['Do you know when the shipment ___ ?', 'arrives', ['arrives', 'does arrive', 'is arrive', 'will arrives']],
  ]),
  mcq('g-discourse', GR, 'grammar', 'c1', ['cohesion'], [
    ['___ the delays, the project finished on time.', 'Despite', ['Despite', 'In spite', 'Although', 'However']],
    ['The costs rose sharply. ___, we kept to the budget.', 'Nevertheless', ['Nevertheless', 'Because', 'Unless', 'Whereas']],
  ]),
];

/* ------------------------------- Vocabulary (16) ------------------------------- */
const VOC = 'Vocabulary';
const vocabulary: AssessmentItemGroup[] = [
  mcq('v-coll-make', VOC, 'vocabulary', 'b1', ['collocations'], [
    ['We need to ___ a decision today.', 'make', ['make', 'do', 'take', 'give']],
    ['Can you ___ a suggestion for the venue?', 'make', ['make', 'do', 'put', 'say']],
  ]),
  mcq('v-coll-do', VOC, 'vocabulary', 'b1', ['collocations'], [
    ['They ___ business with several European clients.', 'do', ['do', 'make', 'work', 'take']],
    ['We need to ___ more research before signing.', 'do', ['do', 'make', 'have', 'take']],
  ]),
  mcq('v-coll-strong', VOC, 'vocabulary', 'b2', ['collocations'], [
    ['There is ___ evidence that the plan works.', 'strong', ['strong', 'heavy', 'big', 'large']],
    ['She has a ___ interest in the outcome.', 'strong', ['strong', 'hard', 'deeply', 'big']],
  ]),
  mcq('v-phrasal-put', VOC, 'vocabulary', 'b1', ['phrasal-verbs'], [
    ['The meeting was ___ until next week.', 'put off', ['put off', 'put on', 'put up', 'put out']],
    ['We can\'t ___ the decision any longer.', 'put off', ['put off', 'put away', 'put down', 'put across']],
  ]),
  mcq('v-phrasal-carry', VOC, 'vocabulary', 'b2', ['phrasal-verbs'], [
    ['They agreed to ___ the audit in March.', 'carry out', ['carry out', 'carry on', 'carry over', 'carry off']],
    ['We will ___ the review next quarter.', 'carry out', ['carry out', 'carry on', 'carry with', 'carry along']],
  ]),
  mcq('v-phrasal-look', VOC, 'vocabulary', 'b1', ['phrasal-verbs'], [
    ['Could you ___ the contract before we sign?', 'look over', ['look over', 'look after', 'look up', 'look out']],
    ['I\'ll ___ the details and get back to you.', 'look into', ['look into', 'look over at', 'look up for', 'look on']],
  ]),
  mcq('v-idiom-ballpark', VOC, 'vocabulary', 'b2', ['idioms'], [
    ['"Give me a ballpark figure" means:', 'a rough estimate', ['a rough estimate', 'the final price', 'a sports field', 'an exact quote']],
    ['"Let\'s touch base" means:', 'check in briefly', ['check in briefly', 'play baseball', 'start from zero', 'meet in person only']],
  ]),
  mcq('v-idiom-table', VOC, 'vocabulary', 'b2', ['idioms'], [
    ['"Let\'s put this on the back burner" means:', 'postpone it', ['postpone it', 'reject it', 'prioritise it', 'discuss it now']],
    ['"It\'s on the table" in a negotiation means:', 'the offer is available to discuss', ['the offer is available to discuss', 'it is cancelled', 'it is a secret', 'lunch is ready']],
  ]),
  mcq('v-register-formal', VOC, 'vocabulary', 'b2', ['register'], [
    ['Formal email opener for a complaint:', 'I am writing to express my concern', ['I am writing to express my concern', 'Hey, this is not cool', 'Yo, fix this', 'What happened?!']],
    ['Most professional way to ask for an update:', 'Could you share the latest status?', ['Could you share the latest status?', 'What\'s up with it?', 'Send me the thing now', 'Tell me already']],
  ]),
  mcq('v-register-close', VOC, 'vocabulary', 'b1', ['register'], [
    ['Best closing for a formal email:', 'Kind regards', ['Kind regards', 'Later!', 'Cheers mate', 'Bye bye']],
    ['Best closing for a business letter you\'ve never met:', 'Yours sincerely', ['Yours sincerely', 'See ya', 'Take it easy', 'TTYL']],
  ]),
  mcq('v-word-family', VOC, 'vocabulary', 'b2', ['word-family'], [
    ['Noun form of "negotiate":', 'negotiation', ['negotiation', 'negotiatory', 'negotiant', 'negotiationing']],
    ['Adjective form of "rely":', 'reliable', ['reliable', 'reliantful', 'reliantness', 'relyable']],
  ]),
  mcq('v-synonym-precise', VOC, 'vocabulary', 'c1', ['precision'], [
    ['Most precise synonym of "a big problem" in a business report:', 'a significant issue', ['a significant issue', 'a huge thing', 'a biggie', 'a massive deal']],
    ['Most precise synonym of "very good results":', 'excellent outcomes', ['excellent outcomes', 'super cool stuff', 'great things', 'really nice results']],
  ]),
  mcq('v-biz-revenue', VOC, 'vocabulary', 'b1', ['business-vocabulary'], [
    ['Money a company earns before costs:', 'revenue', ['revenue', 'profit', 'margin', 'equity']],
    ['The difference between price and cost of a product:', 'margin', ['margin', 'revenue', 'capital', 'turnover']],
  ]),
  mcq('v-biz-deadline', VOC, 'vocabulary', 'b1', ['business-vocabulary'], [
    ['"Push back the deadline" means:', 'postpone it', ['postpone it', 'cancel it', 'meet it early', 'argue about it']],
    ['"We\'re behind schedule" means:', 'we are late on the plan', ['we are late on the plan', 'we finished early', 'we are over budget', 'we quit']],
  ]),
  mcq('v-confusing', VOC, 'vocabulary', 'b2', ['word-choice'], [
    ['"I need some ___ on this decision."', 'advice', ['advice', 'advise', 'adviseing', 'advices']],
    ['"The new policy will ___ everyone."', 'affect', ['affect', 'effect', 'effecting', 'affection']],
  ]),
  mcq('v-pairs', VOC, 'vocabulary', 'b1', ['word-choice'], [
    ['Choose correct: "Please ___ me when you arrive."', 'tell', ['tell', 'say', 'speak', 'talk']],
    ['"He ___ me a good question."', 'asked', ['asked', 'said', 'told', 'spoke']],
  ]),
];

/* ------------------------------- Reading (2 groups) ------------------------------- */
const reading: AssessmentItemGroup[] = [
  {
    slug: 'r-email-chain',
    section: 'Reading',
    variants: [
      // v0
      ...[0, 1, 2, 3, 4].map((q) => ({
        slug: `r-email-chain-v0-q${q}`,
        section: 'Reading', type: 'mcq' as const,
        prompt: [
          'Why is Anita writing to Mr. Rao?',
          'What does Anita want moved up?',
          'What risk does Anita flag?',
          'What does she ask Mr. Rao to do before Friday?',
          'The tone of the email is best described as:',
        ][q]!,
        options: [
          ['To cancel the project', 'To request a schedule change', 'To complain about billing', 'To resign from the project'],
          ['The delivery date', 'The kickoff call', 'The invoice date', 'The training session'],
          ['The vendor may miss the revised window', 'The budget may double', 'The staff may strike', 'The contract may lapse'],
          ['Approve the change and confirm vendor availability', 'Send a new contract', 'Cancel the order', 'Call the vendor directly'],
          ['Professional and urgent', 'Casual and friendly', 'Angry and accusatory', 'Formal and distant'],
        ][q]!,
        answer: [
          'To request a schedule change',
          'The delivery date',
          'The vendor may miss the revised window',
          'Approve the change and confirm vendor availability',
          'Professional and urgent',
        ][q]!,
        passage: `From: Anita Desai <anita@meridian.example>\nTo: Vikram Rao <v.rao@clientcorp.example>\nSubject: Delivery schedule — request to move up\n\nDear Mr. Rao,\n\nI'm writing to request a change to the delivery schedule for the Meridian rollout. Our internal testing finished a week ahead of plan, so we would like to move the delivery date from the 18th to the 11th.\n\nThere is one risk: our packaging vendor has limited capacity next week, and if we move forward they may not be able to meet the revised window. To mitigate this, could you confirm by Friday whether the earlier date works on your side? If it does, I will ask the vendor to hold capacity.\n\nPlease let me know if you need any additional detail.\n\nBest regards,\nAnita Desai\nProject Manager, Meridian Systems`,
        skillSlugs: ['reading-comprehension'],
        domain: 'reading' as const, cefrTarget: 'b1' as const,
      })),
      // v1
      ...[0, 1, 2, 3, 4].map((q) => ({
        slug: `r-email-chain-v1-q${q}`,
        section: 'Reading', type: 'mcq' as const,
        prompt: [
          'Why is Priya writing to Mr. Fernandes?',
          'What does she propose?',
          'What condition does she set?',
          'What must Mr. Fernandes do before Tuesday?',
          'The tone of the email is best described as:',
        ][q]!,
        options: [
          ['To dispute an invoice', 'To propose a phased rollout', 'To request a refund', 'To schedule a demo'],
          ['Split the migration into two phases', 'Cancel the second phase', 'Hire more staff', 'Change vendors'],
          ['Phase 2 starts only if phase 1 passes review', 'Full payment upfront', 'A new contract', 'Daily status calls'],
          ['Confirm whether the phased plan is acceptable', 'Sign the renewal', 'Pay the invoice', 'Attend a workshop'],
          ['Professional and solution-focused', 'Aggressive', 'Confused', 'Informal and chatty'],
        ][q]!,
        answer: [
          'To propose a phased rollout',
          'Split the migration into two phases',
          'Phase 2 starts only if phase 1 passes review',
          'Confirm whether the phased plan is acceptable',
          'Professional and solution-focused',
        ][q]!,
        passage: `From: Priya Nair <priya@dataflow.example>\nTo: Carlos Fernandes <c.fernandes@nova.example>\nSubject: Migration plan — phased approach\n\nDear Mr. Fernandes,\n\nFollowing Friday's call, I'd like to propose a phased rollout for the data migration. Rather than moving everything at once, we split the work into two phases: the customer records first, then the historical archive.\n\nThere is one condition: phase 2 will only begin once phase 1 has passed your team's review. This limits risk on both sides and gives us a clear checkpoint.\n\nCould you confirm by Tuesday whether the phased plan works for you? If so, I'll share the revised timeline the same day.\n\nBest regards,\nPriya Nair`,
        skillSlugs: ['reading-comprehension'],
        domain: 'reading' as const, cefrTarget: 'b1' as const,
      })),
    ] as unknown as AssessmentItem[],
  },
  {
    slug: 'r-opinion',
    section: 'Reading',
    variants: [
      ...[0, 1, 2, 3, 4].map((q) => ({
        slug: `r-opinion-v0-q${q}`,
        section: 'Reading', type: 'mcq' as const,
        prompt: [
          'What is the author\'s main claim?',
          'What evidence does the author use?',
          'What does "the meeting tax" refer to?',
          'What is the author\'s recommendation?',
          'The passage is best described as:',
        ][q]!,
        options: [
          ['Meetings improve all decisions', 'Most recurring meetings should be reduced', 'Managers should schedule more stand-ups', 'Email is dead'],
          ['A survey of 400 managers and cycle-time data', 'A personal anecdote only', 'Government statistics', 'No evidence'],
          ['The collective time cost of too many meetings', 'A literal tax on offices', 'Late fees', 'Coffee expenses'],
          ['Audit recurring meetings and cancel half', 'Ban all meetings', 'Move to four-day weeks', 'Hire a facilitator'],
          ['An opinion piece', 'A news report', 'An advertisement', 'A research abstract'],
        ][q]!,
        answer: [
          'Most recurring meetings should be reduced',
          'A survey of 400 managers and cycle-time data',
          'The collective time cost of too many meetings',
          'Audit recurring meetings and cancel half',
          'An opinion piece',
        ][q]!,
        passage: `Every team complains about meetings, yet calendars keep filling up. The real cost is what I call the meeting tax: not the hour in the room, but the attention fragments around it — the pre-read, the follow-up thread, the half-hour it takes to return to deep work.\n\nIn a survey of 400 managers, teams that cut recurring meetings by half shipped projects 18% faster, not slower. The myth that more meetings mean better alignment does not survive contact with the data. Most alignment happens in written documents, not in rooms.\n\nMy recommendation is blunt: audit your recurring meetings quarterly, and cancel half of them. Replace status updates with a shared document. Keep the meetings that make decisions; kill the ones that merely announce them.`,
        skillSlugs: ['reading-comprehension'],
        domain: 'reading' as const, cefrTarget: 'b2' as const,
      })),
      ...[0, 1, 2, 3, 4].map((q) => ({
        slug: `r-opinion-v1-q${q}`,
        section: 'Reading', type: 'mcq' as const,
        prompt: [
          'What is the author\'s main claim?',
          'What does the author say about "async work"?',
          'What evidence supports the claim?',
          'What is the recommendation?',
          'The passage is best described as:',
        ][q]!,
        options: [
          ['Remote work is always better', 'Async-first habits produce better writing and faster decisions', 'Offices should close', 'Chat apps are harmful'],
          ['Teams write clearer proposals and decide faster', 'It is cheaper', 'It is fashionable', 'It requires no skill'],
          ['Two teams\' deployment speed and proposal quality', 'A hunch', 'A single tweet', 'Industry rumours'],
          ['Default to written proposals before scheduling meetings', 'Ban chat', 'Return to office', 'Hire writers'],
          ['An opinion piece', 'A manual', 'A legal document', 'A novel'],
        ][q]!,
        answer: [
          'Async-first habits produce better writing and faster decisions',
          'Teams write clearer proposals and decide faster',
          'Two teams\' deployment speed and proposal quality',
          'Default to written proposals before scheduling meetings',
          'An opinion piece',
        ][q]!,
        passage: `The strongest remote teams I have worked with share one habit: they default to writing. Before any meeting, someone drafts a one-page proposal — context, options, recommendation. Discussion happens in comments, asynchronously, across time zones.\n\nTwo teams I observed deployed changes 40% faster after adopting this pattern, and their proposals were markedly clearer. Writing forces the author to structure a decision; a meeting lets everyone improvise around a slide.\n\nMy advice: before scheduling a decision meeting, require a written proposal. If the comments resolve it, cancel the meeting. Async-first does not mean slower — it means better-prepared when you do talk.`,
        skillSlugs: ['reading-comprehension'],
        domain: 'reading' as const, cefrTarget: 'b2' as const,
      })),
    ] as unknown as AssessmentItem[],
  },
];

/* ------------------------------- Listening (6 groups) ------------------------------- */
const listeningItems: AssessmentItemGroup[] = [
  {
    slug: 'l-dialogue-meeting', section: 'Listening',
    variants: [
      { slug: 'l-dialogue-meeting-v0', section: 'Listening', type: 'listening_mcq', prompt: 'Where does the conversation take place?', options: ['In an office', 'At a train station', 'In a restaurant', 'On a video call'], answer: 'On a video call', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'b1', audioText: 'Hi Meera, can you hear me alright? The screen share seems frozen on my side. — Yes Arjun, I can see it now. Shall we start with the quarterly numbers? — Sure. Before that, quick question: did the Mumbai team send the updated figures? — They did, about an hour ago. I have added them to the deck. So, first slide: revenue is up twelve percent this quarter.' },
      { slug: 'l-dialogue-meeting-v1', section: 'Listening', type: 'listening_mcq', prompt: 'What is the woman asking the man to do?', options: ['Send the draft again', 'Reschedule the call', 'Review the contract', 'Call the supplier'], answer: 'Send the draft again', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'b1', audioText: 'Hi Rohit, sorry to bother you — the attachment you sent will not open on my laptop. — Oh, I might have sent the older format. — Could you send the draft again as a PDF? That should work everywhere. — Of course, give me five minutes. Anything else? — No, that is all. Thanks!' },
    ],
  },
  {
    slug: 'l-dialogue-schedule', section: 'Listening',
    variants: [
      { slug: 'l-dialogue-schedule-v0', section: 'Listening', type: 'listening_mcq', prompt: 'What time will they meet?', options: ['2:30', '3:00', '3:30', '4:00'], answer: '3:30', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'a2', audioText: 'Can we move our catch-up? Something came up at two. — Sure, half past two or three? — Actually make it half past three, the call before might run over. — Three thirty it is. I will send an invite.' },
      { slug: 'l-dialogue-schedule-v1', section: 'Listening', type: 'listening_mcq', prompt: 'Where will they meet?', options: ['The cafeteria', 'Room 4B', 'The lobby', 'Online'], answer: 'Room 4B', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'a2', audioText: 'Are we still on for the design review? — Yes, but not in the cafeteria — too noisy. I have booked room 4B on the fourth floor. — 4B, got it. See you at eleven. — See you.' },
    ],
  },
  {
    slug: 'l-dialogue-problem', section: 'Listening',
    variants: [
      { slug: 'l-dialogue-problem-v0', section: 'Listening', type: 'listening_mcq', prompt: 'What problem did the client report?', options: ['Wrong invoice amount', 'Late delivery', 'Damaged packaging', 'Missing items'], answer: 'Missing items', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'b1', audioText: 'Good morning, this is Divya from Orbit Supplies. I am calling about order 4471 — the client says two boxes were missing from the delivery. — I am sorry to hear that. Can you confirm the delivery note? — They signed for ten boxes but only eight arrived. — Understood. I will raise it with the warehouse today and we will ship the missing two tomorrow.' },
      { slug: 'l-dialogue-problem-v1', section: 'Listening', type: 'listening_mcq', prompt: 'What does the agent promise to do?', options: ['Issue a refund', 'Resend the confirmation email', 'Escalate to a manager', 'Visit in person'], answer: 'Resend the confirmation email', skillSlugs: ['listening-comprehension'], domain: 'listening', cefrTarget: 'b1', audioText: 'Hi, I booked a slot for Tuesday but never got the confirmation email. — Let me check. Yes, I can see the booking — it looks like the email bounced. Could you confirm your address? — It is r.iyer at example dot com. — Perfect. I will resend the confirmation email right away, and you should see it within a few minutes.' },
    ],
  },
  {
    slug: 'l-fast', section: 'Listening',
    variants: [
      { slug: 'l-fast-v0', section: 'Listening', type: 'listening_mcq', prompt: 'What is the speaker\'s main point? (fast speech)', options: ['Budget approval is pending', 'The launch was delayed', 'The team beat the deadline', 'Hiring is frozen'], answer: 'The team beat the deadline', skillSlugs: ['listening-fast-speech'], domain: 'listening', cefrTarget: 'b2', audioText: 'Okay quick update before we jump in — the dev team actually wrapped up the sprint two days early, which, honestly, nobody expected given the scope creep we saw last month. So the launch date holds, and marketing can go ahead with the announcement on Friday.' },
      { slug: 'l-fast-v1', section: 'Listening', type: 'listening_mcq', prompt: 'What does the speaker want the listener to do? (fast speech)', options: ['Send the report tonight', 'Join a call tomorrow', 'Approve the budget', 'Reschedule the demo'], answer: 'Join a call tomorrow', skillSlugs: ['listening-fast-speech'], domain: 'listening', cefrTarget: 'b2', audioText: 'Hey, real quick — the client moved their review call to tomorrow morning, nine o\'clock our time, and they want someone from engineering on the line in case technical questions come up. Can you make it? It should only take about twenty minutes, maybe half an hour tops.' },
    ],
  },
  {
    slug: 'l-dictation-a', section: 'Listening',
    variants: [
      { slug: 'l-dictation-a-v0', section: 'Listening', type: 'dictation', prompt: 'Listen and type exactly what you hear.', answer: 'The quarterly results will be announced on Friday morning.', skillSlugs: ['listening-dictation'], domain: 'listening', cefrTarget: 'b1', audioText: 'The quarterly results will be announced on Friday morning.' },
      { slug: 'l-dictation-a-v1', section: 'Listening', type: 'dictation', prompt: 'Listen and type exactly what you hear.', answer: 'Please confirm the shipping address before we dispatch the order.', skillSlugs: ['listening-dictation'], domain: 'listening', cefrTarget: 'b1', audioText: 'Please confirm the shipping address before we dispatch the order.' },
    ],
  },
  {
    slug: 'l-dictation-b', section: 'Listening',
    variants: [
      { slug: 'l-dictation-b-v0', section: 'Listening', type: 'dictation', prompt: 'Listen and type exactly what you hear.', answer: 'We should probably reschedule the meeting to next Tuesday.', skillSlugs: ['listening-dictation'], domain: 'listening', cefrTarget: 'b2', audioText: 'We should probably reschedule the meeting to next Tuesday.' },
      { slug: 'l-dictation-b-v1', section: 'Listening', type: 'dictation', prompt: 'Listen and type exactly what you hear.', answer: 'I would have preferred a longer notice period, honestly.', skillSlugs: ['listening-dictation'], domain: 'listening', cefrTarget: 'b2', audioText: 'I would have preferred a longer notice period, honestly.' },
    ],
  },
];

/* ------------------------------- Writing (2 groups) ------------------------------- */
const writing: AssessmentItemGroup[] = [
  open('w-client-email', 'Writing', 'writing', 'writing', 'b1', ['email-writing', 'register'], [
    'A client writes: "The delivery is three days late. This is unacceptable." Write a professional reply (60–120 words): apologise, explain briefly, offer a concrete next step.',
    'A client writes: "Your proposal is over our budget." Write a professional reply (60–120 words): acknowledge the concern, hold value, offer one option.',
  ], { rubric: 'Professional register; apology/acknowledgement; specific next step; correct email conventions.' }),
  open('w-opinion', 'Writing', 'writing', 'writing', 'b2', ['paragraph-writing', 'argument-structure'], [
    'Write about 120 words: "Is it better to specialise deeply in one skill or to know a little about many things?" Give a clear position and one supporting example.',
    'Write about 120 words: "Should companies measure employees by hours worked or by results?" Give a clear position and one supporting example.',
  ], { rubric: 'Clear position; supporting example; paragraph structure; B2-level range.' }),
];

/* ------------------------------- Pronunciation (8 groups — cover §11 contrasts) ------ */
const pronunciation: AssessmentItemGroup[] = [
  open('p-th', 'Pronunciation', 'pronunciation', 'speaking', 'b1', ['th-sounds'], [
    'Say: "I think the three of them thought it through."',
    'Say: "Neither of them bothered with the third theorem."',
  ]),
  open('p-vw', 'Pronunciation', 'pronunciation', 'speaking', 'b1', ['v-w-contrast'], [
    'Say: "Vera was very worried about the wet weather."',
    'Say: "We never wear velvet in warm weather."',
  ]),
  open('p-fp', 'Pronunciation', 'pronunciation', 'speaking', 'b1', ['f-p-contrast'], [
    'Say: "Please file the papers before five."',
    'Say: "Put the final photograph in the folder."',
  ]),
  open('p-zs', 'Pronunciation', 'pronunciation', 'speaking', 'b1', ['s-z-contrast'], [
    'Say: "His cousin uses the same phrase."',
    'Say: "These days she chooses easy pieces."',
  ]),
  open('p-shzh', 'Pronunciation', 'pronunciation', 'speaking', 'b2', ['sh-sounds'], [
    'Say: "The decision was unusual, like a measured pleasure."',
    'Say: "It is usually a pleasure to measure the occasion."',
  ]),
  open('p-rl', 'Pronunciation', 'pronunciation', 'speaking', 'b2', ['r-l-contrast'], [
    'Say: "Rita really likes reading local literature."',
    'Say: "Larry rarely recalls the red roller."',
  ]),
  open('p-vowels', 'Pronunciation', 'pronunciation', 'speaking', 'b2', ['vowel-length'], [
    'Say: "The bad cup of coffee was bitter but calm."',
    'Say: "A bus cut the calm cat in the cart."',
  ]),
  open('p-clusters', 'Pronunciation', 'pronunciation', 'speaking', 'b2', ['consonant-clusters'], [
    'Say: "He scripts strict tests for the sixth sprint."',
    'Say: "The crisp crusts cracked under strict texts."',
  ]),
];

/* ------------------------------- Speaking (2 groups) ------------------------------- */
const speaking: AssessmentItemGroup[] = [
  open('sp-monologue-work', 'Speaking', 'speaking', 'speaking', 'b1', ['speaking-monologue'], [
    'Speak for 60 seconds: describe your typical workday — what you do first, what takes the most time, and what you enjoy most.',
    'Speak for 60 seconds: describe a project you are proud of — what it was, your role, and the outcome.',
  ], { timeLimitSec: 70 }),
  open('sp-monologue-opinion', 'Speaking', 'speaking', 'speaking', 'b2', ['speaking-monologue', 'argument-structure'], [
    'Speak for 60 seconds: "Do you think remote work makes teams stronger or weaker?" Give a clear opinion and one reason.',
    'Speak for 60 seconds: "Is it better to reply to messages instantly or in batches?" Give a clear opinion and one reason.',
  ], { timeLimitSec: 70 }),
];

/* ------------------------------- Conversation / Storytelling / Business / Negotiation / Spontaneous -- */
const conversation: AssessmentItemGroup[] = [
  open('c-tutor-chat', 'Conversation', 'conversation', 'speaking', 'b1', ['conversation'], [
    'Have a short conversation with the tutor. Start by telling them what you did last weekend.',
    'Have a short conversation with the tutor. Start by describing your city to someone who has never visited India.',
  ]),
];

const storytelling: AssessmentItemGroup[] = [
  open('st-story', 'Storytelling', 'speaking', 'speaking', 'b2', ['storytelling'], [
    'Tell me about a time when you had to solve a difficult problem at work. Speak for about 2 minutes.',
    'Tell me about a time when something did not go to plan. What happened and what did you learn? Speak for about 2 minutes.',
  ], { timeLimitSec: 130 }),
];

const business: AssessmentItemGroup[] = [
  open('b-self-intro', 'Business', 'speaking', 'speaking', 'b1', ['business-introductions'], [
    'Introduce yourself and your company to a new international client. Speak for about 90 seconds.',
    'Introduce your team and what it does to a visiting partner. Speak for about 90 seconds.',
  ], { timeLimitSec: 100 }),
  open('b-client-complaint', 'Business', 'speaking', 'speaking', 'b2', ['complaint-handling'], [
    'A client says: "Your team missed the deadline twice. Why should we keep working with you?" Respond aloud as if speaking to them (60–90 seconds).',
    'A client says: "The last two invoices had errors and nobody told us." Respond aloud as if speaking to them (60–90 seconds).',
  ], { timeLimitSec: 100 }),
];

const negotiation: AssessmentItemGroup[] = [
  open('n-roleplay', 'Negotiation', 'roleplay', 'speaking', 'b2', ['negotiation-fundamentals'], [
    'Roleplay: you are selling a service at ₹50,000. The buyer wants it for ₹25,000. Stay professional, defend your value, and try to reach an agreement.',
    'Roleplay: a client wants a 30% discount on a ₹40,000 package. Stay professional, defend your value, and try to reach an agreement.',
  ]),
];

const spontaneous: AssessmentItemGroup[] = [
  open('spq-1', 'Spontaneous', 'speaking', 'speaking', 'b1', ['spontaneous-response'], [
    'Answer quickly (15 seconds): What is the first thing you do when you start work?',
    'Answer quickly (15 seconds): What did you eat for breakfast today?',
  ], { timeLimitSec: 20 }),
  open('spq-2', 'Spontaneous', 'speaking', 'speaking', 'b1', ['spontaneous-response'], [
    'Answer quickly (15 seconds): Describe your phone to someone who has never seen one.',
    'Answer quickly (15 seconds): Describe your favourite app and why you use it.',
  ], { timeLimitSec: 20 }),
  open('spq-3', 'Spontaneous', 'speaking', 'speaking', 'b1', ['spontaneous-response'], [
    'Answer quickly (15 seconds): What would you say to a colleague who is always late?',
    'Answer quickly (15 seconds): How do you explain "deadline" to a child?',
  ], { timeLimitSec: 20 }),
  open('spq-4', 'Spontaneous', 'speaking', 'speaking', 'b1', ['spontaneous-response'], [
    'Answer quickly (15 seconds): What is the hardest part of your job?',
    'Answer quickly (15 seconds): What skill would you learn if you had a free month?',
  ], { timeLimitSec: 20 }),
  open('spq-5', 'Spontaneous', 'speaking', 'speaking', 'b1', ['spontaneous-response'], [
    'Answer quickly (15 seconds): Describe the weather today in three different ways.',
    'Answer quickly (15 seconds): Convince me to drink more water. Go.',
  ], { timeLimitSec: 20 }),
];

export const ASSESSMENT_SECTION_ORDER = [
  'Grammar', 'Vocabulary', 'Reading', 'Listening', 'Writing', 'Pronunciation',
  'Speaking', 'Conversation', 'Storytelling', 'Business', 'Negotiation', 'Spontaneous',
] as const;

export const ASSESSMENT_ITEM_BANK: AssessmentItemGroup[] = [
  ...grammar, ...vocabulary, ...reading, ...listeningItems, ...writing,
  ...pronunciation, ...speaking, ...conversation, ...storytelling,
  ...business, ...negotiation, ...spontaneous,
];

/** §58/§59 — deterministic variant selection per group. */
export function selectItems(kind: 'initial' | 'monthly', monthIndex = 0): AssessmentItem[] {
  const seedIndex = kind === 'initial' ? 0 : monthIndex;
  return ASSESSMENT_ITEM_BANK.map(
    (g) => g.variants[seedIndex % g.variants.length]!,
  );
}
