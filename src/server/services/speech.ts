import { createHash } from 'node:crypto';
import { mkdir, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { eq } from 'drizzle-orm';
import { getAI } from '@/lib/ai';
import { recordAIEvent } from '@/lib/ai/usage';
import type { Db } from '@/lib/db/client';
import { sessionTurns } from '@/lib/db/schema';
import { getEnv } from '@/lib/env';

const EXT: Record<string, string> = {
  'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3',
  'audio/wav': 'wav', 'audio/ogg': 'ogg',
};

// ponytail: 50-entry in-memory LRU for TTS — restarts lose it; fine at this scale.
const ttsCache = new Map<string, { bytes: Uint8Array; mimeType: string }>();
export function ttsCacheSize() { return ttsCache.size; }
export function ttsCacheClear() { ttsCache.clear(); }

export class SpeechService {
  constructor(private db: Db) {}

  async transcribe(bytes: Uint8Array, mimeType: string, filename: string, opts?: { prompt?: string }) {
    const start = Date.now();
    const res = await getAI().stt.transcribe({ bytes, mimeType, filename }, { wordTimestamps: true, prompt: opts?.prompt });
    recordAIEvent({ provider: 'stt', model: res.model, kind: 'stt', ms: Date.now() - start, inputEvidence: { bytes: bytes.length } });
    return res;
  }

  async persistAudio(userId: string, turnId: string, bytes: Uint8Array, mime: string): Promise<string | null> {
    const ext = EXT[mime.split(';')[0]!.trim()] ?? 'bin';
    const rel = path.posix.join(userId, `${turnId}.${ext}`);
    const abs = path.join(getEnv().AUDIO_STORAGE_DIR, rel);
    await mkdir(path.dirname(abs), { recursive: true });
    await writeFile(abs, bytes);
    return rel;
  }

  /** Deletes retained audio older than the retention window and clears audio_path. */
  async purgeExpired(userId: string, retention: '7d' | '30d'): Promise<number> {
    const dir = path.join(getEnv().AUDIO_STORAGE_DIR, userId);
    const cutoff = Date.now() - (retention === '7d' ? 7 : 30) * 86_400_000;
    let removed = 0;
    let files: string[] = [];
    try { files = await readdir(dir); } catch { return 0; }
    for (const f of files) {
      const abs = path.join(dir, f);
      const s = await stat(abs).catch(() => null);
      if (s && s.mtimeMs < cutoff) {
        await unlink(abs);
        const turnId = path.basename(f, path.extname(f));
        await this.db.update(sessionTurns).set({ audioPath: null }).where(eq(sessionTurns.id, turnId));
        removed++;
      }
    }
    return removed;
  }

  audioFilePath(relPath: string): string | null {
    const abs = path.resolve(getEnv().AUDIO_STORAGE_DIR, relPath);
    return abs.startsWith(path.resolve(getEnv().AUDIO_STORAGE_DIR)) ? abs : null;
  }

  async synthesize(text: string, opts: { voice?: string; speed?: number } = {}) {
    const env = getEnv();
    const voice = opts.voice ?? env.TTS_VOICE;
    const speed = opts.speed ?? 1;
    const key = createHash('sha256').update(`${env.TTS_MODEL}|${voice}|${speed}|${text}`).digest('hex');
    const hit = ttsCache.get(key);
    if (hit) {
      ttsCache.delete(key); ttsCache.set(key, hit); // LRU touch
      return hit;
    }
    const start = Date.now();
    const res = await getAI().tts.synthesize(text, { voice, speed });
    recordAIEvent({ provider: 'tts', model: env.TTS_MODEL, kind: 'tts', ms: Date.now() - start });
    if (ttsCache.size >= 50) ttsCache.delete(ttsCache.keys().next().value!);
    ttsCache.set(key, res);
    return res;
  }
}
