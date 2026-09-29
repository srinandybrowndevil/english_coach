// spec §29 public-speaking techniques with drill
export type SpeakingTechnique = { slug: string; technique: string; explanation: string; drill: string };

const T = (slug: string, technique: string, explanation: string, drill: string): SpeakingTechnique =>
  ({ slug, technique, explanation, drill });

export const PUBLIC_SPEAKING: SpeakingTechnique[] = [
  T('breath-control', 'Breath control', 'Speak from the diaphragm; a steady breath steadies the voice and prevents trailing off.', 'Take a 4-second breath, then read a paragraph aloud on one slow exhale.'),
  T('pausing', 'Pausing', 'A pause after a key line gives it weight and gives you time to think. Silence is a tool, not a failure.', 'Deliver a short pitch; pause a full beat after each key sentence.'),
  T('emphasis', 'Emphasis', 'Stressing the right word changes meaning: "I didn\'t say he STOLE it."', 'Say "I never said that" stressing each word in turn; note how meaning shifts.'),
  T('pacing', 'Pacing', 'Nervous speakers rush. Deliberately slow at the start; vary pace for tension and relief.', 'Read a paragraph at half speed, then normal, keeping clarity.'),
  T('voice-modulation', 'Voice modulation', 'Monotone loses rooms. Vary pitch for questions, statements, contrasts.', 'Read a product pitch marking three words to pitch up and three to drop.'),
  T('storytelling', 'Storytelling', 'Structure: situation → tension → resolution. Open in the middle of the action.', 'Tell a real work incident in 60 seconds starting mid-action.'),
  T('hooks', 'Hooks', 'First line earns the next thirty seconds: a question, a surprising fact, a bold claim.', 'Write and deliver three different openings for the same talk.'),
  T('transitions', 'Transitions', 'Signpost movement: "Here\'s the second reason…", "Now the part nobody expects."', 'Give a three-point answer with explicit transitions between each point.'),
  T('analogies', 'Analogies', 'The unfamiliar explained by the familiar; the fastest route to "ah, got it".', 'Explain your job to a ten-year-old using one analogy.'),
  T('rhetorical-questions', 'Rhetorical questions', 'Questions pull the audience into your argument without needing an answer.', 'Insert a rhetorical question before each section of a 1-minute talk.'),
  T('audience-framing', 'Audience framing', 'Same content, different frame: executives get outcomes, engineers get architecture.', 'Present one project update twice — once for a CEO, once for your team.'),
  T('memorable-endings', 'Memorable endings', 'End on the ask, the image, or the callback to your opening — never "so yeah, that\'s it".', 'Write three endings for the same talk and deliver the strongest.'),
  T('handling-interruptions', 'Handling interruptions', 'Acknowledge, answer or park: "Great question — two slides ahead covers it."', 'Practise responses to mid-talk interruptions without losing your thread.'),
  T('handling-questions', 'Handling questions', 'Restate the question for the room, answer briefly, bridge back to your message.', 'Have someone ask hostile questions; practise restate + answer + bridge.'),
];
