import { z } from 'zod';
import type { LLMProvider, PronunciationAnalysisProvider } from '../types';

const notesSchema = z.object({ notes: z.array(z.string()) });

// Transcript-only analysis. §52: never fabricate phoneme scores — confidence is
// always 'low' and phonemeEvidence is false.
export class OpenAIPronunciation implements PronunciationAnalysisProvider {
  constructor(private llm: LLMProvider) {}

  async analyse(input: { transcript: string; target: string }) {
    const { data } = await this.llm.structured({
      name: 'pronunciation_notes',
      schema: notesSchema,
      system:
        'You analyse pronunciation evidence for an English learner. You only have the transcript of what the learner said versus the target text — never invent phoneme-level claims. Report only observable mismatches (wrong/missing/substituted words) and articulation hints worth checking.',
      messages: [
        { role: 'user', content: `Target: ${input.target}\nTranscript: ${input.transcript}` },
      ],
      tier: 'balanced',
    });
    return { notes: data.notes, confidence: 'low' as const, phonemeEvidence: false as const };
  }
}
