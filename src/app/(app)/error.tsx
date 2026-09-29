'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <button onClick={reset} className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm text-white">Try again</button>
    </div>
  );
}
