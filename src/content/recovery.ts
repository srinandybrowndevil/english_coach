// spec §34 — conversation recovery phrases and drills.
export type RecoveryItem = { slug: string; purpose: string; phrases: string[]; drill: string };

const R = (slug: string, purpose: string, phrases: string[], drill: string): RecoveryItem => ({ slug, purpose, phrases, drill });

export const RECOVERY: RecoveryItem[] = [
  R('word-lost', 'word retrieval failure',
    ['What\'s the word…', 'It\'s like a…', 'The thing you use to…', 'What I mean is…', 'How do I put this…'],
    'Describe a word you can\'t recall until the listener guesses it — twice a day.'),
  R('grammar-slip', 'self-correction mid-sentence',
    ['Sorry, what I meant was…', 'Let me rephrase that.', 'I mean, more precisely…', 'Actually — let me say that again properly.'],
    'Record yourself talking for 2 min; catch and repair every slip out loud.'),
  R('didnt-understand', 'you didn\'t understand them',
    ['Sorry, I didn\'t catch that — could you say it again?', 'Just so I understand correctly…', 'When you say X, do you mean Y?', 'Could you break that down for me?'],
    'During any call, ask one clarification question — never pretend you understood.'),
  R('need-thinking-time', 'buy time to think',
    ['That\'s a good question.', 'Let me think about that for a second.', 'Hmm, let me look at it another way.', 'So what you\'re really asking is…'],
    'Answer every question today with a 2-second pause + one bridge phrase.'),
  R('check-understanding', 'check they understood you',
    ['Does that make sense?', 'Am I explaining this clearly?', 'Should I explain that differently?', 'What do you think so far?'],
    'After any explanation, ask one check-back question instead of continuing.'),
  R('restart', 'restart a broken answer',
    ['Let me start over.', 'Actually, let me simplify that.', 'Forget that — here\'s the shorter version.', 'That came out wrong; here\'s what I meant.'],
    'Deliberately start a sentence badly, then repair it smoothly — 5 reps.'),
  R('redirect', 'redirect off-topic',
    ['That\'s a great point — let me come back to it.', 'Can we park that for a second?', 'Before I answer, let me finish this thought.', 'I want to answer that properly — give me two minutes on this first.'],
    'In your next meeting, practise parking a tangential question politely.'),
];
