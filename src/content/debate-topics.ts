// spec §30 — AI takes a position; learner responds; AI challenges reasoning.
export type DebateTopic = { slug: string; topic: string; aiPosition: string; difficulty: number };

const D = (slug: string, topic: string, aiPosition: string, difficulty = 3): DebateTopic => ({ slug, topic, aiPosition, difficulty });

export const DEBATE_TOPICS: DebateTopic[] = [
  D('deb-remote', 'Remote vs office work', 'Office work produces better collaboration and faster growth.', 2),
  D('deb-ai-jobs', 'AI and employment', 'AI will eliminate more jobs than it creates this decade.', 3),
  D('deb-degree', 'University degrees', 'A degree is still worth more than self-taught skill.', 3),
  D('deb-startup-corporate', 'Startup vs corporate career', 'Early-career developers grow faster in corporates than startups.', 3),
  D('deb-social-media', 'Social media', 'Social media has done more harm than good to public discourse.', 2),
  D('deb-open-source', 'Open source', 'Building on open source is always better than building in-house.', 3),
  D('deb-meetings', 'Meetings', 'Most meetings should be replaced by async writing.', 2),
  D('deb-electric', 'Electric vehicles', 'EVs will fully replace petrol vehicles within 15 years.', 3),
  D('deb-coding-tests', 'Coding interviews', 'Live coding interviews are a poor measure of engineering ability.', 2),
  D('deb-crypto', 'Cryptocurrency', 'Cryptocurrency is a genuine innovation, not a bubble.', 4),
  D('deb-education', 'Online education', 'Online learning can fully replace classroom education.', 3),
  D('deb-vegan', 'Diet choices', 'A plant-based diet is the ethical default.', 4),
  D('deb-space', 'Space exploration', 'Public money should fund healthcare before space programmes.', 3),
  D('deb-four-day', 'Four-day week', 'A four-day week improves productivity without costing output.', 2),
  D('deb-tech-regulation', 'Tech regulation', 'Big tech needs stricter government regulation.', 4),
  D('deb-cashless', 'Cashless society', 'A fully cashless economy is a good goal.', 3),
  D('deb-generalist', 'Generalist vs specialist', 'Specialists beat generalists in a tech career.', 3),
  D('deb-notifications', 'Attention economy', 'App notifications should be opt-in, not opt-out.', 2),
  D('deb-english-global', 'English dominance', 'English\'s global dominance harms linguistic diversity.', 4),
  D('deb-outsource', 'Outsourcing', 'Outsourcing core engineering is a false economy.', 3),
  D('deb-agi', 'AGI timelines', 'AGI is decades away, not years.', 5),
  D('deb-gig', 'Gig economy', 'Gig work exploits more than it liberates.', 3),
  D('deb-data', 'Data privacy', 'Personal data should be treated as personal property.', 4),
  D('deb-video', 'Video vs text documentation', 'Written docs beat video for technical knowledge.', 2),
];
