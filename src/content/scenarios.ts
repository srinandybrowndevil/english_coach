// spec §26 business modules, §27 negotiation, §31 real-life simulator.

export type BusinessScenario = {
  slug: string; module: string; title: string; setting: string;
  aiRole: string; learnerRole: string; objectives: string[];
  openingLine: string; difficultyVariants: string[]; evaluationFocus: string[];
};

const B = (slug: string, module: string, title: string, setting: string, aiRole: string, learnerRole: string, objectives: string[], openingLine: string, evaluationFocus: string[]): BusinessScenario =>
  ({ slug, module, title, setting, aiRole, learnerRole, objectives, openingLine, difficultyVariants: ['Easy — cooperative counterpart', 'Realistic — neutral, busy counterpart', 'Hard — skeptical, time-pressed counterpart', 'Expert — probing questions, objections', 'Pressure Test — interruptions and pushback'], evaluationFocus });

// all 22 modules of §26
export const BUSINESS_SCENARIOS: BusinessScenario[] = [
  B('biz-self-intro', 'introducing-yourself', 'Introduce yourself at a new client kickoff', 'Video call, first meeting with an international client', 'Client sponsor, friendly but evaluating', 'Consultant leading the engagement', ['Clear 30-second self-introduction', 'State role and value', 'Invite a follow-up question'], 'Hi, thanks for joining — why don\'t you introduce yourself first?', ['Concise structure', 'Confident tone', 'No rambling']),
  B('biz-company-intro', 'introducing-company', 'Introduce your company to a prospect', 'Trade-show booth conversation', 'Prospect who has never heard of the company', 'Founder/sales engineer', ['One-line positioning', 'Two proof points', 'Ask about their context'], 'So — what does your company actually do?', ['Positioning clarity', 'Jargon control', 'Question steering']),
  B('biz-discovery-call', 'discovery-call', 'Run a discovery call', 'First sales call with a prospective client', 'Prospect with a vague problem', 'Sales engineer running discovery', ['Ask open questions', 'Dig into pain and budget', 'Summarise what you heard'], 'I\'m not totally sure what I need yet — maybe you can tell me what you offer.', ['Open questions', 'Listening probes', 'Accurate summary']),
  B('biz-requirement-gathering', 'requirement-gathering', 'Gather requirements for a project', 'Working session with a product owner', 'Product owner with scattered requirements', 'Tech lead capturing requirements', ['Clarify each requirement', 'Confirm scope boundaries', 'Play back understanding'], 'I need something like our current system, but better, and faster, and cheaper.', ['Clarifying questions', 'Restating', 'Scope discipline']),
  B('biz-product-demo', 'product-demo', 'Give a product demo', 'Screen-share demo to a prospect', 'Prospect comparing three vendors', 'Solutions engineer demoing', ['Demo with benefit language', 'Handle interruption questions', 'Tie features to their pain'], 'Okay, show me — but I\'ve seen a dozen of these tools. Impress me.', ['Benefit framing', 'Handling interruptions', 'Concise narration']),
  B('biz-proposal', 'proposal', 'Walk a client through a proposal', 'Proposal review meeting', 'Decision-maker reading while you talk', 'Consultant presenting', ['Explain pricing structure', 'Justify scope choices', 'Ask for next step'], 'I skimmed it — convince me this is worth it.', ['Persuasive structure', 'Price framing', 'Asking for the next step']),
  B('biz-pricing', 'pricing', 'Discuss pricing with a buyer', 'Pricing negotiation on a call', 'Buyer pushing on price', 'Vendor defending value', ['Anchor value before number', 'Explain what the price includes', 'Hold or trade, don\'t cave'], 'Your price seems high. What am I paying for exactly?', ['Value framing', 'Anchoring', 'Composure under pressure']),
  B('biz-scope', 'scope-discussion', 'Define project scope', 'Scope-definition workshop', 'Client who keeps adding requirements', 'Delivery lead', ['Define in/out of scope', 'Quantify change requests', 'Stay polite but firm'], 'Oh, one more thing — can you also add reporting? And mobile? That\'s part of it, right?', ['Boundary setting', 'Change-request language', 'Assertive tone']),
  B('biz-timeline', 'timeline', 'Negotiate a timeline', 'Planning call with a client who wants it faster', 'Client pushing an unrealistic date', 'Project manager', ['Explain what drives the timeline', 'Offer trade-offs', 'Commit only to what\'s real'], 'We need this done in two weeks. Why would it take longer?', ['Explaining dependencies', 'Trade-off language', 'Realistic commitment']),
  B('biz-status-update', 'project-update', 'Give a project status update', 'Weekly client status call', 'Client PM who reads every line', 'Delivery lead reporting', ['Lead with the headline', 'State risks honestly', 'Clear next actions'], 'Give me the update — and please don\'t bury the bad news.', ['Headline-first structure', 'Risk framing', 'Crisp action items']),
  B('biz-delay', 'delay-communication', 'Communicate a delay', 'Call to inform client of a slipped deadline', 'Client who is already frustrated', 'PM delivering bad news', ['State the delay early', 'Give cause without excuses', 'Offer mitigation'], 'So tell me straight — are we still on track for Friday?', ['Direct bad news', 'Ownership language', 'Recovery plan']),
  B('biz-complaint', 'client-complaint', 'Handle a client complaint', 'Escalated call about a bug affecting their users', 'Angry client', 'Account manager', ['Acknowledge without deflecting', 'Apologise appropriately', 'Commit to concrete steps'], 'This bug has cost us real money. Why shouldn\'t we cancel?', ['Acknowledgement', 'De-escalation', 'Concrete commitments']),
  B('biz-escalation', 'client-escalation', 'Handle an escalation', 'Client has escalated to management', 'Irate stakeholder', 'Senior engineer on the escalation call', ['Stay calm under attack', 'Separate facts from feelings', 'Rebuild confidence with specifics'], 'I\'ve already spoken to your boss about this mess. What are you going to do about it?', ['Calm under fire', 'Fact-based response', 'Confidence rebuilding']),
  B('biz-team-meeting', 'team-meeting', 'Contribute in a team meeting', 'Sprint planning with the team', 'Tech lead moderating', 'Engineer reporting status and pushing back once', ['Report status concisely', 'Raise a concern', 'Volunteer for an item'], 'Alright team, let\'s go around — status and blockers.', ['Concise status', 'Raising concerns politely', 'Offering help']),
  B('biz-leadership', 'leadership-communication', 'Communicate a hard decision', 'Announcing a priority change to your team', 'Team member who disagrees', 'Lead explaining the change', ['Announce clearly', 'Give the reasoning', 'Handle pushback'], 'I don\'t get why we\'re dropping the feature we spent a month on.', ['Transparent reasoning', 'Handling dissent', 'Forward momentum']),
  B('biz-hiring', 'hiring', 'Conduct an interview', 'Interviewing a candidate', 'Candidate for an open role', 'Interviewer', ['Ask structured questions', 'Probe vague answers', 'Sell the role'], 'Happy to be here — what would you like to know?', ['Structured questioning', 'Follow-up probes', 'Warm professionalism']),
  B('biz-partnership', 'partnership', 'Explore a partnership', 'First meeting with a potential partner company', 'BD lead from a larger company', 'Founder exploring collaboration', ['Present mutual value', 'Ask what they need', 'Avoid over-committing'], 'We talk to a lot of companies like yours. What would this partnership look like?', ['Mutual-value framing', 'Strategic questions', 'Non-committal diplomacy']),
  B('biz-networking', 'networking', 'Network at an event', 'Conference hallway conversation', 'A stranger at the conference', 'Learner starting a conversation', ['Open naturally', 'Exchange value quickly', 'Exit gracefully'], 'Hi — first time at this conference?', ['Natural openers', 'Brief self-description', 'Graceful exit']),
  B('biz-conference', 'conference-conversation', 'Have a conference talk conversation', 'Post-talk Q&A and hallway follow-up', 'Audience member with a sharp question', 'Speaker', ['Answer a hard question', 'Admit limits honestly', 'Invite follow-up'], 'Interesting talk — but doesn\'t your approach fall apart at scale?', ['Handling challenge publicly', 'Honest limits', 'Warmth under scrutiny']),
  B('biz-international-client', 'international-client', 'Communicate across cultures', 'Call with a client from a different culture/timezone', 'Non-native English client, formal culture', 'Vendor lead', ['Speak clearly, avoid idioms', 'Check understanding', 'Mind tone and pace'], 'Please excuse my English — shall we start with the timeline?', ['Plain international English', 'Comprehension checks', 'Cultural sensitivity']),
  B('biz-closing', 'closing-sale', 'Close a sale', 'End of a positive sales call', 'Warm prospect with last-minute hesitation', 'Salesperson', ['Summarise agreement', 'Ask for the close', 'Handle final hesitation'], 'This all sounds good — I just need to think about it.', ['Trial closes', 'Addressing hesitation', 'Direct ask']),
  B('biz-follow-up', 'follow-up', 'Follow up after a meeting', 'Call/email follow-up after a proposal went quiet', 'Client who has gone silent', 'Vendor re-engaging', ['Polite persistence', 'Add value, don\'t just chase', 'Get a concrete next step'], 'Ah, sorry — been swamped. Remind me where we left it?', ['Non-needy persistence', 'Value-add follow-up', 'Securing a next step']),
];

