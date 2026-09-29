import OpenAI from 'openai';
import { getEnv } from '@/lib/env';
import { recordAIEvent } from '../usage';
import type { TextToSpeechProvider } from '../types';

export class OpenAITTS implements TextToSpeechProvider {
  constructor(private client: OpenAI) {}

  async synthesize(text: string, opts?: { voice?: string; speed?: number; instructions?: string }) {
    const env = getEnv();
    const model = env.TTS_MODEL;
    const start = Date.now();
    try {
      const res = await this.client.audio.speech.create({
        model,
        voice: opts?.voice ?? env.TTS_VOICE,
        input: text,
        instructions: opts?.instructions,
        speed: opts?.speed,
        response_format: 'mp3',
      });
      recordAIEvent({ provider: 'openai', model, kind: 'tts', ms: Date.now() - start });
      return { bytes: new Uint8Array(await res.arrayBuffer()), mimeType: 'audio/mpeg' };
    } catch (err) {
      recordAIEvent({ provider: 'openai', model, kind: 'tts', ms: Date.now() - start, error: String(err) });
      throw err;
    }
  }
}
