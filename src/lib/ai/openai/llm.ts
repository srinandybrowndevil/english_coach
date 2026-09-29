import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { z } from 'zod';
import { getEnv } from '@/lib/env';
import { recordAIEvent } from '../usage';
import type { CompleteRequest, LLMProvider, Tier } from '../types';

function modelFor(tier: Tier): string {
  const env = getEnv();
  return tier === 'frontier'
    ? env.AI_MODEL_FRONTIER
    : tier === 'balanced'
      ? env.AI_MODEL_BALANCED
      : env.AI_MODEL_FAST;
}

// Responses API: non-system messages become `input`, system becomes `instructions`.
function toParams(req: CompleteRequest) {
  return {
    model: modelFor(req.tier),
    instructions: req.system,
    input: req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: Array.isArray(m.content)
          ? m.content.map((p) =>
              p.type === 'image'
                ? { type: 'input_image' as const, image_url: p.dataUrl, detail: 'auto' as const }
                : { type: 'input_text' as const, text: p.text })
          : m.content,
      })),
    ...(req.maxTokens ? { max_output_tokens: req.maxTokens } : {}),
  };
}

export class OpenAILLM implements LLMProvider {
  readonly name = 'openai';
  constructor(private client: OpenAI) {}

  async complete(req: CompleteRequest) {
    const start = Date.now();
    const params = toParams(req);
    try {
      const res = await this.client.responses.create(params);
      const usage = {
        inputTokens: res.usage?.input_tokens,
        outputTokens: res.usage?.output_tokens,
      };
      recordAIEvent({ provider: this.name, model: params.model, kind: 'complete', ms: Date.now() - start, ...usage });
      return { text: res.output_text, usage };
    } catch (err) {
      recordAIEvent({ provider: this.name, model: params.model, kind: 'complete', ms: Date.now() - start, error: String(err) });
      throw err;
    }
  }

  async *stream(req: CompleteRequest): AsyncIterable<string> {
    const params = toParams(req);
    const stream = this.client.responses.stream(params);
    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') yield event.delta;
    }
    const final = await stream.finalResponse();
    recordAIEvent({
      provider: this.name, model: params.model, kind: 'stream', ms: 0,
      inputTokens: final.usage?.input_tokens, outputTokens: final.usage?.output_tokens,
    });
  }

  async structured<T>(req: {
    name: string;
    schema: z.ZodType<T>;
    system: string;
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    tier: Tier;
  }) {
    const start = Date.now();
    const params = {
      ...toParams({ system: req.system, messages: req.messages, tier: req.tier }),
      text: { format: zodTextFormat(req.schema, req.name) },
    };
    try {
      const res = await this.client.responses.parse(params);
      const usage = {
        inputTokens: res.usage?.input_tokens,
        outputTokens: res.usage?.output_tokens,
      };
      recordAIEvent({ provider: this.name, model: params.model, kind: 'structured', ms: Date.now() - start, ...usage });
      return { data: res.output_parsed as T, usage, model: params.model };
    } catch (err) {
      recordAIEvent({ provider: this.name, model: params.model, kind: 'structured', ms: Date.now() - start, error: String(err) });
      throw err;
    }
  }
}