// §27 negotiation personas
export type NegotiationPersona = {
  slug: string; name: string; archetype: string;
  goals: string[]; tactics: string[]; concessionPattern: string; pressureTriggers: string[];
};

export const NEGOTIATION_PERSONAS: NegotiationPersona[] = [
  { slug: 'friendly-buyer', name: 'Friendly buyer', archetype: 'Warm and agreeable, quietly takes everything you offer', goals: ['Get a fair deal without conflict'], tactics: ['Agrees fast', 'Asks for small extras at the end'], concessionPattern: 'Reciprocates concessions', pressureTriggers: ['None — test: don\'t over-discount to a friendly buyer'] },
  { slug: 'budget-buyer', name: 'Budget buyer', archetype: 'Genuinely constrained funds', goals: ['Maximum scope within budget'], tactics: ['Opens with a hard budget number', 'Asks what can be removed'], concessionPattern: 'Trades scope for price', pressureTriggers: ['Price above stated budget'] },
  { slug: 'aggressive-buyer', name: 'Aggressive buyer', archetype: 'Loud, anchors low, uses silence', goals: ['Win on price'], tactics: ['Lowball anchor', 'Long silences', 'Threatens to walk'], concessionPattern: 'Rarely concedes; pocket concessions you make', pressureTriggers: ['Any hesitation', 'Filler words', 'Over-apologising'] },
  { slug: 'procurement-manager', name: 'Experienced procurement manager', archetype: 'Professional, process-driven, has done this 1000 times', goals: ['Documented discount + terms'], tactics: ['Benchmarks you against competitors', 'Asks for your "best and final"'], concessionPattern: 'Structured trades only', pressureTriggers: ['Vague answers', 'No price breakdown'] },
  { slug: 'technical-founder', name: 'Technical founder', archetype: 'Skeptical of sales language, respects detail', goals: ['Proof the product works'], tactics: ['Technical probing', 'Rejects marketing speak'], concessionPattern: 'Concedes for capability, not price', pressureTriggers: ['Buzzwords', 'Hand-waving'] },
  { slug: 'skeptical-ceo', name: 'Skeptical CEO', archetype: 'Time-poor executive, wants ROI in one line', goals: ['Business outcome, not features'], tactics: ['"Why should I care?"', 'Cuts you off'], concessionPattern: 'Pays for outcomes', pressureTriggers: ['Feature dumping', 'Long answers'] },
  { slug: 'impatient-customer', name: 'Impatient customer', archetype: 'Annoyed, wants it solved now', goals: ['Quick resolution'], tactics: ['Interrupts', 'Deadlines everything'], concessionPattern: 'Settles for speed', pressureTriggers: ['Slow, hedged answers'] },
  { slug: 'foreign-client', name: 'Foreign client', archetype: 'Non-native speaker, formal, indirect', goals: ['Clear terms, no surprises'], tactics: ['Indirect refusals', 'Politeness over pushback'], concessionPattern: 'Slow, deliberate', pressureTriggers: ['Idioms and slang', 'Fast speech'] },
  { slug: 'discount-requester', name: 'Existing customer requesting discount', archetype: 'Loyal client leveraging the relationship', goals: ['A discount as a loyalty reward'], tactics: ['Cites loyalty and history', 'Compares to new-customer pricing'], concessionPattern: 'Accepts loyalty perks over cash discount', pressureTriggers: ['Dismissing the relationship'] },
  { slug: 'competitor-threat', name: 'Client threatening competitor switch', archetype: 'Holds a real alternative quote', goals: ['Price match or justification'], tactics: ['Names the competitor\'s lower price', 'Asks why pay more'], concessionPattern: 'Stays if value gap is proven', pressureTriggers: ['Bad-mouthing the competitor', 'Panicking'] },
];

