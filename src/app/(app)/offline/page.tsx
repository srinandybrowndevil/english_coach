export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-8 text-center">
      <div>
        <h1 className="text-xl font-semibold">You&rsquo;re offline</h1>
        <p className="mt-2 text-sm text-fg-muted">This page isn&rsquo;t cached yet. Reconnect to continue training.</p>
      </div>
    </div>
  );
}
