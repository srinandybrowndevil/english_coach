# Architecture

Next.js 16 (App Router, `src/`) · TypeScript strict + `noUncheckedIndexedAccess` ·
Tailwind v4 (CSS-first `@theme` tokens, dark/light via `prefers-color-scheme`,
`data-theme` hook reserved) · Drizzle ORM → Postgres/PGlite · zod-validated env
(`src/lib/env.ts`, server-only).

## Request flow

`src/proxy.ts` (Next 16 renamed middleware → proxy; exports `proxy()`) → App
Router pages/route handlers → `src/server/services/` → `src/lib/db` · `src/lib/ai`.

## Auth — two-layer rule

Magic-link, single allowlisted account, no auth library.

1. **Proxy layer** (`src/proxy.ts`): presence + shape of the `sid` cookie only.
   Redirects everything else to `/login`. Public: `/login`, `/api/auth/*`,
   `/manifest.webmanifest`, `/icons/*`, `/_next/*`, `/favicon.ico`.
2. **Data layer** (`requireSession()` in `src/app/(app)/layout.tsx`): validates the
   session hash against the `sessions` table. The proxy cannot do this — it must
   not share the single-connection PGlite instance.

Flow: `POST /api/auth/request` (allowlist check is silent — always `200 {ok:true}`)
→ token (32B random, sha256 stored, 15 min) → Resend email, or dev fallback prints
the link to the server console → `GET /api/auth/verify` consumes token, creates
30-day session (sha256 in DB), sets `sid` (httpOnly, lax, secure-in-prod) → `/`.
`POST /api/auth/logout` deletes the session row.

Rate limit: 5 magic-link requests / 15 min / IP, in-memory (ponytail:
single-instance ceiling; DB/KV if multi-instance). CSRF: mutating routes call
`assertSameOrigin(req)` — `Origin` must equal `APP_URL`.

## Database

See `docs/database.md`. `getDb()` picks `node-postgres` when `DATABASE_URL` is set
else embedded PGlite; self-migrates once per process; singleton on `globalThis`.

## Provider layer

See `docs/ai-system.md`. `getAI()` singleton; `OPENAI_API_KEY` absent → mock
providers. All calls logged to `ai_evaluation_events`.

## Folder map

```
src/app/            App Router: (app)/ authed shell, login/, api/auth/*
src/components/ui/  primitives
src/lib/ai/         provider interfaces + openai/ + mock/ + usage events
src/lib/auth/       tokens, magic-link, session helpers
src/lib/db/         client (driver select), migrate, schema/ per domain
src/lib/security/   origin (CSRF) checks
src/lib/env.ts      zod env
src/server/services service layer (§65), populated in later phases
src/types/ src/hooks/ src/stores/
src/proxy.ts        route protection (layer 1)
drizzle/migrations/ generated SQL (committed)
tests/{unit,integration,e2e,fixtures}
docs/
```
