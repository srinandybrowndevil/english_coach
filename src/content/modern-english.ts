// spec §22 — current conversational English, with dating risk noted.
export type ModernExpr = { slug: string; expression: string; meaning: string; context: string; register: string; potentiallyDated: boolean; saferAlternative: string; example: string };

const M = (slug: string, expression: string, meaning: string, context: string, register: string, potentiallyDated: boolean, saferAlternative: string, example: string): ModernExpr =>
  ({ slug, expression, meaning, context, register, potentiallyDated, saferAlternative, example });

export const MODERN_ENGLISH: ModernExpr[] = [
  M('me-bet', 'bet', 'agreed / yes', 'casual agreement', 'casual', false, 'sure / agreed', '— Can you review it today? — Bet.'),
  M('me-slay', 'slay', 'do extremely well', 'hype/compliment', 'casual', true, 'nailed it', 'You slayed that demo.'),
  M('me-irl', 'IRL', 'in real life', 'online vs offline', 'casual', false, 'in person', 'We met IRL at the conference.'),
  M('me-lowkey', 'lowkey', 'quietly / slightly', 'soft opinion', 'casual', true, 'to be honest', 'I lowkey prefer the old design.'),
  M('me-highkey', 'highkey', 'obviously / strongly', 'emphasis', 'casual', true, 'honestly', 'I highkey love this feature.'),
  M('me-no-cap', 'no cap', 'no lie / seriously', 'emphasis of truth', 'casual', true, 'seriously', 'That pitch was perfect, no cap.'),
  M('me-vibe', 'vibe', 'the feeling/atmosphere', 'general mood', 'casual', false, 'the feel', 'The meeting had a good vibe.'),
  M('me-hits-different', 'hits different', 'feels unusually good/strong', 'praise', 'casual', true, 'feels special', 'First client win hits different.'),
  M('me-understood-assignment', 'understood the assignment', 'did exactly what was needed', 'praise', 'casual', true, 'nailed the brief', 'The designer understood the assignment.'),
  M('me-core-memory', 'core memory', 'an unforgettable moment', 'nostalgia/humour', 'casual', true, 'unforgettable', 'That launch party is a core memory.'),
  M('me-main-character', 'main character energy', 'acting confidently like the star', 'confidence', 'casual', true, 'confident energy', 'Walk into the pitch with main character energy.'),
  M('me-touch-grass', 'touch grass', 'disconnect from screens', 'burnout humour', 'casual', true, 'get outside / take a break', 'You\'ve been debugging for 12 hours — go touch grass.'),
  M('me-rent-free', 'rent-free', 'can\'t stop thinking about it', 'humorous obsession', 'casual', true, 'stuck in my head', 'That bug lives rent-free in my head.'),
  M('me-cooked', 'cooked', 'exhausted or doomed', 'burnout humour', 'casual', true, 'exhausted', 'I\'m cooked after that release.'),
  M('me-ate', 'ate', 'did excellently', 'praise', 'casual', true, 'crushed it', 'She ate that presentation.'),
  M('me-its-giving', 'it\'s giving', 'it gives the vibe of', 'impression', 'casual', true, 'it feels like', 'The new landing page — it\'s giving premium.'),
  M('me-chronic-online', 'terminally online', 'too absorbed in internet culture', 'self-deprecating', 'casual', true, 'too online', 'I\'m terminally online, I saw the meme already.'),
  M('me-say-less', 'say less', 'I understand, no more explanation needed', 'quick agreement', 'casual', true, 'got it', '— Can you handle the demo? — Say less.'),
  M('me-w', 'W', 'a win', 'quick praise', 'casual', true, 'a win', 'Renewal signed — huge W.'),
  M('me-l', 'take the L', 'accept the loss', 'admitting defeat', 'casual', true, 'accept the loss', 'We took the L on that bid.'),
  M('me-cringe', 'cringe', 'embarrassing', 'criticism', 'casual', false, 'awkward', 'That corporate hashtag is a bit cringe.'),
  M('me-due-diligence', 'do the work', 'put in effort; also therapy-speak', 'effort framing', 'casual', false, 'put in the effort', 'Nobody wants to do the work of learning fundamentals.'),
  M('me-brainrot', 'brainrot', 'content so addictive it numbs you', 'internet humour', 'casual', true, 'mindless scrolling', 'I watched brainrot for an hour instead of practising.'),
  M('me-locked-in', 'locked in', 'fully focused', 'deep work', 'casual', true, 'focused', 'I\'m locked in on the proposal today.'),
  M('me-align', 'circle back', 'return to a topic later', 'workplace', 'professional', false, 'revisit', 'Let\'s circle back on pricing next week.'),
];
