'use client';

import { useState } from 'react';
import { RecorderControls } from '@/components/voice/RecorderControls';
import { useRecorder } from '@/hooks/useRecorder';
import type { SpeakingTechnique } from '@/content/public-speaking';

export function TechniquesClient({ techniques }: { techniques: SpeakingTechnique[] }) {
  const rec = useRecorder();
  const [metric, setMetric] = useState<Record<string, string>>({});
  const [best, setBest] = useState<Record<string, number>>({});

  const check = async (slug: string) => {
    if (!rec.blob) return;
    const fd = new FormData(); fd.append('audio', rec.blob, 't.webm');
    const t = await (await fetch('/api/speech/stt', { method: 'POST', body: fd })).json();
    const words = (t?.text ?? '').split(/\s+/).filter(Boolean).length;
    const wpm = rec.durationMs > 0 ? Math.round(words / (rec.durationMs / 60000)) : 0;
    setMetric((m) => ({ ...m, [slug]: `${words} words · ~${wpm} wpm` }));
    if (wpm > (best[slug] ?? 0)) setBest((b) => ({ ...b, [slug]: wpm }));
    await fetch('/api/exercise-attempts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseSlug: `technique:${slug}`, payload: { wpm, words, durationMs: rec.durationMs } }),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-semibold">Public-speaking techniques</h1>
      <div className="space-y-4">
        {techniques.map((t) => (
          <div key={t.slug} className="rounded-xl border border-border p-4 space-y-2">
            <h2 className="font-semibold">{t.technique}</h2>
            <p className="text-sm text-fg-muted">{t.explanation}</p>
            <p className="text-sm"><strong>60 s drill:</strong> {t.drill}</p>
            <RecorderControls r={rec} />
            {rec.blob && <button onClick={() => check(t.slug)} className="text-xs text-accent underline">Check delivery</button>}
            {metric[t.slug] && <p className="text-xs text-fg-muted">{metric[t.slug]}{best[t.slug] ? ` · best ~${best[t.slug]} wpm` : ''}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
