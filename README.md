# Dr Vybhav Deraje — website and clinic administration platform

Next.js 16 (App Router) · TypeScript strict · Neon PostgreSQL (Drizzle ORM) · Better Auth · FullCalendar.

Public website for Dr Vybhav Deraje (craniofacial & plastic surgeon, Bengaluru) plus a secure `/admin`
area for staff to manage consultation enquiries, appointments, the doctor's calendar and availability.

| Area | Where |
| --- | --- |
| Public pages | `app/(public)/…` — `/`, `/about`, `/craniosynostosis`, `/cosmetic-surgery`, `/cleft-care`, `/reconstructive-surgery`, `/patient-resources`, `/locations`, `/appointment`, `/privacy`, 404 |
| Admin | `app/admin/(app)/…` — dashboard, enquiries, appointments, calendar, availability, clinics, staff, audit |
| Auth pages | `app/admin/(auth)/…` — login, first-run setup, invitation acceptance |
| APIs | `app/api/enquiries` (public POST), `app/api/availability` (public GET), `app/api/admin/calendar` (staff), `app/api/auth/*` (Better Auth) |
| Scheduling engine | `lib/scheduling/engine.ts` (transactions + locks), `lib/scheduling/availability.ts` (pure rules) |
| Schema & migrations | `lib/db/schema.ts`, `drizzle/*.sql` |
| Design reference | `design-reference/` — the supplied HTML prototype (not served) |

## Quick start

```bash
cp .env.example .env.local        # fill in DATABASE_URL, SITE_ORIGIN, BETTER_AUTH_SECRET, ADMIN_SETUP_TOKEN
npm ci
npm run db:migrate                 # applies drizzle/*.sql to the database
npm run db:seed                    # doctor + the three published clinics + default settings (no patients)
npm run dev                        # http://localhost:3000
```

Then open `http://localhost:3000/admin/setup`, enter the `ADMIN_SETUP_TOKEN` and create the first administrator.
Remove `ADMIN_SETUP_TOKEN` from the environment afterwards. Full instructions: [docs/SETUP.md](docs/SETUP.md).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run build` / `npm start` | Next.js development / production build / production server |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint (next/core-web-vitals + typescript) |
| `npm run db:migrate` | Apply SQL migrations in `drizzle/` (tracks applied migrations in the `drizzle` schema) |
| `npm run db:seed` | Idempotent seed of doctor, clinics and scheduling settings |
| `npm test` | Unit tests (availability rules, timezone, phone normalisation) — no database needed |
| `npm run test:db` | Booking-engine integration tests against `DATABASE_URL` (concurrency, constraints, holds, blocks) |
| `npm run test:e2e` | Playwright end-to-end workflows against a running server (`E2E_BASE_URL`, default `http://localhost:3000`) |

## Documentation

- [docs/SETUP.md](docs/SETUP.md) — environment, database, deployment (Vercel), staff onboarding, operations
- [docs/SCHEDULING.md](docs/SCHEDULING.md) — availability rules, precedence, double-booking protection, timezone model
- [docs/SEO-MIGRATION.md](docs/SEO-MIGRATION.md) — legacy URL inventory and redirect map, metadata, structured data, indexing controls
- [docs/CONTENT-APPROVAL.md](docs/CONTENT-APPROVAL.md) — items that need the practice's sign-off before launch
- [docs/VERIFICATION.md](docs/VERIFICATION.md) — what was tested, how, and what remains unverified
