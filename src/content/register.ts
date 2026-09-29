// spec §23 — register awareness and transformation drills.
export type RegisterInfo = { slug: string; name: string; description: string };
export type RegisterTransform = { slug: string; meaning: string; versions: Record<string, string> };

export const REGISTERS: RegisterInfo[] = [
  { slug: 'very-casual', name: 'Very casual', description: 'Close friends, slang, fragments. "sup", "bet", "lowkey".' },
  { slug: 'casual', name: 'Casual', description: 'Everyday relaxed speech; contractions, phrasal verbs.' },
  { slug: 'neutral', name: 'Neutral', description: 'Clear standard English; safe default for most conversation.' },
  { slug: 'professional', name: 'Professional', description: 'Workplace standard; polite, direct, complete sentences.' },
  { slug: 'formal', name: 'Formal', description: 'Written/official; no contractions, precise vocabulary.' },
  { slug: 'executive', name: 'Executive', description: 'Boardroom brevity; outcome language, confident, no filler.' },
  { slug: 'academic', name: 'Academic', description: 'Structured argument, hedged claims, citations implied.' },
  { slug: 'diplomatic', name: 'Diplomatic', description: 'Maximum tact; soften disagreement, preserve face.' },
  { slug: 'assertive', name: 'Assertive', description: 'Direct and firm without aggression; states needs plainly.' },
  { slug: 'persuasive', name: 'Persuasive', description: 'Benefit-led, emotionally aware, engineered to convince.' },
];

const R = (slug: string, meaning: string, versions: Record<string, string>): RegisterTransform => ({ slug, meaning, versions });

export const REGISTER_TRANSFORMS: RegisterTransform[] = [
  R('give-moment', 'Give me a moment', {
    casual: 'Gimme a sec.', neutral: 'Give me a moment.', professional: 'Could you give me a moment, please?',
    formal: 'I would appreciate a moment to consider this.', executive: 'One moment.' }),
  R('dont-know', "I don't know", {
    casual: 'No clue.', neutral: 'I don\'t know.', professional: 'I\'m not sure — let me check and get back to you.',
    formal: 'I do not have that information at present.', executive: 'I don\'t know yet. I\'ll find out.' }),
  R('want-meeting', 'I want a meeting', {
    casual: 'Wanna meet?', neutral: 'Can we meet?', professional: 'Could we schedule a call to discuss this?',
    formal: 'I would like to request a meeting at your earliest convenience.', executive: 'Let\'s get 30 minutes this week.' }),
  R('disagree', 'I disagree', {
    casual: 'Nah, that\'s wrong.', neutral: 'I don\'t agree.', professional: 'I see it differently — can I explain?',
    formal: 'I must respectfully disagree.', diplomatic: 'That\'s a fair view; I read the data slightly differently.' }),
  R('send-file', 'Send the file', {
    casual: 'Shoot it over.', neutral: 'Can you send me the file?', professional: 'Could you share the file when you have a moment?',
    formal: 'Kindly forward the document at your convenience.', executive: 'Send me the file by EOD.' }),
  R('too-expensive', "That's too expensive", {
    casual: 'Way too pricey.', neutral: 'That\'s more than we budgeted.', professional: 'That\'s above our budget — can we look at the scope?',
    diplomatic: 'I appreciate the quote; the number is a stretch for us. Is there flexibility?', assertive: 'That price doesn\'t work. Here\'s what does.' }),
  R('need-help', 'I need help', {
    casual: 'Can you give me a hand?', neutral: 'I need some help with this.', professional: 'Could I get your input on this?',
    formal: 'I would appreciate your assistance with this matter.', executive: 'I need your eyes on this.' }),
  R('running-late', "I'm running late", {
    casual: 'Running late, sorry!', neutral: 'I\'m running about ten minutes late.', professional: 'Apologies — I\'m running ten minutes behind. I\'ll join shortly.',
    formal: 'Please accept my apologies; I will be delayed by approximately ten minutes.', executive: 'Ten minutes behind. Start without me.' }),
  R('not-finished', "It's not finished", {
    casual: 'Not done yet.', neutral: 'It\'s not finished yet.', professional: 'It\'s still in progress — I\'ll have it done by Friday.',
    formal: 'The work remains in progress; completion is anticipated by Friday.', executive: 'Not done. Friday.' }),
  R('good-idea', "That's a good idea", {
    casual: 'Ooh nice!', neutral: 'That\'s a good idea.', professional: 'I like that approach — let\'s explore it.',
    formal: 'That is a sound suggestion.', executive: 'Good call. Run with it.' }),
  R('cant-attend', "I can't attend", {
    casual: 'Can\'t make it.', neutral: 'I can\'t make that time.', professional: 'I have a conflict at that time — could we reschedule?',
    formal: 'Regrettably, I am unable to attend.', diplomatic: 'I wish I could join — the timing doesn\'t work on my end.' }),
  R('wait', 'Wait', {
    casual: 'Hold on.', neutral: 'Just a second.', professional: 'Please bear with me for a moment.',
    formal: 'Allow me a moment.', executive: 'Pause — let me think.' }),
  R('youre-wrong', "You're wrong", {
    casual: 'Nope, wrong.', neutral: 'I think that\'s not right.', professional: 'I believe there\'s an error here — may I show you?',
    formal: 'I respectfully suggest this may be inaccurate.', diplomatic: 'I see it another way — can I share my read?' }),
  R('hurry-up', 'Hurry up', {
    casual: 'Chop chop!', neutral: 'We need this soon.', professional: 'Could you prioritise this? We\'re up against a deadline.',
    formal: 'Your prompt attention to this would be appreciated.', assertive: 'I need this by 5pm. Non-negotiable.' }),
  R('thats-bad', "That's bad", {
    casual: 'That sucks.', neutral: 'That\'s not good.', professional: 'That\'s a problem — let\'s address it.',
    formal: 'This is a significant concern.', diplomatic: 'That presents some challenges we should discuss.' }),
  R('im-busy', "I'm busy", {
    casual: 'Swamped.', neutral: 'I\'m busy right now.', professional: 'I\'m at capacity today — can we do tomorrow?',
    formal: 'My schedule does not permit this at present.', executive: 'Not today. Book time Thursday.' }),
];
