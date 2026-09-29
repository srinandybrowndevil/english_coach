import { requireSession } from '@/lib/auth/session';

export default async function HomePage() {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome, {session.email}</h1>
      <p className="mt-2 text-sm text-fg-muted">
        Your dashboard is being built. Training modules arrive in the next phases.
      </p>
      <form action="/api/auth/logout" method="post" className="mt-6">
        <button
          type="submit"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
