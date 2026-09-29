import OpenAI from 'openai';
import { getEnv } from '@/lib/env';
import { recordAIEvent } from '../usage';
import type { SpeechToTextProvider, WordTiming } from '../types';

export class OpenAISTT implements SpeechToTextProvider {
  constructor(private client: OpenAI) {}

  async transcribe(
    audio: { bytes: Uint8Array; mimeType: string; filename: string },
    opts?: { wordTimestamps?: boolean; prompt?: string },
  ) {
    const env = getEnv();
    const file = new File([audio.bytes as unknown as BlobPart], audio.filename, { type: audio.mimeType });
    const start = Date.now();

    // Word timestamps only supported on whisper-1 (Appendix A).
    if (opts?.wordTimestamps) {
      const model = env.STT_TIMESTAMP_MODEL;
      try {
        const res = await this.client.audio.transcriptions.create({
          file, model, response_format: 'verbose_json',
          timestamp_granularities: ['word'], prompt: opts.prompt,
        });
        recordAIEvent({ provider: 'openai', model, kind: 'stt', ms: Date.now() - start });
        const r = res as { text: string; words?: WordTiming[]; duration?: number };
        return { text: r.text, words: r.words ?? [], durationSeconds: r.duration, model };
      } catch (err) {
        recordAIEvent({ provider: 'openai', model, kind: 'stt', ms: Date.now() - start, error: String(err) });
        throw err;
      }
    }

    const model = env.STT_MODEL;
    try {
      const res = await this.client.audio.transcriptions.create({
        file, model, response_format: 'json', prompt: opts?.prompt,
      });
      recordAIEvent({ provider: 'openai', model, kind: 'stt', ms: Date.now() - start });
      return { text: res.text, model };
    } catch (err) {
      recordAIEvent({ provider: 'openai', model, kind: 'stt', ms: Date.now() - start, error: String(err) });
      throw err;
    }
  }
}
