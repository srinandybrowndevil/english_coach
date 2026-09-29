import { afterEach, describe, expect, it } from 'vitest';
import { getEnv, resetEnvCache } from '@/lib/env';

const BASE = {
  ALLOWED_EMAIL: 'learner@example.com',
  AUTH_SECRET: 'x'.repeat(32),
};

afterEach(() => {
  resetEnvCache();
  delete process.env.ALLOWED_EMAIL;
  delete process.env.AUTH_SECRET;
});

describe('env', () => {
  it('fails when ALLOWED_EMAIL is missing', () => {
    process.env.AUTH_SECRET = BASE.AUTH_SECRET;
    expect(() => getEnv()).toThrow();
  });

  it('applies defaults', () => {
    Object.assign(process.env, BASE);
    const env = getEnv();
    expect(env.APP_URL).toBe('http://localhost:3000');
    expect(env.PGLITE_DIR).toBe('./.data/pglite');
    expect(env.AI_MODEL_FRONTIER).toBe('gpt-6-astra');
    expect(env.TTS_VOICE).toBe('alloy');
    expect(env.OPENAI_API_KEY).toBeUndefined();
  });

  it('rejects a short AUTH_SECRET', () => {
    process.env.ALLOWED_EMAIL = BASE.ALLOWED_EMAIL;
    process.env.AUTH_SECRET = 'short';
    expect(() => getEnv()).toThrow();
  });
});
