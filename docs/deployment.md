# Deployment

## Target Platform

**Vercel + Supabase** (Postgres hosting + Storage for audio files)

Alternative Postgres providers: Neon, Railway, or any PostgreSQL-compatible database.

## Prerequisites

1. **Vercel account** with project linked to this repository
2. **Supabase project** with:
   - PostgreSQL database
   - Storage bucket for audio files
   - Service role key (for server-side operations)
3. **Resend account** for magic-link emails
4. **OpenAI API key** (optional — mock provider will be used if not set)

## Environment Variables

Set the following in Vercel project settings:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., `postgresql://postgres.xxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`) |
| `AUTH_SECRET` | Yes | Random 32+ character string for session signing (generate with `openssl rand -base64 32`) |
| `ALLOWED_EMAIL` | Yes | Single learner email address (e.g., `learner@example.com`) |
| `APP_URL` | Yes | Production URL (e.g., `https://your-app.vercel.app`) |
| `RESEND_API_KEY` | Yes | Resend API key for magic-link emails |
| `RESEND_FROM` | Yes | From email for magic links (must be verified in Resend) |
| `OPENAI_API_KEY` | No | OpenAI API key (optional — mock provider used if not set) |
| `TTS_VOICE` | No | OpenAI TTS voice (default: `alloy`) |
| `SUPABASE_URL` | Yes | Supabase project URL (e.g., `https://xxxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (for storage operations) |
| `AUDIO_BUCKET` | Yes | Supabase Storage bucket name for audio files (e.g., `audio`) |

## Database Migration

### Switch from PGlite to Postgres

The application uses **PGlite** for local development and **Postgres** for production. The schema is identical.

1. **Update database client** in `src/lib/db/client.ts`:
   - Set `PGLITE_DIR` environment variable to `null` or unset it
   - When `PGLITE_DIR` is not set, the client uses `DATABASE_URL` instead

2. **Run migrations** on production database:
   ```bash
   pnpm db:migrate
   ```
   This applies all migrations in `drizzle/migrations/` in order:
   - `0000_initial.sql`
   - `0001_assessment_cefr_daily.sql`
   - `0002_mistake_label.sql`
   - `0003_hidden_note.sql`
   - `0004_sync.sql`

3. **Verify schema**:
   ```bash
   pnpm db:generate  # Should output "No changes detected"
   ```

### Migration Snapshot

The authoritative schema snapshot is `drizzle/migrations/meta/0004_snapshot.json`. This snapshot matches the current schema after Phase 7. Do not modify migrations after deployment; new schema changes require a new migration.

## Audio Storage Implementation

### Current State (Local)

`SpeechService.persistAudio` writes to local filesystem (`AUDIO_STORAGE_DIR` or `.data/audio/`). This works for local development but is not suitable for serverless deployment (Vercel functions are ephemeral).

### Production Implementation (Supabase Storage)

Implement `SpeechService.persistAudio` and `SpeechService.streamAudio` using Supabase Storage REST API:

```ts
// src/server/services/speech.ts (replace local filesystem code)

async function persistAudio(userId: string, turnId: string, audioBuffer: Buffer): Promise<string> {
  const filename = `${userId}/${turnId}.webm`;
  const formData = new FormData();
  formData.append('file', new Blob([audioBuffer]), filename);

  const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${process.env.AUDIO_BUCKET}/${filename}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to upload audio');
  return filename;
}

async function streamAudio(filename: string): Promise<ReadableStream> {
  const response = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${process.env.AUDIO_BUCKET}/${filename}`, {
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    },
  });

  if (!response.ok) throw new Error('Audio not found');
  return response.body!;
}
```

### Signed URLs for Audio Streaming

For secure audio access, generate signed URLs in `/api/audio/[turnId]`:

```ts
const { data: { signedUrl } } = await supabase.storage
  .from(process.env.AUDIO_BUCKET)
  .createSignedUrl(filename, 600); // 10-minute expiry
```

## Vercel Deployment Steps

1. **Connect repository** to Vercel
2. **Configure environment variables** in Vercel project settings
3. **Set build command**: `pnpm build --webpack` (webpack required; Turbopack not supported on all platforms)
4. **Set output directory**: `.next`
5. **Deploy**:
   ```bash
   vercel --prod
   ```

6. **Post-deploy verification**:
   - Visit production URL
   - Test magic-link authentication
   - Run database migration (if not automatic)
   - Verify audio upload/download (if Supabase Storage implemented)

## Supabase Setup

1. **Create project** at https://supabase.com
2. **Create Storage bucket** named `audio` (or custom name matching `AUDIO_BUCKET`)
3. **Set bucket RLS policies**:
   - Public read access: false (access via signed URLs only)
   - Service role: full upload/delete access
4. **Get credentials**:
   - Project URL (Settings → API)
   - Service role key (Settings → API)
5. **Configure environment variables** in Vercel

## Resend Setup

1. **Create account** at https://resend.com
2. **Verify sender domain** (e.g., `yourdomain.com`)
3. **Create API key**
4. **Configure environment variables** in Vercel:
   - `RESEND_API_KEY`
   - `RESEND_FROM` (verified sender email)

## Known Limitations

1. **Audio storage**: Local filesystem implementation not suitable for serverless. Supabase Storage implementation required for production voice features (estimated 60 lines of code).
2. **Turbopack**: Not supported on this platform (Windows/x64). Use `pnpm build --webpack` for production builds.
3. **Database migrations**: Currently manual for production. Consider automating with Vercel post-build hooks or Supabase Migrations.

## Rollback Procedure

If deployment fails:

1. **Revert code** to previous commit
2. **Redeploy** to Vercel
3. **Do not roll back database migrations** — schema changes are backwards-compatible through the migration sequence
4. **If migration is at fault**, use `drizzle-kit rollback` (requires manual setup) or restore database from backup

## Monitoring

- **Vercel**: Logs, build errors, deployment status
- **Supabase**: Database logs, storage usage, API logs
- **Resend**: Email delivery logs
- **OpenAI**: API usage dashboard (if `OPENAI_API_KEY` is set)

## Security Checklist

- [ ] `AUTH_SECRET` is randomly generated and kept secret
- [ ] `DATABASE_URL` uses SSL connection string (`postgres://...?sslmode=require`)
- [ ] `ALLOWED_EMAIL` is set to a single trusted email
- [ ] Supabase service role key is never exposed to client
- [ ] Storage bucket has RLS policies (no public access)
- [ ] Signed URLs have short expiry (≤10 minutes)
- [ ] HTTPS is enforced on production (Vercel default)

