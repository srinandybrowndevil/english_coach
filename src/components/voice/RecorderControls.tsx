'use client';
import { useEffect, useRef } from 'react';
import type { useRecorder } from '@/hooks/useRecorder';

const STATUS_TEXT: Record<string, string> = {
  idle: 'Ready to record', requesting: 'Asking for microphone access…',
  denied: 'Microphone permission denied', unsupported: 'Recording not supported in this browser',
  recording: 'Recording — press Stop when done', paused: 'Paused',
  stopped: 'Recording saved — ready to send', error: 'Recording error',
};

export function RecorderControls({ r, onSend }: { r: ReturnType<typeof useRecorder>; onSend?: (b: Blob) => void }) {
  const stopRef = useRef<HTMLButtonElement>(null);
  const mm = Math.floor(r.durationMs / 60000);
  const ss = Math.floor((r.durationMs % 60000) / 1000).toString().padStart(2, '0');
  const recording = r.status === 'recording' || r.status === 'paused';

  useEffect(() => { if (r.status === 'recording') stopRef.current?.focus(); }, [r.status]);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
      <div aria-live="polite" className="text-sm text-neutral-600 dark:text-neutral-400">
        Status: {STATUS_TEXT[r.status] ?? r.status}
        {recording && <span className="ml-2 tabular-nums">{mm}:{ss}</span>}
      </div>

      {recording && (
        <div className="h-1.5 w-full rounded bg-neutral-200 dark:bg-neutral-800" role="meter" aria-label="microphone level">
          <div className="h-1.5 rounded bg-emerald-500 transition-[width] duration-100" style={{ width: `${Math.round(r.level * 100)}%` }} />
        </div>
      )}

      {r.status === 'denied' && (
        <p className="text-sm text-red-600">{r.error} <button className="underline" onClick={r.start}>Retry permission</button></p>
      )}
      {r.status === 'error' && <p className="text-sm text-red-600">{r.error ?? 'Something went wrong.'}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {!recording && r.status !== 'stopped' && (
          <button
            onClick={r.start}
            className="min-h-14 min-w-14 rounded-full bg-neutral-900 px-6 py-4 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
            aria-label="Start recording"
          >● Record</button>
        )}
        {recording && (
          <>
            <button
              ref={stopRef}
              onClick={r.stop}
              className="min-h-14 min-w-14 rounded-full bg-red-600 px-6 py-4 text-sm font-medium text-white"
              aria-label="Stop recording"
            >■ Stop</button>
            <button onClick={r.status === 'paused' ? r.resume : r.pause} className="rounded-lg border px-4 py-2 text-sm">
              {r.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
          </>
        )}
        {r.status === 'stopped' && r.blob && (
          <>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Recorded {mm}:{ss}</span>
            {onSend && <button onClick={() => onSend(r.blob!)} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-neutral-100 dark:text-neutral-900">Send</button>}
            <button onClick={r.reset} className="rounded-lg border px-4 py-2 text-sm">Discard</button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
        {r.devices.length > 1 && (
          <label className="flex items-center gap-2">
            Mic
            <select
              value={r.deviceId ?? ''}
              onChange={(e) => r.selectDevice(e.target.value)}
              className="rounded border bg-transparent px-2 py-1"
            >
              <option value="">Default</option>
              {r.devices.map((d) => <option key={d.deviceId} value={d.deviceId}>{d.label || 'Microphone'}</option>)}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={r.autoFinish} onChange={(e) => r.setAutoFinish(e.target.checked)} />
          Auto-stop after 1.5s silence
        </label>
      </div>
    </div>
  );
}
