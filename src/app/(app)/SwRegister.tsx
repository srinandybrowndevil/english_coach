'use client';

import { useEffect, useState } from 'react';

export function SwRegister() {
  const [offline, setOffline] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener('online', on); window.addEventListener('offline', on);

    if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === '1')) {
      void navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          reg.installing?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'installed' && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });
      });
    }
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', on); };
  }, []);

  return (
    <>
      {offline && (
        <div role="status" className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          You&rsquo;re offline — queued turns will send when you&rsquo;re back.
        </div>
      )}
      {updateReady && (
        <div className="border-b border-border bg-surface px-4 py-2 text-center text-xs">
          Update available — <button className="underline" onClick={() => location.reload()}>Reload</button>
        </div>
      )}
    </>
  );
}
