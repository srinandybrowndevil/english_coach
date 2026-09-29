// spec §25 — 17 writing modes. weightOverrides feed src/lib/scoring/writing.ts dims.
export type WritingMode = {
  slug: string; mode: string; prompt: string; audience: string; register: string;
  weightOverrides: Record<string, number>;
};

const BASE: Record<string, number> = { grammar: 0.2, clarity: 0.15, coherence: 0.15, structure: 0.1, vocabulary: 0.1, naturalness: 0.1, register: 0.1, conciseness: 0.05, mechanics: 0.05 };
const W = (slug: string, mode: string, prompt: string, audience: string, register: string, over: Record<string, number> = {}): WritingMode =>
  ({ slug, mode, prompt, audience, register, weightOverrides: { ...BASE, ...over } });

export const WRITING_MODES: WritingMode[] = [
  W('w-sentence', 'Sentence writing', 'Write three correct sentences about your day.', 'Self', 'neutral'),
  W('w-paragraph', 'Paragraph writing', 'One paragraph: describe a problem you solved at work.', 'Colleague', 'neutral', { structure: 0.2, clarity: 0.2 }),
  W('w-journal', 'Journal writing', 'Write honestly about today — what happened, how you felt, what you learned.', 'Self', 'casual', { naturalness: 0.15, vocabulary: 0.15 }),
  W('w-professional-email', 'Professional email', 'Email a client rescheduling tomorrow\'s demo to Thursday.', 'Client', 'professional', { register: 0.2, clarity: 0.2 }),
  W('w-formal-email', 'Formal email', 'Write to a government office requesting a certificate correction.', 'Official', 'formal', { register: 0.25, structure: 0.15 }),
  W('w-casual-message', 'Casual message', 'WhatsApp a friend to cancel Saturday plans.', 'Friend', 'casual', { naturalness: 0.25, grammar: 0.15 }),
  W('w-social-post', 'Social media post', 'LinkedIn post announcing you shipped a feature.', 'Professional network', 'professional', { conciseness: 0.15, naturalness: 0.15 }),
  W('w-complaint', 'Complaint letter', 'Write a firm but fair complaint about a failed delivery.', 'Vendor', 'formal', { register: 0.2, structure: 0.15 }),
  W('w-appreciation', 'Appreciation message', 'Thank a teammate who covered for you during a crunch.', 'Colleague', 'neutral', { naturalness: 0.25 }),
  W('w-apology', 'Apology message', 'Apologise to a client for missing the weekly update call.', 'Client', 'professional', { register: 0.2, clarity: 0.2 }),
  W('w-proposal', 'Proposal', 'Write a one-page proposal for a three-month engagement.', 'Prospective client', 'formal', { structure: 0.2, register: 0.15 }),
  W('w-executive-summary', 'Executive summary', 'Summarise a 20-page report into five sentences for the CEO.', 'Executive', 'executive', { conciseness: 0.25, clarity: 0.2 }),
  W('w-report', 'Report', 'Write a quarterly progress report for stakeholders.', 'Stakeholders', 'formal', { structure: 0.2, coherence: 0.2 }),
  W('w-meeting-summary', 'Meeting summary', 'Summarise this week\'s status meeting: decisions, actions, owners.', 'Team', 'professional', { structure: 0.2, conciseness: 0.15 }),
  W('w-cover-letter', 'Cover letter / application', 'Apply for a senior engineer role — one page.', 'Hiring manager', 'formal', { register: 0.2 }),
  W('w-chat', 'Chat & messaging', 'Answer five typical work-chat messages: status request, quick question, request for help, delay notice, thank-you.', 'Colleagues', 'professional casual', { naturalness: 0.2, conciseness: 0.15 }),
  W('w-rewrite', 'Rewrite practice', 'Take yesterday\'s journal entry and rewrite it correcting every error.', 'Self', 'neutral', { grammar: 0.25, mechanics: 0.1 }),
];
