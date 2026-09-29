import { z } from 'zod';

const envSchema = z.object({
  ALLOWED_EMAIL: z.email(),
  AUTH_SECRET: z.string().min(32),
  APP_URL: z.url().default('http://localhost:3000'),
  DATABASE_URL: z.string().optional(),
  PGLITE_DIR: z.string().default('./.data/pglite'),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().optional(),
  AI_MODEL_FRONTIER: z.string().default('gpt-6-astra'),
  AI_MODEL_BALANCED: z.string().default('gpt-6.1-sol'),
  AI_MODEL_FAST: z.string().default('gpt-6-luna'),
  STT_MODEL: z.string().default('gpt-transcribe'),
  STT_TIMESTAMP_MODEL: z.string().default('whisper-1'),
  TTS_MODEL: z.string().default('gpt-4o-mini-tts'),
  TTS_VOICE: z.string().default('alloy'),
  AUDIO_STORAGE_DIR: z.string().default('./.data/audio'),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) cached = envSchema.parse(process.env);
  return cached;
}

/** Test hook: re-parse process.env on next getEnv() call. */
export function resetEnvCache(): void {
  cached = null;
}
