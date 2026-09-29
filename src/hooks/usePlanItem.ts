'use client';
import { useSearchParams } from 'next/navigation';

/** Marks the daily-plan item done when the current exercise completes (§78 B). */
export function usePlanItem() {
  const planItem = useSearchParams().get('planItem');
  return async function markDone() {
    if (!planItem) return;
    await fetch(`/api/daily/items/${planItem}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    }).catch(() => {});
  };
}
