import type { TextToSpeechProvider } from '../types';

/** 0.5s of 16-bit mono PCM silence at 8kHz with a valid 44-byte WAV header. */
export function silentWav(): Uint8Array {
  const rate = 8000;
  const dataLen = rate / 2 * 2; // samples * 2 bytes
  const buf = new ArrayBuffer(44 + dataLen);
  const v = new DataView(buf);
  const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + dataLen, true); w(8, 'WAVE');
  w(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, 'data'); v.setUint32(40, dataLen, true);
  return new Uint8Array(buf);
}

export class MockTTS implements TextToSpeechProvider {
  async synthesize() {
    return { bytes: silentWav(), mimeType: 'audio/wav' };
  }
}
