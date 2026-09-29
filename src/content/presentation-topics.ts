// spec §28 — 3 topics per mode
export type PresentationTopic = { slug: string; mode: string; title: string; brief: string };

const P = (slug: string, mode: string, title: string, brief: string): PresentationTopic => ({ slug, mode, title, brief });

export const PRESENTATION_TOPICS: PresentationTopic[] = [
  P('pres-self-1', 'self-introduction', 'Introduce yourself in 60 seconds', 'Name, role, one thing you\'re good at, one thing you\'re working on.'),
  P('pres-self-2', 'self-introduction', 'Your professional story', 'Where you started, a turning point, where you\'re headed.'),
  P('pres-self-3', 'self-introduction', 'Introduce yourself to a new team', 'Role, working style, how to work with you.'),
  P('pres-co-1', 'company-introduction', 'Your company in one minute', 'What you do, who for, and why you\'re different.'),
  P('pres-co-2', 'company-introduction', 'Company story for a client', 'Origin, values, two proof points.'),
  P('pres-co-3', 'company-introduction', 'The elevator version', '30 seconds, no jargon, memorable close.'),
  P('pres-product-1', 'product-pitch', 'Pitch your product', 'Problem → solution → proof → ask.'),
  P('pres-product-2', 'product-pitch', 'Feature launch pitch', 'One feature, why it matters, what it changes.'),
  P('pres-product-3', 'product-pitch', 'Demo-day pitch', 'Show the product working while narrating benefits.'),
  P('pres-sales-1', 'sales-presentation', 'Sales deck walkthrough', 'Problem, cost of inaction, solution, pricing logic, next step.'),
  P('pres-sales-2', 'sales-presentation', 'Competitive differentiation', 'Why choose you over the alternative — without bad-mouthing.'),
  P('pres-sales-3', 'sales-presentation', 'Objection pre-emption', 'Address the three biggest objections before they\'re raised.'),
  P('pres-tech-1', 'technical-presentation', 'Explain a technical system', 'Architecture to a mixed audience — accurate but accessible.'),
  P('pres-tech-2', 'technical-presentation', 'Incident postmortem', 'What happened, why, what changes — blame-free.'),
  P('pres-tech-3', 'technical-presentation', 'Technical decision review', 'Options considered, trade-offs, the decision.'),
  P('pres-investor-1', 'investor-pitch', 'Two-minute investor pitch', 'Problem, market, traction, ask.'),
  P('pres-investor-2', 'investor-pitch', 'Traction update', 'Numbers first, narrative second.'),
  P('pres-investor-3', 'investor-pitch', 'Vision pitch', 'Where the market is going and why you win it.'),
  P('pres-team-1', 'team-briefing', 'Weekly team briefing', 'Status, priorities, blockers — five minutes.'),
  P('pres-team-2', 'team-briefing', 'Priority change announcement', 'What changes, why, what stays the same.'),
  P('pres-team-3', 'team-briefing', 'Post-mortem briefing', 'What we learned from the last sprint.'),
  P('pres-conf-1', 'conference-talk', 'Lessons-learned talk', 'Three lessons from a real project, with stories.'),
  P('pres-conf-2', 'conference-talk', 'How-we-built-it talk', 'Technical journey with one clear takeaway.'),
  P('pres-conf-3', 'conference-talk', 'Industry opinion talk', 'A position you can defend, with evidence.'),
  P('pres-imp-1', 'impromptu', 'One minute: a book that changed how you work', 'No prep. Structure on the fly.'),
  P('pres-imp-2', 'impromptu', 'One minute: defend or attack remote work', 'Pick a side instantly and commit.'),
  P('pres-imp-3', 'impromptu', 'Two minutes: teach the room something simple', 'Any skill, taught clearly on zero prep.'),
];
