# Verification record

Environment: macOS (Node 24.15, npm 11.17) against the Neon project `dr-vybhav` (Postgres 17,
`aws-ap-southeast-1`). Build tooling also run in a Linux sandbox (Node 22) where the database is
**not** reachable — used to verify honest failure states.

## Static checks

| Check | Result |
| --- | --- |
| `npm run typecheck` (TypeScript strict, `noUncheckedIndexedAccess`) | pass |
| `npm run build` (Next.js 16 production build) | pass on macOS and Linux |
| `npm test` — 18 unit tests (session windows, overrides, recurring breaks, buffers/travel buffers, expired holds, slot generation, min-notice, IST↔UTC day boundaries, phone normalisation) | 18/18 pass |

## Database integration tests (`npm run test:db`, real Neon)

12/12 pass:

1. Confirmed appointment occupies time; overlapping and buffer-violating bookings rejected.
2. Requested appointments do not occupy time; confirming claims it; a second request on the same time cannot be confirmed.
3. Cross-clinic overlap and 60-minute travel buffer rejected.
4. **Three concurrent booking attempts for the same slot: exactly one succeeds**, the other two receive a conflict error.
5. **Direct SQL insert of an overlapping occupancy row is rejected by the exclusion constraint** (`occupancy_no_double_booking`, SQLSTATE 23P01) — the backstop works without the engine.
6. Reschedule releases the old span and claims the new one atomically; moving onto a taken slot fails and leaves the appointment unchanged.
7. Cancellation and no-show release the time; the slot can be re-booked.
8. Outside working hours requires an explicit acknowledgement; without it the booking is refused.
9. A block over existing appointments is refused and lists the affected appointments (nothing written); a partial-day block on free time is created and then prevents booking.
10. A recurring block over an existing booking is refused; once created it prevents booking.
11. A hold blocks booking until it expires; **expiry is enforced inside the booking transaction** (no background job ran), and the hold is marked `expired`.
12. The same idempotency key returns the existing appointment instead of creating a duplicate.

## End-to-end browser tests (`npm run test:e2e`, Playwright, real server + Neon)

See the latest run output in the summary delivered with the project. Scenarios:

- Anonymous: `/admin/*` redirects to sign-in (return path preserved); `/api/admin/calendar` → 401; `robots.txt` disallows all while `PUBLIC_INDEXING` is off.
- First-administrator setup via token; setup page closed afterwards; session expiry shown in IST.
- Administrator configures weekly hours (Mon–Fri, two clinics) and enables published times.
- Public enquiry with a published slot preference → reference shown with "not a confirmed appointment" wording → appears in the admin list as `new` with normalised phone.
- Enquiry → confirmed appointment (status `converted`, linked, IST times shown).
- Second booking on the confirmed time refused with the clashing reference; cross-clinic booking inside the travel buffer refused.
- Phone appointment: create → reschedule onto a taken time refused (original unchanged) → reschedule to a free time (history records it) → old time re-bookable → cancel with reason → time re-bookable.
- Requested appointment does not block; confirmation blocks; second request cannot be confirmed.
- Full-day leave: block over a booked day refused with the affected list; leave on a free day created; booking that day refused; public availability returns no slots.
- Coordinator (via invitation link): can use enquiries/appointments/calendar, cannot open Staff or Audit (Not permitted), cannot see availability editing forms; after deactivation their session is rejected immediately.
- Calendar renders appointments and blocks in IST; audit history contains the confirm/cancel entries.
- Admin and public pages render without horizontal overflow at 320 / 390 / 768 / 1024 / 1440 px (screenshots in `test-results/shots/`).

## Honest failure states (Linux sandbox, database unreachable)

- `POST /api/enquiries` → `503 {"ok":false,"code":"unavailable","message":"We could not save your request just now. Nothing has been sent …"}` — never a fake success.
- `POST /api/enquiries` from a foreign `Origin` → 403.
- `/admin/*` → redirect to sign-in; `/admin` responses carry `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`.
- Public pages still render using the verified seed clinic list when the database is down (logged server-side).

## Accessibility review performed

- Minimum text size raised to 12 px (secondary) / 14–16 px (body) from the prototype's 8–12 px; contrast kept to the navy/blue/slate palette (all ≥ 4.5:1 on white/pale backgrounds; the active nav button was fixed from blue-on-blue).
- Keyboard: skip link, visible `:focus-visible` outline, Escape closes the mobile menu and returns focus to the toggle, native `<details>` FAQs, labelled form controls with `aria-invalid`/`aria-describedby`, `role="alert"` errors that receive focus, `role="status"` success.
- Touch targets ≥ 44 px for navigation, buttons, slots and checkboxes.
- `prefers-reduced-motion` disables transitions and smooth scrolling.
- Zoom: no fixed heights on text containers; 200 % zoom equals the 768/390 px layouts which were checked for overflow.

## Not verified / outstanding

- **Email/SMS delivery** — no provider configured; code path logs `not_configured`. Resend path is implemented but untested against a live key.
- **Turnstile** — optional; not exercised.
- **Drag-and-drop reschedule on the calendar** — implemented with a confirm drawer and server validation; exercised manually in the browser, not in the automated suite.
- **Screen-reader testing** with VoiceOver/NVDA was not performed; the review above is structural.
- **Load testing** — not performed. The advisory lock serialises bookings per doctor, which is correct for a single-doctor practice but is the first thing to revisit if more providers are added.
- The live domain was not touched; no DNS or deployment to drvybhavderaje.com was made.
