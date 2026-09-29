'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

// ── pure reducer (unit-testable without browser APIs) ─────────────────────
export type RecorderStatus = 'idle' | 'requesting' | 'denied' | 'unsupported' | 'recording' | 'paused' | 'stopped' | 'error';
export type RecorderEvent =
  | { type: 'start' }
  | { type: 'unsupported' }
  | { type: 'denied' }
  | { type: 'recording' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'stop' }
  | { type: 'reset' }
  | { type: 'error' };

export function recorderReducer(s: RecorderStatus, e: RecorderEvent): RecorderStatus {
  switch (e.type) {
    case 'start': return s === 'idle' || s === 'stopped' || s === 'error' ? 'requesting' : s;
    case 'unsupported': return 'unsupported';
    case 'denied': return 'denied';
    case 'recording': return s === 'requesting' || s === 'paused' || s === 'recording' ? 'recording' : s;
    case 'pause': return s === 'recording' ? 'paused' : s;
    case 'resume': return s === 'paused' ? 'recording' : s;
    case 'stop': return s === 'recording' || s === 'paused' ? 'stopped' : s;
    case 'reset': return 'idle';
    case 'error': return 'error';
  }
}

const VAD_THRESHOLD = 0.015;   // RMS — quiet room noise sits below this
const VAD_SPEECH_MS = 700;     // must see speech before auto-finishing
const VAD_SILENCE_MS = 1500;

export function pickMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'])
    if (MediaRecorder.isTypeSupported(t)) return t;
  return null;
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [autoFinish, setAutoFinish] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const speechMsRef = useRef(0);
  const silenceMsRef = useRef(0);
  const lastTickRef = useRef(0);
  const autoFinishRef = useRef(autoFinish);
  autoFinishRef.current = autoFinish;
  const startedRef = useRef(0);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    recRef.current = null;
  }, []);

  const monitor = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i]! - 128) / 128; sum += v * v; }
      const rms = Math.sqrt(sum / buf.length);
      setLevel(Math.min(1, rms * 8));
      const now = performance.now();
      const dt = now - (lastTickRef.current || now);
      lastTickRef.current = now;
      if (rms > VAD_THRESHOLD) { speechMsRef.current += dt; silenceMsRef.current = 0; }
      else silenceMsRef.current += dt;
      if (autoFinishRef.current && speechMsRef.current >= VAD_SPEECH_MS && silenceMsRef.current >= VAD_SILENCE_MS) {
        recRef.current?.stop();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setStatus((s) => recorderReducer(s, { type: 'start' }));
    if (recRef.current) return; // never two recorders
    const mime = pickMime();
    if (!mime) { setStatus('unsupported'); setError('Recording is not supported in this browser.'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });
      streamRef.current = stream;
      stream.getAudioTracks().forEach((t) => (t.onended = () => setStatus('error'))); // device unplug
      const ctx = new AudioContext();
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyserRef.current);
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: mime.split(';')[0] }));
        setDurationMs(Date.now() - startedRef.current);
        setStatus((s) => recorderReducer(s, { type: 'stop' }));
        cleanup();
      };
      speechMsRef.current = 0; silenceMsRef.current = 0; lastTickRef.current = 0;
      startedRef.current = Date.now();
      rec.start(250);
      setStatus('recording');
      monitor();
      setError(null);
      navigator.mediaDevices.enumerateDevices().then((d) =>
        setDevices(d.filter((x) => x.kind === 'audioinput'))).catch(() => {});
    } catch (err) {
      cleanup();
      const denied = err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
      setStatus(denied ? 'denied' : 'error');
      setError(denied ? 'Microphone permission denied. Enable mic access in your browser and retry.' : 'Could not start recording.');
    }
  }, [deviceId, cleanup, monitor]);

  const pause = useCallback(() => {
    if (recRef.current?.state === 'recording') { recRef.current.pause(); setStatus('paused'); }
  }, []);
  const resume = useCallback(() => {
    if (recRef.current?.state === 'paused') { recRef.current.resume(); setStatus('recording'); }
  }, []);
  const stop = useCallback(() => { recRef.current?.stop(); }, []);
  const reset = useCallback(() => { cleanup(); setBlob(null); setDurationMs(0); setLevel(0); setStatus('idle'); }, [cleanup]);
  const selectDevice = useCallback((id: string) => setDeviceId(id), []);

  useEffect(() => cleanup, [cleanup]);

  return { status, blob, durationMs, level, error, devices, deviceId, autoFinish, setAutoFinish, start, pause, resume, stop, reset, selectDevice };
}
