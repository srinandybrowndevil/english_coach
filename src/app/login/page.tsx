'use client';

import { useState } from 'react';

type State = 'idle' | 'sending' | 'sent' | 'error';

export default function LoginPage() {
  const [state, setState] = useState<State>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const email = new FormData(e.currentTarget).get('email');
    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setState(res.ok ? 'sent' : 'error');
    } catch {
      setState('error');
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">English Mastery OS</h1>
        <p className="mt-1 text-sm text-fg-muted">Private access. Sign in with your email.</p>
        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={state === 'sending'}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg disabled:opacity-60"
          >
            {state === 'sending' ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
        {state === 'sent' && (
          <p role="status" className="mt-4 text-sm text-fg-muted">
            If this address is allowed, a link has been sent.
          </p>
        )}
        {state === 'error' && (
          <p role="alert" className="mt-4 text-sm text-danger">
            Something went wrong. Try again.
          </p>
        )}
      </div>
    </main>
  );
}
