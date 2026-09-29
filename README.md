# English Mastery OS

Private, single-user AI English tutor (spec: `docs/master-spec.md`).

## Setup

```bash
pnpm install
cp .env.example .env.local   # set ALLOWED_EMAIL + AUTH_SECRET
pnpm dev                     # http://localhost:3000
```

No `OPENAI_API_KEY` → deterministic **MockProvider** is used (banner in the app).
No `RESEND_API_KEY` → the magic link is printed to the dev server console.

`DATABASE_URL` unset → embedded **PGlite** at `./.data/pglite` (self-migrating).

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` / `build` / `start` | Next.js |
| `pnpm lint` / `typecheck` / `test` | eslint / tsc --noEmit / vitest |
| `pnpm db:generate` / `db:migrate` | drizzle-kit |
| `pnpm test:e2e` | playwright (later phases) |

## Docs

`docs/architecture.md` · `docs/database.md` · `docs/ai-system.md` · `docs/traceability.md`
