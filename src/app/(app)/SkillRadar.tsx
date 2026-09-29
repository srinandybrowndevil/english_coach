'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';

const DOMAINS = [
  'speaking', 'grammar', 'vocabulary', 'pronunciation', 'listening',
  'reading', 'writing', 'business', 'negotiation', 'presentation',
];

export function SkillRadar({ data }: { data: Record<string, number> | null }) {
  if (!data) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-fg-muted">
        Complete the assessment to see your skill map.
      </div>
    );
  }
  const rows = DOMAINS.map((d) => ({ domain: d, score: data[d] ?? 0 }));
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <RadarChart data={rows}>
          <PolarGrid />
          <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11 }} />
          <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
