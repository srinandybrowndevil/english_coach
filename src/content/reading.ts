// spec §24 — reading passages per material type with exercises.
export type ReadingPassage = {
  slug: string; type: string; level: 'B1' | 'B2' | 'C1'; title: string;
  text: string;
  exercises: { kind: string; prompt: string; options?: string[]; answer?: string }[];
};

const R = (
  slug: string, type: string, level: ReadingPassage['level'], title: string, text: string,
  exercises: ReadingPassage['exercises'],
): ReadingPassage => ({ slug, type, level, title, text, exercises });

const MCQ = (prompt: string, options: string[], answer: string) => ({ kind: 'comprehension-mcq', prompt, options, answer });
const OPEN = (kind: string, prompt: string) => ({ kind, prompt });

export const READING_PASSAGES: ReadingPassage[] = [
  // conversation
  R('rd-conv-renovation', 'conversation', 'B1', 'The renovation chat',
    `"Hey, did you see the quote?" Priya held up her phone. "Six lakhs for the kitchen." "Ouch," said Raj. "But it includes the cabinets, right?" "Everything except appliances. Honestly? I'd rather wait six months and do it properly." Raj nodded. "Agreed. No point paying twice."`,
    [MCQ('What did Priya receive?', ['A kitchen renovation quote', 'A phone bill', 'A salary offer', 'A bank statement'], 'A kitchen renovation quote'),
     OPEN('infer-meaning', 'What does "paying twice" imply here?'),
     OPEN('summarise', 'Summarise the conversation in one or two sentences.')]),
  R('rd-conv-weekend', 'conversation', 'B2', 'Saturday plans',
    `"Fancy a drive out to the coast?" Maya asked. "Tempting, but I've got that report breathing down my neck," Dev replied. "Ah, it'll keep. You've been chained to your desk all week." "Tell you what — if I wrap it up by Friday, I'm in. Deal?" "Deal. I'll bring the snacks."`,
    [MCQ('Why is Dev hesitant?', ['He has a report to finish', 'He is tired', 'He dislikes the coast', 'He has guests'], 'He has a report to finish'),
     OPEN('identify-tone', 'What is the tone between the speakers?'),
     OPEN('paraphrase', 'Paraphrase "breathing down my neck".')]),

  // business writing
  R('rd-biz-delay', 'business-writing', 'B2', 'Delay announcement email',
    `Hi all — quick update on the rollout. We've hit a snag with the migration script and we're pushing the go-live from Monday to Thursday. I know that's not what anyone wants to hear. The honest reason: two edge cases failed validation today, and shipping anyway would have been worse. We've added a fix and a regression test; QA signs off Wednesday. If your team is blocked in the meantime, ping me directly.`,
    [MCQ('Why was the launch delayed?', ['Edge cases failed validation', 'Team holiday', 'Budget cuts', 'Client request'], 'Edge cases failed validation'),
     OPEN('identify-tone', 'How does the writer handle the bad news?'),
     OPEN('rewrite-simply', 'Rewrite the last sentence in simpler words.')]),
  R('rd-biz-proposal', 'business-writing', 'C1', 'Partnership proposal',
    `We propose a six-month pilot in which our platform replaces your existing reconciliation workflow. The pilot carries no licence fee; success criteria — a 40% reduction in manual review time — are agreed up front and measured monthly. Should the criteria be met, we would move to an annual contract at the attached rate card; if not, the pilot ends at no cost to you.`,
    [MCQ('What happens if the pilot succeeds?', ['An annual contract at the rate card', 'Nothing', 'A price increase', 'A new proposal'], 'An annual contract at the rate card'),
     OPEN('identify-argument', "What is the writer's main persuasive move?"),
     OPEN('explain-orally', 'Explain the offer out loud as if briefing a colleague.')]),

  // news-style
  R('rd-news-rates', 'news-style', 'B2', 'Central bank holds rates',
    `The central bank left interest rates unchanged at 4.25% on Tuesday, citing easing inflation and a cooling labour market. The decision surprised most analysts, who had priced in a quarter-point cut. Markets rallied: the benchmark index rose 1.8% by close. The bank signalled that cuts remain likely later this year but stressed it will "move only when the data demands it."`,
    [MCQ('What did the bank do?', ['Held rates at 4.25%', 'Cut rates', 'Raised rates', 'Gave no decision'], 'Held rates at 4.25%'),
     OPEN('infer-meaning', 'What does "move only when the data demands it" signal?'),
     OPEN('vocab-context', 'What does "easing inflation" mean here?')]),
  R('rd-news-startup', 'news-style', 'B1', 'Local startup expands',
    `A Chennai-based software startup said on Monday it will hire 200 engineers over the next year after closing a new funding round. The company, which builds tools for hospitals, plans offices in Coimbatore and Bengaluru. "Demand from mid-size hospitals has doubled," the CEO said. Hiring begins next month.`,
    [MCQ('What will the startup do?', ['Hire 200 engineers', 'Close offices', 'Cut funding', 'Build hospitals'], 'Hire 200 engineers'),
     OPEN('summarise', 'Summarise the news in one sentence.')]),

  // technology
  R('rd-tech-cache', 'technology', 'C1', 'Cache invalidation',
    `Cache invalidation is deceptively simple to describe and fiendishly hard to get right. The naive approach — expire entries after a fixed TTL — trades correctness for convenience: stale data leaks through whenever the underlying record changes early. Event-driven invalidation eliminates that class of bug, but introduces its own: ordering, delivery guarantees, and the new operational burden of a message bus. Teams that skip this analysis inevitably rediscover it in an incident review.`,
    [MCQ('What is the drawback of TTL expiry?', ['Stale data can leak through', 'It is too fast', 'It needs a message bus', 'It is too cheap'], 'Stale data can leak through'),
     OPEN('critique', 'Do you agree the trade-offs are fairly described? Give one reason.'),
     OPEN('paraphrase', 'Paraphrase "deceptively simple to describe".')]),

  // essay
  R('rd-essay-attention', 'essay', 'C1', 'The attention economy',
    `We speak of "spending" attention, yet we rarely treat it as a budget. Every feed is engineered to be the last thing you see and the first thing you check; the asymmetry is the point. What is rarely asked is whether attention is merely scarce or whether it is also productive — whether losing an hour to a feed is losing an hour of nothing, or losing an hour of something. The question is not rhetorical; it is economic.`,
    [OPEN('identify-argument', "What is the author's central claim?"),
     OPEN('critique', 'Does the author provide evidence, or mostly rhetoric?'),
     OPEN('summarise', 'Summarise the argument in two sentences.')]),

  // fiction
  R('rd-fic-letter', 'fiction', 'B2', 'The letter',
    `The letter had sat unopened on the mantelpiece for eleven days. Arun told himself he was busy; the truth was simpler and worse. He recognised the handwriting. Inside, his grandmother wrote in Tamil that the mango tree had finally fruited, that the roof was fixed, and that she missed him. He read it twice, then booked the train home.`,
    [MCQ('Why was the letter unopened?', ['Arun was avoiding it', 'He lost it', 'He couldn\'t read it', 'It was wet'], 'Arun was avoiding it'),
     OPEN('identify-tone', 'What is the emotional tone?'),
     OPEN('infer-meaning', 'What does the letter represent for Arun?')]),

  // report
  R('rd-report-safety', 'report', 'B2', 'Quarterly safety report',
    `Incident rate this quarter: 1.2 per 100,000 hours, down from 1.6. The improvement is driven by two interventions: mandatory toolbox talks (compliance 94%) and the revised PPE standard in Section 4. Near-miss reporting rose 31% — we treat this as a positive signal of reporting culture, not a deterioration in safety. Action items for next quarter: contractor induction refresh; fork-lift audit.`,
    [MCQ('What does the rise in near-miss reports mean?', ['A stronger reporting culture', 'More accidents', 'Worse safety', 'Data error'], 'A stronger reporting culture'),
     OPEN('summarise', 'Summarise the two action items.'),
     OPEN('vocab-context', 'What does "toolbox talk" mean?')]),

  // research-style
  R('rd-res-sleep', 'research-style', 'C1', 'Sleep and memory consolidation',
    `Sleep deprivation impairs hippocampal-dependent memory consolidation — this is well established. What is less settled is the dose-response curve. In our cohort (n = 214), a single night of 5-hour sleep reduced next-day retention by 11%; three consecutive nights compounded this to 34%. Crucially, two nights of recovery sleep did not fully restore baseline retention, suggesting that catch-up sleep is not a complete remedy — a finding with direct implications for shift-work design.`,
    [MCQ('What did three consecutive short nights do?', ['Reduced retention by 34%', 'Improved memory', 'No effect', 'Caused illness'], 'Reduced retention by 34%'),
     OPEN('critique', 'What limitation might a single-cohort study have?'),
     OPEN('identify-argument', 'What practical recommendation is implied?')]),

  // product documentation
  R('rd-doc-auth', 'product-documentation', 'B2', 'Authentication docs',
    `To authenticate, send a POST request to /api/auth/token with your client ID and secret in the body. The response contains an access token valid for 3600 seconds and a refresh token valid for 30 days. Include the access token in the Authorization header as "Bearer <token>" on every request. Tokens are single-tenant; never embed them in client-side code. Rotate secrets quarterly via the console.`,
    [MCQ('How long is the access token valid?', ['3600 seconds', '30 days', '1 day', 'Forever'], '3600 seconds'),
     OPEN('paraphrase', 'Paraphrase "Tokens are single-tenant".'),
     OPEN('vocab-context', 'What does "rotate secrets" mean?')]),

  // contract clause
  R('rd-legal-indemnity', 'contract-clause', 'C1', 'Indemnity clause',
    `The Supplier shall indemnify and hold harmless the Client against all claims, damages, losses and expenses arising out of any breach by the Supplier of its obligations under this Agreement, or any act or omission of its personnel, provided that the Client notifies the Supplier of any claim within thirty (30) days and grants the Supplier sole conduct of the defence. This indemnity shall survive termination of this Agreement.`,
    [MCQ('When does the Client lose indemnity rights?', ['If it does not notify within 30 days', 'Always', 'After termination', 'Never'], 'If it does not notify within 30 days'),
     OPEN('explain-orally', 'Explain the clause in plain English out loud.'),
     OPEN('vocab-context', 'What does "hold harmless" mean?')]),

  // proposal
  R('rd-prop-marketing', 'proposal', 'B2', 'Marketing pilot proposal',
    `We propose a three-month paid pilot covering two regions. Deliverables: weekly creative sets, channel reports, and a final readout. Fee: ₹4,00,000 flat; media spend is billed at cost with receipts. If the pilot beats your target CPA by 20%, we move to a retainer. If not, you keep the creative and owe nothing beyond the pilot fee. Kick-off within two weeks of signature.`,
    [MCQ('What is the pilot fee?', ['₹4,00,000', '₹5,00,000', 'Per-hour billing', 'Free'], '₹4,00,000'),
     OPEN('identify-argument', 'How does the writer de-risk the deal for the client?'),
     OPEN('rewrite-simply', 'Rewrite "media spend is billed at cost with receipts" simply.')]),
];
