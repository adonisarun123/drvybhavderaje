# Setup, deployment and staff onboarding

## 1. Environment variables

Copy `.env.example` to `.env.local` (development) or set them in your host (Vercel → Project → Settings → Environment Variables).

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Neon connection string. Use the **pooled** host for the app. Server-side only. |
| `SITE_ORIGIN` | yes | `https://drvybhavderaje.com` in production; the preview URL for previews. Drives canonical URLs, sitemap, origin checks and auth cookies. |
| `BETTER_AUTH_SECRET` | yes | `openssl rand -base64 48`. Rotating it signs everyone out. |
| `ADMIN_SETUP_TOKEN` | first run only | Enables `/admin/setup` while **no** staff accounts exist. Delete it once the first administrator exists. |
| `ENQUIRIES_ENABLED` | yes | `"true"` to accept public consultation requests. Keep `"false"` until the database connection is verified and the privacy notice is approved. |
| `PUBLIC_INDEXING` | yes | `"true"` only on the approved production domain. Previews are always `noindex`. |
| `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` | optional | Enables email notifications. Without them the dashboard never claims a message was sent. |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | optional | Cloudflare Turnstile for the public form. Honeypot, timing check and DB-backed rate limits apply regardless. |
| `IP_HASH_SALT` | optional | Salt for the one-way IP hash stored with enquiries. |

Secrets are never read in client components; the only `NEXT_PUBLIC_` value is the Turnstile site key.

## 2. Database (Neon)

1. Create a Neon project (the one provisioned during the build is `dr-vybhav`, region `aws-ap-southeast-1`, Postgres 17).
2. `npm run db:migrate` — applies `drizzle/0000_init.sql`, `0001_occupancy_constraints.sql` (btree_gist extension, exclusion constraint, check constraints, reference sequences) and `0002_auth_rate_limit.sql`. The migrator records applied migrations in the `drizzle.__drizzle_migrations` table, so re-running is safe.
3. `npm run db:seed` — inserts the doctor record, the three Aesthetica Veda clinics exactly as published on the existing website, and default scheduling settings (public slots **off**, no working hours). Never seeds patients.

Schema changes: edit `lib/db/schema.ts`, run `npx drizzle-kit generate --name <change>`, review the generated SQL in `drizzle/`, commit it, then `npm run db:migrate` in each environment. Use `npx drizzle-kit generate --custom` for hand-written SQL.

Local development behind a corporate HTTPS proxy: the Neon WebSocket is tunnelled automatically when `HTTPS_PROXY` is set (`lib/db/websocket.ts`).

## 3. Running locally

```bash
npm ci
npm run dev
```

`npm run build && npm start` runs the production build. Note: on npm 11 with `NODE_ENV=production` exported in your shell, dev dependencies are skipped — use `NODE_ENV=development npm ci --include=dev`.

## 4. First administrator

1. Set `ADMIN_SETUP_TOKEN` to a long random value and deploy/restart.
2. Open `/admin/setup`, enter the token, your name, email and a password (≥ 10 characters).
3. You are signed in as the first administrator. Remove `ADMIN_SETUP_TOKEN` from the environment and redeploy — the page refuses to work once any account exists anyway.

There is no public registration and no default password.

## 5. Staff onboarding

Administrators invite staff from **Admin → Staff**:

1. Enter name, email, role (administrator or coordinator) and, for coordinators, any extra permissions
   (`availability:manage`, `clinics:manage`, `audit:view`).
2. The app shows a one-time invitation link (valid 72 hours). Share it with the person directly — no email is sent unless a provider is configured.
3. They open the link, set a password and land in the dashboard.

Other operations on the same page: change role, edit permissions, reset a password (signs them out everywhere), **deactivate** (bans the account and revokes all sessions immediately), reactivate.

Sessions last 12 hours of inactivity-aware validity and are stored in the database, so deactivation takes effect at once. Sign-in is rate-limited per IP (10 attempts / 5 minutes) and Better Auth's own rate limiting is DB-backed.

### Roles

| Capability | Administrator | Coordinator |
| --- | --- | --- |
| View/update enquiries, add notes, assign, set follow-up | ✓ | ✓ |
| Create / confirm / reschedule / cancel / mark appointments, holds | ✓ | ✓ |
| View calendar and availability rules | ✓ | ✓ |
| Change working hours, overrides, blocks, scheduling settings | ✓ | only with `availability:manage` |
| Edit clinic details | ✓ | only with `clinics:manage` |
| Invite / disable staff, change roles and permissions | ✓ | ✗ |
| Audit history | ✓ | only with `audit:view` |

Every server action and API route re-checks these on the server (`lib/auth/guard.ts`); the sidebar only hides what you cannot use.

## 6. Configure availability before enabling public times

1. **Admin → Availability → Scheduling rules**: appointment duration, buffers, travel buffer between clinics, minimum notice, horizon, hold length.
2. **Weekly working hours**: one row per clinic session (e.g. Monday Whitefield 10:00–13:00, Monday Koramangala 16:00–19:00). Gaps between sessions are breaks; add explicit recurring breaks if needed.
3. **Date-specific hours** for one-off changes; **Leave / blocks** for holidays and unavailable periods.
4. Tick **Show available times on the public appointment page** only when the hours are right. Until then the public form offers a general request plus phone/email.

## 6a. Running the test suites safely

`npm test` needs no database. `npm run test:db` and `npm run test:e2e` **write to `DATABASE_URL`**: they create
synthetic staff (`*@example.test`), "E2E …" patients and — for the e2e suite — weekly working hours and the
public-slots switch. Run them against a **Neon branch** (`neonctl branches create --name test` → use that
branch's connection string in `.env.test`), or run `npm run db:reset-test-data` afterwards, which removes the
synthetic records, deletes all weekly sessions/overrides and switches public slots off again.

## 7. Deployment (Vercel)

1. Import the repository, framework preset Next.js (defaults are fine). Node 22 runtime.
2. Add the environment variables above for Production and Preview. Previews: `PUBLIC_INDEXING=false`, `SITE_ORIGIN` = the preview URL (or leave the production value; cookies are host-scoped).
3. Run `npm run db:migrate` against the production database once (from your machine with the production `DATABASE_URL`, or as a one-off CI step) before the first deploy that needs the schema.
4. Deploy. Verify `/robots.txt` reports `Disallow: /` until `PUBLIC_INDEXING=true` on the production domain.
5. Point DNS at Vercel only when the practice has approved launch (see `docs/CONTENT-APPROVAL.md`). The legacy `.html` URLs redirect permanently (`next.config.ts`).

Headers set in `next.config.ts`: `X-Robots-Tag: noindex` and `Cache-Control: no-store` for `/admin/*`, plus baseline security headers for all routes.

## 8. Backups and retention

Neon keeps point-in-time history (24 h on this project by default — raise it in the Neon console for production). Enquiries and appointments are never hard-deleted by the app; cancellations and closures are status changes with an audit trail.

## 9. Troubleshooting

- **"DATABASE_URL is not configured"** — set it in the environment; the app refuses to simulate writes.
- **Public form shows "Online requests are not available"** — `ENQUIRIES_ENABLED` is not `"true"` or the database is down. The form never pretends to succeed.
- **"That time was taken by another booking a moment ago"** — two staff members booked the same minute; the database constraint rejected the second. Pick another time.
- **Block refused with a list of appointments** — resolve each listed appointment (reschedule/cancel) and retry; blocks never move or cancel bookings silently.
