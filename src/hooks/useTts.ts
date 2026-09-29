'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Plays tutor/audio replies; resolves {spoken:false} on failure so UI falls back to text (§75). */
export function useTts(playbackSpeed = 1) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speedRef = useRef(playbackSpeed);
  useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);

  const stop = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string): Promise<{ spoken: boolean }> => {
    stop();
    try {
      const res = await fetch('/api/speech/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return { spoken: false };
      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.playbackRate = speedRef.current;
      audioRef.current = audio;
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      await audio.play().catch(() => setIsSpeaking(false));
      return { spoken: true };
    } catch {
      return { spoken: false };
    }
  }, [stop]);

  return { speak, stop, isSpeaking };
}
