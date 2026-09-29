// spec §15 listening modes — structure + accent labels.
export type ListeningMode = { slug: string; mode: string; description: string; structure: string[]; accents: string[]; speedLevels: number[] };

const L = (slug: string, mode: string, description: string, structure: string[], accents: string[], speedLevels: number[]): ListeningMode =>
  ({ slug, mode, description, structure, accents, speedLevels });

export const LISTENING_MODES: ListeningMode[] = [
  L('listen-conversation', 'Conversation comprehension', 'Two speakers, natural informal dialogue with fillers and interruptions.', ['setup', 'main exchange', 'comprehension questions', 'transcript reveal'], ['General American', 'Modern British', 'Indian English'], [0.8, 1.0, 1.15]),
  L('listen-phone', 'Phone call', 'Voice-only call with a task: booking, complaint, or inquiry.', ['greeting', 'request', 'details exchange', 'confirmation', 'comprehension questions'], ['General American', 'Modern British', 'International business'], [0.9, 1.0, 1.2]),
  L('listen-presentation', 'Presentation / talk', 'Short structured talk; capture structure and key numbers.', ['hook', 'three points', 'conclusion', 'note-taking task'], ['General American', 'Modern British'], [0.9, 1.0, 1.15]),
  L('listen-business-meeting', 'Business meeting', 'Meeting excerpt with decisions, disagreements, action items.', ['agenda item', 'discussion', 'decision', 'action items', 'comprehension questions'], ['International business English', 'General American'], [1.0, 1.15]),
  L('listen-accent-exposure', 'Accent exposure', 'Same sentence/content across accent varieties.', ['model sentence', 'accent A', 'accent B', 'accent C', 'shadowing'], ['Indian English', 'General American', 'Modern British', 'Australian', 'International business English'], [1.0]),
  L('listen-fast-speech', 'Fast connected speech', 'Natural 1.15–1.3x speech with weak forms and linking.', ['full-speed play', 'slowed breakdown', 'connected-speech explanation', 're-listen', 'transcript'], ['General American', 'Modern British'], [1.15, 1.3]),
  L('listen-inference', 'Inference & implied meaning', 'Hear what is meant but not said; tone and intent.', ['scenario audio', 'what is implied?', 'tone analysis', 'feedback'], ['General American', 'Modern British'], [1.0, 1.15]),
  L('listen-vocab-context', 'Vocabulary in context', 'New words embedded in natural speech; guess meaning before reveal.', ['audio', 'guess the word', 'reveal + drill'], ['International business English'], [0.9, 1.0]),
  L('listen-dictation', 'Dictation', 'Transcribe exactly what you hear, sentence by sentence.', ['sentence audio', 'learner types', 'diff against transcript', 'error feedback'], ['General American', 'Modern British'], [0.8, 1.0]),
  L('listen-speech-repetition', 'Speech repetition', 'Hear once, repeat verbatim — builds working memory.', ['audio', 'repeat', 'comparison', 'retry'], ['General American'], [1.0, 1.15]),
  L('listen-news', 'News & current affairs', 'Broadcast register, names, numbers, causes.', ['headline', 'report', 'comprehension questions'], ['Modern British', 'General American', 'International'], [1.0, 1.15]),
  L('listen-podcast', 'Podcast discussion', 'Unscripted multi-speaker talk with overlap.', ['segment', 'who said what?', 'summary task'], ['General American', 'Modern British'], [1.0, 1.15, 1.3]),
];