export type NegotiationSituation = {
  slug: string; title: string; setup: string; aiOpening: string;
  skillsTested: string[];
};

export const NEGOTIATION_SITUATIONS: NegotiationSituation[] = [
  { slug: 'neg-anchor-double', title: 'The lowball anchor', setup: 'You quoted ₹50,000 for a project. The buyer has a competing quote at half your price.', aiOpening: 'Your quote is ₹50,000. Another company quoted ₹25,000. Why should I pay you twice as much?', skillsTested: ['Value framing', 'Anchoring', 'Composure'] },
  { slug: 'neg-scope-creep', title: 'Scope creep mid-deal', setup: 'Client keeps adding features but expects the same price.', aiOpening: 'Great — and you\'ll throw in the mobile app too, right? Same price.', skillsTested: ['Scope control', 'Trade-offs'] },
  { slug: 'neg-deadline-pressure', title: 'Deadline pressure', setup: 'Buyer claims they must sign today but only at a discount.', aiOpening: 'I need an answer in the next hour. Give me 20% off or I go elsewhere.', skillsTested: ['Pressure resistance', 'Conditional concessions'] },
  { slug: 'neg-payment-terms', title: 'Payment terms', setup: 'Client wants 90-day payment terms; your cash flow needs 30.', aiOpening: 'Standard terms for us are 90 days. That\'s non-negotiable.', skillsTested: ['Boundary setting', 'Alternative generation'] },
  { slug: 'neg-free-work', title: 'The "exposure" ask', setup: 'Client asks for free/discounted work now in exchange for "lots of work later".', aiOpening: 'Do this one cheap and there\'s a lot more where that came from. We\'re growing fast.', skillsTested: ['Value defence', 'Polite refusal'] },
  { slug: 'neg-renewal', title: 'Renewal negotiation', setup: 'Existing client wants to renew but at a lower rate citing a tight year.', aiOpening: 'We love the work — but budgets got cut. Can you do the same scope for 30% less?', skillsTested: ['Relationship leverage', 'Creative packaging'] },
  { slug: 'neg-timeline-trade', title: 'Speed for price', setup: 'Client wants faster delivery and lower cost simultaneously.', aiOpening: 'I need it in half the time AND under budget. Figure it out.', skillsTested: ['Iron triangle explanation', 'Offering trade-offs'] },
  { slug: 'neg-multi-stakeholder', title: 'Procurement gatekeeping', setup: 'Your champion loves you; procurement demands a discount and legal review.', aiOpening: 'The team likes you, but procurement requires a 15% discount and net-60 terms before we proceed.', skillsTested: ['Multi-stakeholder awareness', 'Holding terms'] },
];

