import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { MockLLM } from '@/lib/ai/mock/llm';
import { silentWav } from '@/lib/ai/mock/tts';
import { MockResponderMissing, registerMockResponder } from '@/lib/ai/mock/responders';

describe('MockLLM.structured', () => {
  const schema = z.object({ notes: z.array(z.string()) });
  const llm = new MockLLM();

  it('validates responder output with zod', async () => {
    registerMockResponder('pronunciation_notes', () => ({ notes: ['test note'] }));
    const res = await llm.structured({
      name: 'pronunciation_notes', schema, system: '', messages: [], tier: 'fast',
    });
    expect(res.data.notes).toEqual(['test note']);
  });

  it('throws MockResponderMissing for unknown names', async () => {
    await expect(
      llm.structured({ name: 'nope', schema, system: '', messages: [], tier: 'fast' }),
    ).rejects.toBeInstanceOf(MockResponderMissing);
  });

  it('rejects responder output that fails the schema', async () => {
    registerMockResponder('bad', () => ({ wrong: 1 }));
    await expect(
      llm.structured({ name: 'bad', schema, system: '', messages: [], tier: 'fast' }),
    ).rejects.toThrow();
  });
});

describe('MockTTS', () => {
  it('returns a WAV buffer with a RIFF header', () => {
    const wav = silentWav();
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.slice(8, 12))).toBe('WAVE');
    expect(wav.length).toBe(44 + 8000); // 0.5s * 8000Hz * 2 bytes
  });
});
