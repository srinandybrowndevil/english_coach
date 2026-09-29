import type { z } from 'zod';
import type { LLMProvider } from '../types';
import { getMockResponder } from './responders';

const MODEL = 'mock-llm';

export class MockLLM implements LLMProvider {
  readonly name = 'mock';

  async complete() {
    return { text: '[mock tutor] Good effort — keep going.', usage: { inputTokens: 0, outputTokens: 0 } };
  }

  async *stream(): AsyncIterable<string> {
    yield '[mock tutor] Good effort — keep going.';
  }

  async structured<T>(req: {
    name: string;
    schema: z.ZodType<T>;
    system: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    tier: 'frontier' | 'balanced' | 'fast';
  }) {
    const raw = getMockResponder(req.name)(req.messages);
    return { data: req.schema.parse(raw), model: MODEL };
  }
}
