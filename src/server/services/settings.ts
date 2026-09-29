import { eq } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from '@/lib/db/client';
import { userSettings } from '@/lib/db/schema';
import { getEnv } from '@/lib/env';

// spec §70 — settings are merged with these defaults; unknown keys dropped.
const TutorSettings = z.object({
  tutorMode: z.string().default('friendly_coach'),
  correctionMode: z.string().default('balanced'),
  explanationLanguage: z.string().default('english_with_tamil_support'),
  register: z.string().default('professional'),
  difficulty: z.number().int().min(1).max(5).default(3),
  tamilEnabled: z.boolean().default(true),
  englishOnly: z.boolean().default(false),
  autoPlayTts: z.boolean().default(true),
});
const VoiceSettings = z.object({
  ttsVoice: z.string().default(() => getEnv().TTS_VOICE),
  playbackSpeed: z.number().min(0.5).max(2).default(1),
  autoFinishOnSilence: z.boolean().default(false),
  preferredInputDeviceId: z.string().nullable().default(null),
});
const LearningSettings = z.object({
  dailyTargetMinutes: z.number().int().min(5).max(240).default(45),
  quickModeMinutes: z.number().int().min(5).max(60).default(15),
  trainingDays: z.array(z.number().int().min(0).max(6)).default([0, 1, 2, 3, 4, 5, 6]),
});
const PrivacySettings = z.object({
  audioRetention: z.enum(['off', '7d', '30d']).default('off'),
});
export const SettingsSchema = z.object({
  tutor: TutorSettings,
  voice: VoiceSettings,
  learning: LearningSettings,
  privacy: PrivacySettings,
});
export type Settings = z.infer<typeof SettingsSchema>;

const PatchSchema = z.object({
  tutor: TutorSettings.partial().optional(),
  voice: VoiceSettings.partial().optional(),
  learning: LearningSettings.partial().optional(),
  privacy: PrivacySettings.partial().optional(),
});
export type SettingsPatch = z.infer<typeof PatchSchema>;

export class SettingsService {
  constructor(private db: Db) {}

  async get(userId: string): Promise<Settings> {
    const row = await this.db.query.userSettings.findFirst({ where: eq(userSettings.learnerId, userId) });
    return SettingsSchema.parse({
      tutor: row?.tutor ?? {}, voice: row?.voice ?? {},
      learning: row?.learning ?? {}, privacy: row?.privacy ?? {},
    });
  }

  async update(userId: string, patch: SettingsPatch): Promise<Settings> {
    const parsed = PatchSchema.parse(patch);
    const current = await this.get(userId);
    const next = {
      tutor: { ...current.tutor, ...parsed.tutor },
      voice: { ...current.voice, ...parsed.voice },
      learning: { ...current.learning, ...parsed.learning },
      privacy: { ...current.privacy, ...parsed.privacy },
    };
    await this.db
      .insert(userSettings)
      .values({ learnerId: userId, ...next })
      .onConflictDoUpdate({ target: userSettings.learnerId, set: { ...next, updatedAt: new Date() } });
    return SettingsSchema.parse(next);
  }
}
