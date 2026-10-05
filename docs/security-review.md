# Security Review

## Executive Summary

The application implements a single-user, private English learning system with magic-link authentication, embedded database (PGlite), and provider-abstraction for AI services. Security measures are appropriate for a single-user local deployment, with considerations documented for production deployment.

**Overall Risk Level**: **Medium** (appropriate for single-user local use; production deployment requires additional hardening)

---

## Authentication & Authorization

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Email allowlist | `ALLOWED_EMAIL` environment variable, validated on magic-link request | ✅ Implemented |
| Magic-link tokens | One-time use tokens, stored in database, consumed on verification | ✅ Implemented |
| Session management | Server-side session hash, cookie-based (`sid`), expiry enforced | ✅ Implemented |
| Same-origin checks | `assertSameOrigin()` on all mutating API routes | ✅ Implemented |
| CSRF protection | SameSite cookie policy (via Next.js defaults) + origin validation | ✅ Implemented |
| Rate limiting | Token request rate limit (configured in `src/lib/security/rate-limit.ts`) | ✅ Implemented |

### Vulnerability Assessment

1. **Allowlist enumeration**: Magic-link request returns success response even for non-allowlisted emails. This prevents email enumeration. ✅ **Mitigated**

2. **Token reuse**: Tokens are consumed on verification; second attempt fails. ✅ **Mitigated**

3. **Session hijacking**: Sessions are server-side hashed values; cookies are HTTP-only and secure (HTTPS only in production). ✅ **Mitigated**

4. **Brute force**: Rate limiting on token requests prevents brute-force attacks on the allowlist. ✅ **Mitigated**

### Recommendations for Production

- [ ] Add CAPTCHA to magic-link request if deployed publicly
- [ ] Implement IP-based rate limiting in addition to email-based
- [ ] Add session invalidation on password/security settings changes (if password-based auth added later)

---

## Data Privacy

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Audio retention | Configurable (off/7d/30d/keep manual), purge on session start | ✅ Implemented |
| Audio access control | Owner-only streaming via `/api/audio/[turnId]` | ✅ Implemented |
| Transcript deletion | Privacy action to null transcripts while keeping metrics | ✅ Implemented |
| Data export | JSON + CSV export for user control | ✅ Implemented |
| Learning data reset | Privacy action to delete learner rows while keeping seed content | ✅ Implemented |
| Audio file paths | Never exposed in API responses before authorization | ✅ Implemented |

### Vulnerability Assessment

1. **Audio exposure**: Audio files stored in local filesystem; access controlled via API. No direct file serving. ✅ **Mitigated**

2. **Transcript leakage**: Transcripts are stored in database; access requires authenticated session. ✅ **Mitigated**

3. **Data persistence**: User has full control over deletion via privacy actions. ✅ **Mitigated**

### Recommendations for Production

- [ ] Implement Supabase Storage for audio with signed URLs (documented in `docs/deployment.md`)
- [ ] Add automated purge job for expired audio (cron or serverless function)
- [ ] Consider encrypting transcripts at rest if compliance requirements demand it

---

## API Security

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Input validation | Zod schemas on all API inputs | ✅ Implemented |
| SQL injection | Drizzle ORM with parameterized queries | ✅ Implemented |
| XSS protection | React auto-escapes; Content Security Policy in next.config.ts | ✅ Implemented |
| Security headers | Configured in `next.config.ts` (CSP, HSTS, etc.) | ✅ Implemented |
| Error messages | Generic error messages; no stack traces in production | ✅ Implemented |

### Vulnerability Assessment

1. **SQL injection**: Drizzle ORM prevents injection; no raw SQL queries. ✅ **Mitigated**

2. **XSS**: React escapes by default; CSP restricts inline scripts. ✅ **Mitigated**

3. **Path traversal**: Audio paths are UUID-based; no user-controlled paths. ✅ **Mitigated**

4. **Error disclosure**: Production build hides stack traces; generic error messages. ✅ **Mitigated**

### Recommendations for Production

