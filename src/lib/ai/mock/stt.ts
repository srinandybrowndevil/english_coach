import type { SpeechToTextProvider } from '../types';

export class MockSTT implements SpeechToTextProvider {
  async transcribe() {
    return { text: '[mock transcript]', words: [], durationSeconds: 0.5, model: 'mock-stt' };
  }
}
