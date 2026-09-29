import type { z } from 'zod';

export type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; dataUrl: string }; // §10 picture description; mock providers ignore images
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string | ContentPart[] };
export type Tier = 'frontier' | 'balanced' | 'fast';
export type TokenUsage = { inputTokens?: number; outputTokens?: number };

export interface CompleteRequest {
  system: string;
  messages: ChatMessage[];
  tier: Tier;
  maxTokens?: number;
}

export interface LLMProvider {
  readonly name: string;
  complete(req: CompleteRequest): Promise<{ text: string; usage?: TokenUsage }>;
  stream(req: CompleteRequest): AsyncIterable<string>;
  structured<T>(req: {
    name: string;
    schema: z.ZodType<T>;
    system: string;
    messages: ChatMessage[];
    tier: Tier;
  }): Promise<{ data: T; usage?: TokenUsage; model: string }>;
}

export type WordTiming = { word: string; start: number; end: number };

export interface SpeechToTextProvider {
  transcribe(
    audio: { bytes: Uint8Array; mimeType: string; filename: string },
    opts?: { wordTimestamps?: boolean; prompt?: string },
  ): Promise<{
    text: string;
    words?: WordTiming[];
    durationSeconds?: number;
    model: string;
  }>;
}

export interface TextToSpeechProvider {
  synthesize(
    text: string,
    opts?: { voice?: string; speed?: number; instructions?: string },
  ): Promise<{ bytes: Uint8Array; mimeType: string }>;
}

export interface PronunciationAnalysisProvider {
  analyse(input: {
    transcript: string;
    target: string;
    words?: WordTiming[];
  }): Promise<{
    notes: string[];
    confidence: 'low' | 'medium' | 'high';
    phonemeEvidence: false | { phonemes: string[] };
  }>;
}

export interface EmbeddingProvider {
  embed(texts: string[]): Promise<number[][]>;
}

export interface AIProviders {
  llm: LLMProvider;
  stt: SpeechToTextProvider;
  tts: TextToSpeechProvider;
  pronunciation: PronunciationAnalysisProvider;
  embeddings: EmbeddingProvider;
}
