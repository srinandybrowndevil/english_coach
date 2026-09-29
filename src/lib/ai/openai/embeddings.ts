import OpenAI from 'openai';
import { recordAIEvent } from '../usage';
import type { EmbeddingProvider } from '../types';

const MODEL = 'text-embedding-3-small';

export class OpenAIEmbeddings implements EmbeddingProvider {
  constructor(private client: OpenAI) {}

  async embed(texts: string[]) {
    const start = Date.now();
    try {
      const res = await this.client.embeddings.create({ model: MODEL, input: texts });
      recordAIEvent({
        provider: 'openai', model: MODEL, kind: 'embedding', ms: Date.now() - start,
        inputTokens: res.usage?.total_tokens,
      });
      return res.data.map((d) => d.embedding);
    } catch (err) {
      recordAIEvent({ provider: 'openai', model: MODEL, kind: 'embedding', ms: Date.now() - start, error: String(err) });
      throw err;
    }
  }
}