// §27 difficulty levels
export const NEGOTIATION_DIFFICULTIES = [
  { level: 'Easy', description: 'Cooperative persona, states position openly, accepts reasonable counteroffers.' },
  { level: 'Realistic', description: 'Pushes back once or twice, tests your framing, concedes when persuaded.' },
  { level: 'Hard', description: 'Active objections, competitor comparisons, slow to concede.' },
  { level: 'Expert', description: 'Professional tactics: anchors, silences, package re-opening, deadline games.' },
  { level: 'Pressure Test', description: 'Maximum pressure: interruptions, ultimatums, emotional moves. Scored for composure.' },
] as const;

// §31 simulator scenarios — hiddenScript never shown pre-roleplay
export type SimulatorScenario = {
  slug: string; title: string; setting: string;
  aiRole: string; learnerRole: string; hiddenScript: string;
  objectives: string[]; difficulty: number;
};

const SIM = (slug: string, title: string, setting: string, aiRole: string, learnerRole: string, hiddenScript: string, objectives: string[], difficulty = 2): SimulatorScenario =>
  ({ slug, title, setting, aiRole, learnerRole, hiddenScript, objectives, difficulty });

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  SIM('sim-airport', 'Airport check-in', 'Check-in counter', 'Airline agent', 'Traveller checking in', 'Flight is overbooked; offer an upgrade only if learner asks about alternatives politely.', ['Check in', 'Ask about baggage', 'Handle overbooking news'], 2),
  SIM('sim-immigration', 'Immigration counter', 'Border control', 'Immigration officer, terse', 'Visitor', 'Officer probes purpose of visit; vague answers invite suspicion.', ['State purpose clearly', 'Answer follow-ups calmly', 'Keep answers short'], 2),
  SIM('sim-hotel', 'Hotel check-in', 'Hotel front desk', 'Receptionist', 'Guest', 'Reservation under a slightly different name; learner must clarify politely.', ['Check in', 'Clarify reservation issue', 'Ask about breakfast'], 1),
  SIM('sim-restaurant', 'Restaurant order', 'Mid-range restaurant', 'Waiter', 'Diner', 'The ordered dish is sold out; learner must choose an alternative and ask one question about it.', ['Order food', 'Handle unavailability', 'Ask for the bill'], 1),
  SIM('sim-taxi', 'Taxi ride', 'Street / cab', 'Driver, chatty', 'Passenger', 'Driver suggests a longer "scenic" route; learner can accept or decline politely.', ['Give destination', 'Respond to small talk', 'Handle the route suggestion'], 2),
  SIM('sim-shopping', 'Shopping', 'Electronics store', 'Salesperson', 'Customer comparing two products', 'Salesperson pushes the expensive one; learner must ask questions and decide.', ['Ask about products', 'Compare options', 'Decline or accept upsell'], 2),
  SIM('sim-hospital', 'Hospital reception', 'Clinic front desk', 'Receptionist', 'Patient', 'No same-day slots; learner must describe symptoms and negotiate urgency.', ['Describe symptoms', 'Request an appointment', 'Handle a refusal'], 3),
  SIM('sim-bank', 'Bank', 'Bank branch', 'Bank officer, formal', 'Customer opening an account', 'Officer requires documents learner doesn\'t have; must ask for alternatives.', ['Open an account', 'Understand document requirements', 'Ask clarifying questions'], 3),
  SIM('sim-customer-support', 'Customer support call', 'Phone call', 'Support agent', 'Customer with a billing issue', 'Agent must verify identity first; learner must stay patient through the script.', ['Explain the issue', 'Verify identity', 'Push for resolution'], 2),
  SIM('sim-job-interview', 'Job interview', 'Interview room', 'Interviewer', 'Candidate', 'Interviewer asks "tell me about yourself", strengths, a failure, and salary expectations.', ['Self-introduction', 'Answer behavioural questions', 'Handle salary question'], 4),
  SIM('sim-networking', 'Networking event', 'Conference mixer', 'Fellow attendee', 'Learner networking', 'Attendee is slightly distracted; learner must hold attention and exit gracefully.', ['Open conversation', 'Describe what you do', 'Exchange contacts'], 2),
  SIM('sim-conference', 'Conference', 'Between sessions', 'Another professional', 'Learner', 'Attendee challenges a claim learner makes; respond without defensiveness.', ['Small talk', 'Discuss topics', 'Handle a mild challenge'], 3),
  SIM('sim-office', 'Office conversation', 'Workplace kitchen/desk', 'Colleague', 'Learner', 'Colleague asks for help on learner\'s busy day; learner must set a polite boundary.', ['Small talk', 'Handle a request', 'Set a boundary politely'], 2),
  SIM('sim-team-meeting', 'Team meeting', 'Standup', 'Team lead', 'Team member', 'Learner must report status, mention a blocker, and ask for help.', ['Status update', 'Raise blocker', 'Ask for help'], 2),
  SIM('sim-foreign-client', 'Foreign client call', 'Video call', 'Client abroad, non-native speaker', 'Vendor', 'Client speaks slowly and formally; learner must match register and check understanding.', ['Clear speech', 'Register matching', 'Comprehension checks'], 3),
  SIM('sim-phone-call', 'Phone call', 'Unscheduled phone call', 'Receptionist then manager', 'Caller chasing an invoice', 'First reach a gatekeeper who screens the call; then reach the manager.', ['Get past a gatekeeper', 'State purpose briefly', 'Ask for a callback'], 3),
  SIM('sim-tech-support', 'Technical support', 'Dev helping a user', 'Non-technical user, frustrated', 'Support engineer', 'User describes a bug vaguely; learner must ask diagnostic questions without jargon.', ['Elicit symptoms', 'Explain without jargon', 'Give next steps'], 3),
  SIM('sim-emergency', 'Emergency communication', 'Urgent situation', 'Dispatcher / helper', 'Person reporting an emergency', 'Must communicate location, what happened, and what is needed — fast and clear.', ['Report location', 'Describe the emergency', 'Follow instructions'], 4),
  SIM('sim-social', 'Social conversation', 'Casual gathering', 'New acquaintance', 'Learner', 'Free-flowing small talk; move past "where are you from" into a real exchange.', ['Small talk', 'Find common ground', 'Ask follow-up questions'], 2),
  SIM('sim-meeting-new-people', 'Meeting new people', 'Neighbourhood or shared activity', 'New neighbour', 'Learner', 'Build rapport from zero; remember and reuse details they mention.', ['Introduce yourself', 'Show interest', 'End on a positive note'], 1),
];