- [ ] Add request logging for security event detection (failed auth, rate limit hits)
- [ ] Implement API key validation for AI provider calls (if not using environment variables)
- [ ] Add input sanitization for free-text fields (e.g., journal entries) to prevent stored XSS

---

## AI Provider Security

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| API key storage | Environment variables only, never committed | ✅ Implemented |
| Provider abstraction | Mock provider for local testing without keys | ✅ Implemented |
| Prompt versioning | All prompts versioned in database for auditability | ✅ Implemented |
| Evaluation logging | All AI calls logged with version, evidence, tokens, cost | ✅ Implemented |
| Cost tracking | Tokens and cost recorded per evaluation | ✅ Implemented |

### Vulnerability Assessment

1. **API key exposure**: Keys stored in environment variables; not in code or logs. ✅ **Mitigated**

2. **Prompt injection**: User input is passed to AI; no adversarial input filtering. ⚠️ **Partially mitigated** (low risk for single-user app)

3. **Unbounded costs**: Cost tracking in place but no spend caps. ⚠️ **Mitigated by user awareness**

### Recommendations for Production

- [ ] Implement prompt injection filtering (e.g., reject system prompt overrides)
- [ ] Add spend alerts or caps for OpenAI API usage
- [ ] Consider using OpenAI's moderation API for content safety

---

## Database Security

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Connection security | PGlite uses local filesystem; Postgres uses SSL in production | ✅ Implemented |
| Schema constraints | Foreign keys, unique constraints, not null constraints | ✅ Implemented |
| Migration safety | Append-only migrations; no destructive changes in production | ✅ Implemented |
| Data isolation | Single-user app; no multi-tenant data leakage risk | ✅ Implemented |

### Vulnerability Assessment

1. **Database access**: PGlite is local file; access requires filesystem permissions. ✅ **Mitigated**

2. **Migration corruption**: Append-only migrations prevent accidental data loss. ✅ **Mitigated**

3. **Data leakage**: Single-user app; no cross-user data exposure. ✅ **N/A**

### Recommendations for Production

- [ ] Enable row-level security (RLS) in Supabase if multi-tenant expansion planned
- [ ] Add database connection pooling for production Postgres
- [ ] Implement regular database backups (Supabase provides automatic backups)

---

## PWA & Offline Security

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Service worker scope | Limited to public assets; never caches API routes | ✅ Implemented |
| Offline fallback | Generic offline page; no cached sensitive data | ✅ Implemented |
| Update notification | Toast prompts user to reload on service worker update | ✅ Implemented |

### Vulnerability Assessment

1. **Cached sensitive data**: Service worker explicitly excludes `/api/*` from cache. ✅ **Mitigated**

2. **Stale updates**: User prompted to reload on update; no force-refresh. ✅ **Mitigated**

### Recommendations for Production

- [ ] Add service worker version logging for debugging
- [ ] Consider adding critical update mechanism for security patches

---

## Third-Party Dependencies

### Dependency Review

| Dependency | Purpose | Risk Level | Notes |
|------------|---------|------------|-------|
| Next.js 16.3.6 | Framework | Low | Actively maintained; security patches applied via updates |
| React 19.3.0 | UI library | Low | Actively maintained |
| Drizzle ORM 0.45.3 | Database ORM | Low | Minimal attack surface; parameterized queries |
| PGlite 0.5.8 | Embedded Postgres | Low | Local-only; no network exposure |
| OpenAI SDK 7.22.0 | AI provider | Low | Client library; keys stored securely |
| Resend 6.28.1 | Email service | Low | API-based; keys stored securely |
| Zod 4.6.5 | Validation | Low | Pure library; no network calls |
| Recharts 2.12.7 | Charts | Low | Pure library; no network calls |
| Playwright 1.63.0 | E2E testing | Low | Dev-only dependency |
| Vitest 5.0.1 | Unit testing | Low | Dev-only dependency |

### Recommendations

- [ ] Enable Dependabot or Renovate for automated dependency updates
- [ ] Run `pnpm audit` regularly for known vulnerabilities
- [ ] Pin dependency versions to prevent unexpected updates

