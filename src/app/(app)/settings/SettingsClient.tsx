'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Settings } from '@/server/services/settings';

const VOICES = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse']; // OpenAI voices
const ENTITIES = ['mistakes', 'vocabulary', 'sessions', 'journal', 'assessments', 'progress'];

export function SettingsClient({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(false);
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('theme') ?? 'system' : 'system'));

  const patch = async (p: Partial<Settings>) => {
    const res = await fetch('/api/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p),
    });
    if (res.ok) { setS(await res.json()); setSaved(true); setTimeout(() => setSaved(false), 1500); }
  };

  const destroy = async (action: string) => {
    if (confirm !== 'DELETE') { setMsg('Type DELETE to confirm'); return; }
    const res = await fetch(`/api/privacy/${action}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm }),
    });
    setMsg(res.ok ? `${action} done` : `${action} failed`);
    setConfirm('');
  };

  const setThemeMode = (v: string) => {
    setTheme(v);
    localStorage.setItem('theme', v);
    document.documentElement.dataset.theme = v === 'system' ? '' : v;
  };

  const sel = (v: React.ReactNode) => <span className="ml-2 inline-block rounded border border-border bg-bg px-2 py-1 text-sm">{v}</span>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {saved && <p className="text-xs text-green-700">Saved</p>}

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Tutor</h2>
        <label className="block text-sm">Mode
          <select className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" value={s.tutor.tutorMode}
            onChange={(e) => patch({ tutor: { ...s.tutor, tutorMode: e.target.value } })}>
            {['friendly_coach', 'strict_teacher', 'business_mentor', 'conversation_partner'].map((m) => <option key={m}>{m}</option>)}
          </select></label>
        <label className="block text-sm">Correction mode
          <select className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" value={s.tutor.correctionMode}
            onChange={(e) => patch({ tutor: { ...s.tutor, correctionMode: e.target.value } })}>
            {['gentle', 'balanced', 'strict', 'fluency'].map((m) => <option key={m}>{m}</option>)}
          </select></label>
        <label className="block text-sm">Difficulty
          <select className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" value={s.tutor.difficulty}
            onChange={(e) => patch({ tutor: { ...s.tutor, difficulty: +e.target.value } })}>
            {[1, 2, 3, 4, 5].map((d) => <option key={d} value={d}>{d}</option>)}
          </select></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={s.tutor.tamilEnabled}
          onChange={(e) => patch({ tutor: { ...s.tutor, tamilEnabled: e.target.checked } })} />Tamil support</label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={s.tutor.englishOnly}
          onChange={(e) => patch({ tutor: { ...s.tutor, englishOnly: e.target.checked } })} />English-only mode</label>
      </section>

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Voice</h2>
        <label className="block text-sm">TTS voice
          <select className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" value={s.voice.ttsVoice}
            onChange={(e) => patch({ voice: { ...s.voice, ttsVoice: e.target.value } })}>
            {VOICES.map((v) => <option key={v}>{v}</option>)}
          </select></label>
        <label className="block text-sm">Playback speed
          <input type="range" min="0.5" max="2" step="0.05" value={s.voice.playbackSpeed}
            onChange={(e) => patch({ voice: { ...s.voice, playbackSpeed: +e.target.value } })} />
          {sel(`${s.voice.playbackSpeed}×`)}</label>
        <label className="block text-sm">Microphone (device id persisted)
          <input value={s.voice.preferredInputDeviceId ?? ''}
            onChange={(e) => patch({ voice: { ...s.voice, preferredInputDeviceId: e.target.value || null } })}
            placeholder="default" className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" /></label>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={s.voice.autoFinishOnSilence}
          onChange={(e) => patch({ voice: { ...s.voice, autoFinishOnSilence: e.target.checked } })} />Auto-finish on silence</label>
      </section>

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Learning</h2>
        <label className="block text-sm">Daily target (minutes)
          <input type="number" min={5} max={240} value={s.learning.dailyTargetMinutes}
            onChange={(e) => patch({ learning: { ...s.learning, dailyTargetMinutes: +e.target.value } })}
            className="ml-2 w-20 rounded border border-border bg-bg px-2 py-1 text-sm" /></label>
        <label className="block text-sm">Quick session length (minutes)
          <input type="number" min={5} max={60} value={s.learning.quickModeMinutes}
            onChange={(e) => patch({ learning: { ...s.learning, quickModeMinutes: +e.target.value } })}
            className="ml-2 w-20 rounded border border-border bg-bg px-2 py-1 text-sm" /></label>
        <p className="text-sm">Training days:
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <label key={d} className="mx-1 inline-flex items-center gap-1">
              <input type="checkbox" checked={s.learning.trainingDays.includes(i)}
                onChange={(e) => patch({ learning: { ...s.learning, trainingDays: e.target.checked ? [...s.learning.trainingDays, i] : s.learning.trainingDays.filter((x) => x !== i) } })} />
              {d}</label>))}</p>
      </section>

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Appearance</h2>
        <label className="block text-sm">Theme
          <select value={theme} onChange={(e) => setThemeMode(e.target.value)}
            className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm">
            <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
          </select></label>
      </section>

      <section className="rounded-xl border border-border p-4 space-y-3">
        <h2 className="font-semibold">Privacy</h2>
        <label className="block text-sm">Audio retention
          <select className="ml-2 rounded border border-border bg-bg px-2 py-1 text-sm" value={s.privacy.audioRetention}
            onChange={(e) => patch({ privacy: { ...s.privacy, audioRetention: e.target.value as Settings['privacy']['audioRetention'] } })}>
            <option value="off">Off (delete after session)</option>
            <option value="7d">7 days</option><option value="30d">30 days</option>
            <option value="manual">Keep manually selected only</option>
          </select></label>
        <p className="text-xs text-fg-muted">Deleting transcripts keeps scores/metrics — they contain no transcript text.</p>
        <div className="rounded-lg border border-red-200 p-3 space-y-2">
          <p className="text-xs font-medium text-red-700">Destructive actions — type DELETE to enable</p>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE"
            className="w-32 rounded border border-border bg-bg px-2 py-1 text-sm" />
          <div className="flex flex-wrap gap-2">
            {['delete-audio', 'delete-transcripts', 'reset'].map((a) => (
              <button key={a} disabled={confirm !== 'DELETE'} onClick={() => destroy(a)}
                className="rounded-lg border border-red-300 px-3 py-1 text-xs text-red-700 disabled:opacity-40">
                {a === 'delete-audio' ? 'Delete all audio' : a === 'delete-transcripts' ? 'Delete transcripts' : 'Reset learning progress'}
              </button>
            ))}
          </div>
          {msg && <p className="text-xs text-fg-muted">{msg}</p>}
        </div>
        <div className="text-sm space-y-1">
          <p className="font-medium">Export your data</p>
          <p><a className="text-accent underline" href="/api/export" download>Download JSON (everything)</a></p>
          <p className="text-xs text-fg-muted">CSV per entity: {ENTITIES.map((e) => (
            <a key={e} className="mr-2 text-accent underline" href={`/api/export?entity=${e}`}>{e}</a>
          ))}</p>
          <p className="text-xs text-fg-muted">No raw audio is ever included in exports.</p>
        </div>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="font-semibold"><Link href="/settings/usage" className="text-accent underline">AI usage &amp; cost →</Link></h2>
      </section>
    </div>
  );
}
