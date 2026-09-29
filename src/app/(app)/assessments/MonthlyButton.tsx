'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MonthlyButton({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={!enabled || busy}
      onClick={async () => {
        setBusy(true);
        const a = await (await fetch('/api/assessments', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: 'monthly' }),
        })).json();
        router.push(`/assessment/monthly?id=${a.id}`);
      }}
      className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
    >
      Start monthly assessment
    </button>
  );
}
