'use client';

import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkillRadar } from '@/app/(app)/SkillRadar';

type Bucket = {
  key: string; speakingMinutes: number; fillerRatePer100: number | null;
  avgScore: number | null; mistakesDetected: number; reviewsDone: number;
  vocabActive: number; practised: boolean;
};
type Data = {
  range: string; buckets: Bucket[]; streakDays: number;
  cefrHistory: { at: string; level: string | null; confidence: string }[];
  skillRadar: Record<string, number> | null;
};

const RANGES = ['7d', '30d', '90d', '6m', 'all'];

function Chart({ title, dataKey, buckets, unit }: { title: string; dataKey: string; buckets: Bucket[]; unit?: string }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <div style={{ minHeight: 220 }}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={buckets}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="key" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Area type="monotone" dataKey={dataKey} stroke="var(--accent, #6366f1)" fill="var(--accent, #6366f1)" fillOpacity={0.15} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-1 text-xs text-fg-muted">
        <summary className="cursor-pointer">Evidence</summary>
        <pre className="mt-1 overflow-x-auto text-[10px]">
          {buckets.map((b) => `${b.key}: ${(b as Record<string, unknown>)[dataKey] ?? '—'}${unit ?? ''}`).join('\n')}
        </pre>
      </details>
    </section>
  );
}

export function ProgressClient({ data, range }: { data: Data; range: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <Link href="/progress/reports" className="text-sm text-accent underline">Reports →</Link>
      </div>
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <Link key={r} href={`/progress?range=${r}`}
            className={`rounded-full border px-3 py-1 text-xs ${range === r ? 'border-accent bg-accent/10' : 'border-border'}`}>{r}</Link>
        ))}
      </div>
      <p className="text-sm">Streak: <strong>{data.streakDays} days</strong> · {data.buckets.filter((b) => b.practised).length} practised {data.range === '7d' || data.range === '30d' ? 'days' : 'weeks'}</p>

      {!data.buckets.length && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-fg-muted">
          No activity in this range yet — finish a session and it will appear here.
        </p>
      )}

      <Chart title="Speaking time" dataKey="speakingMinutes" buckets={data.buckets} unit=" min" />
      <Chart title="Average score" dataKey="avgScore" buckets={data.buckets} />
      <Chart title="Filler rate / 100 words" dataKey="fillerRatePer100" buckets={data.buckets} />
      <Chart title="Mistakes detected" dataKey="mistakesDetected" buckets={data.buckets} />
      <Chart title="Active vocabulary" dataKey="vocabActive" buckets={data.buckets} />

      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-2 font-semibold">Skill mastery</h2>
        {data.skillRadar ? <SkillRadar data={data.skillRadar} /> : <p className="text-sm text-fg-muted">Nothing practised yet.</p>}
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="mb-2 font-semibold">CEFR estimate history</h2>
        {data.cefrHistory.length ? (
          <ul className="space-y-1 text-sm">
            {data.cefrHistory.map((c, i) => (
              <li key={i}>{c.at}: <strong>{c.level}</strong> <span className="text-xs text-fg-muted">({c.confidence} confidence)</span></li>
            ))}
          </ul>
        ) : <p className="text-sm text-fg-muted">No assessments yet.</p>}
      </section>
    </div>
  );
}
