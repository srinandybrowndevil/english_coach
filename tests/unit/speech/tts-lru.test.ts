process.env.ALLOWED_EMAIL ??= 'learner@example.com';
process.env.AUTH_SECRET ??= 'x'.repeat(32);
process.env.PGLITE_DIR = 'memory://';

import { describe, expect, it } from 'vitest';
import { SpeechService, ttsCacheClear, ttsCacheSize } from '@/server/services/speech';

// SpeechService.synthesize only touches `db` on the audio-persist paths.
const svc = new SpeechService(null as never);

describe('TTS in-memory LRU', () => {
  it('caps at 50 entries and caches repeats', async () => {
    ttsCacheClear();
    await svc.synthesize('hello');
    expect(ttsCacheSize()).toBe(1);
    const again = await svc.synthesize('hello');
    expect(ttsCacheSize()).toBe(1);
    expect(again.mimeType).toBe('audio/wav');
    for (let i = 0; i < 60; i++) await svc.synthesize(`text ${i}`);
    expect(ttsCacheSize()).toBe(50);
  });
});
