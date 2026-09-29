import OpenAI from 'openai';
import { getEnv } from '@/lib/env';
import type { AIProviders } from './types';
import { OpenAILLM } from './openai/llm';
import { OpenAISTT } from './openai/stt';
import { OpenAITTS } from './openai/tts';
import { OpenAIPronunciation } from './openai/pronunciation';
import { OpenAIEmbeddings } from './openai/embeddings';
import { MockLLM } from './mock/llm';
import { MockSTT } from './mock/stt';
import { MockTTS } from './mock/tts';
import { MockPronunciation, MockEmbeddings } from './mock/providers';

const g = globalThis as unknown as { __ai?: AIProviders };

export function isMockAI(): boolean {
  return !getEnv().OPENAI_API_KEY;
}

export function getAI(): AIProviders {
  if (g.__ai) return g.__ai;
  if (isMockAI()) {
    g.__ai = {
      llm: new MockLLM(),
      stt: new MockSTT(),
      tts: new MockTTS(),
      pronunciation: new MockPronunciation(),
      embeddings: new MockEmbeddings(),
    };
    return g.__ai;
  }
  const client = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  const llm = new OpenAILLM(client);
  g.__ai = {
    llm,
    stt: new OpenAISTT(client),
    tts: new OpenAITTS(client),
    pronunciation: new OpenAIPronunciation(llm),
    embeddings: new OpenAIEmbeddings(client),
  };
  return g.__ai;
}