---

## Environment & Configuration

### Implemented Controls

| Control | Implementation | Status |
|---------|----------------|--------|
| Environment variable validation | `src/lib/env.ts` validates all required vars on startup | ✅ Implemented |
| Secret management | Secrets in `.env.local` (gitignored) | ✅ Implemented |
| Default values | Safe defaults for optional configuration | ✅ Implemented |

### Vulnerability Assessment

1. **Missing environment variables**: App fails fast with clear error on startup. ✅ **Mitigated**

2. **Secret exposure**: `.env.local` in `.gitignore`; not committed. ✅ **Mitigated**

### Recommendations for Production

- [ ] Use Vercel environment variables (or equivalent) for production secrets
- [ ] Rotate `AUTH_SECRET` periodically
- [ ] Use different `ALLOWED_EMAIL` for staging vs production

---

## Compliance Considerations

### GDPR (General Data Protection Regulation)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Right to access | ✅ Implemented | Data export endpoint provides full user data |
| Right to erasure | ✅ Implemented | Privacy reset action deletes learner data |
| Right to rectification | ⚠️ Partial | No built-in data correction UI; users can delete and re-enter |
| Data portability | ✅ Implemented | JSON + CSV export for portability |
| Data minimization | ✅ Implemented | Only collects data necessary for learning |
| Purpose limitation | ✅ Implemented | Data used only for learning analytics |

### Recommendations

- [ ] Add privacy policy page documenting data usage
- [ ] Add cookie consent banner if tracking/analytics added later
- [ ] Document data retention periods in privacy policy

---

## Security Testing

### Completed Tests

| Test Type | Coverage | Status |
|-----------|----------|--------|
| Unit tests | 30+ files, 166+ tests | ✅ Passing |
| Integration tests | 9+ files, 50+ tests | ✅ Passing |
| Auth flow tests | Allowlist, token validation, session expiry | ✅ Implemented |
| Rate limit tests | Token request rate limiting | ✅ Implemented |
| SQL injection | No raw SQL; ORM-based queries | ✅ Mitigated by design |

### Recommended Additional Tests

- [ ] Security-focused E2E tests (auth bypass attempts, privilege escalation)
- [ ] Dependency vulnerability scanning (Snyk, Dependabot)
- [ ] Manual penetration testing before production deployment
- [ ] OWASP ZAP or Burp Suite scan for common vulnerabilities

---

## Critical Security Issues

None identified. All identified risks are mitigated or documented as acceptable for single-user local deployment.

---

## Medium-Priority Issues

1. **Prompt injection**: No adversarial input filtering for AI prompts. Low risk for single-user app; should be addressed if multi-user deployment planned.

2. **Spend caps**: No automatic spend limits for OpenAI API usage. User awareness is current mitigation.

3. **Accessibility audit**: Keyboard navigation and screen reader support not audited. Not a security issue but an accessibility concern.

---

## Low-Priority Issues

1. **E2E test coverage**: Minimal E2E tests; basic auth + onboarding flow not automated.

2. **Error logging**: Structured logging in place but no security event detection/alerting.

3. **CSRF token**: Same-origin checks provide CSRF protection; explicit CSRF tokens not implemented (not required for same-site cookie usage).

---

## Conclusion

The application implements appropriate security measures for a single-user, private English learning system. All critical security controls are in place: authentication, authorization, data privacy, API security, and dependency management. Production deployment requires additional hardening for audio storage (Supabase Storage implementation) and optional enhancements for multi-user scenarios (prompt injection filtering, spend caps).

**Recommendation**: Approved for local single-user use. Production deployment requires implementation of Supabase Storage for audio and optional security enhancements based on deployment context.

---

## Review Metadata

- **Reviewer**: Automated security review
- **Date**: 2026-10-06
- **Phase**: Phase 7 (Post-implementation)
- **Scope**: All code, configuration, and documentation
- **Methodology**: Code review, threat modeling, control mapping
