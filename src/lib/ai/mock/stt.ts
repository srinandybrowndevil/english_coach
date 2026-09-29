import type { SpeechToTextProvider } from '../types';

export class MockSTT implements SpeechToTextProvider {
  // filename containing "timed" returns word timings so rhythm/pause logic is testable
  async transcribe(audio: { bytes: Uint8Array; mimeType: string; filename: string }) {
    const timed = audio.filename?.includes('timed');
    const text = 'I think that this is the third one';
    const words = timed
      ? text.split(' ').map((w, i) => ({ word: w, start: i * 0.4 + (i === 3 ? 2.0 : 0), end: i * 0.4 + 0.3 + (i === 3 ? 2.0 : 0) }))
      : [];
    return { text, words, durationSeconds: timed ? 3.5 : 0.5, model: 'mock-stt' };
  }
}
