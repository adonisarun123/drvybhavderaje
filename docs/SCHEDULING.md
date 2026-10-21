# Scheduling model

## Entities

| Table | Purpose |
| --- | --- |
| `doctors`, `clinics`, `scheduling_settings` | Provider, locations, rules (duration, slot step, buffers, travel buffer, notice, horizon, hold length, public slots switch) |
| `weekly_sessions` | Recurring working sessions: weekday, clinic, local start/end, timezone, effective date range. Several per day = multiple sessions. |
| `date_overrides` | Date-specific sessions. `mode = replace` discards that day's weekly sessions; `mode = add` adds to them. |
| `recurring_blocks` | Breaks and recurring commitments: weekdays, local time range, optional start/end dates, private reason. |
| `blocks` | Concrete leave/holiday/blocks as UTC instants (`all_day` flag), private reason, creator. Soft-deleted. |
| `appointments` | Patient/contact name, phone, optional email, clinic, doctor, UTC start/end, status, source, operational notes, cancellation reason, idempotency key, who did what. |
| `holds` | Tentative reservations with an explicit `expires_at`. |
| `occupancy` | **The authoritative occupancy table.** One row per confirmed/arrived/completed appointment, active hold and concrete block, with a `tstzrange` span. |
| `audit_events` | Who did what, when, with a compact diff. |

## Rule precedence

1. **Potential availability** = weekly sessions for the local weekday (unless a `replace` override exists for that date) + `add` overrides for that date, each restricted to its clinic.
2. **Removed from availability** = recurring blocks, concrete blocks, active (unexpired) holds, appointments in `confirmed`/`arrived`/`completed` status, and the configured buffers around them.
3. **Unavailable always wins**: a block on a date with additional hours still blocks.
4. `requested` appointments do not occupy time; they only reserve time if staff attach a hold. Confirming a request claims the time and fails if it is no longer free.
5. `cancelled` and `no_show` release their time. `completed` keeps its (historical) occupancy — past slots are not re-offered.

Public visitors only see whether a time is available; reasons are never exposed (`/api/availability` returns start/end instants only).

## Buffers

- Same clinic: `buffer_min` either side of an existing appointment/hold.
- Different clinics: `travel_buffer_min` either side. The check always runs across **all** clinics for the doctor, so a Whitefield booking cannot be placed within the travel buffer of a Koramangala booking.
- Blocks are hard boundaries without buffers.

## Double-booking protection (defence in depth)

1. **Per-doctor advisory lock** — every mutating operation runs in `withDoctorLock()`: a transaction that first executes `pg_advisory_xact_lock(hashtext('doctor:<id>'))`. Concurrent bookings, confirmations, reschedules, hold creation and block creation for the same doctor are serialised, so the availability check and the write happen atomically.
2. **Expired holds purged inside the transaction** — `purgeExpiredHolds()` runs before every check; there is no reliance on a background job.
3. **Re-check at commit time** — the engine loads rules + occupancy inside the lock and re-evaluates, regardless of what the calendar showed when the user opened it.
4. **Database backstop** — `occupancy_no_double_booking EXCLUDE USING gist (doctor_id WITH =, span WITH &&) WHERE kind IN ('appointment','hold')`. Even a bug that bypassed the engine cannot produce two overlapping appointment/hold rows; the error (`23P01`) is translated into a conflict message.
5. **Atomic reschedule** — the occupancy row is updated with a single `UPDATE … SET span = …`, so the old time is released and the new time claimed in one statement; if the new span conflicts, nothing changes.
6. **Idempotency** — appointments and enquiries carry a unique idempotency key generated when the form opens, so a double-click or retry returns the existing record instead of creating a duplicate.

Blocks vs appointments: creating or editing a block (or recurring block, checked 400 days ahead) that overlaps any requested/confirmed appointment or active hold is refused with the affected list. Appointments are never moved, cancelled or deleted implicitly. Changing working hours never touches bookings; the UI lists future appointments that now fall outside the hours.

Booking outside published hours is allowed for staff only with an explicit acknowledgement (`outside_hours_ack`), recorded on the appointment. Public requests never bypass this.

## Timezone model

- Practice timezone: `Asia/Kolkata` (constant `PRACTICE_TZ`), never the browser's zone.
- Appointments, holds, blocks and occupancy spans are stored as UTC instants (`timestamptz`).
- Weekly sessions, overrides and recurring blocks store local times plus their timezone; `localToUtc()` converts them per calendar date, which also handles DST-free IST correctly across UTC day boundaries (00:30 IST = previous UTC day).
- All display helpers label times with **IST**; the admin calendar is pinned to `Asia/Kolkata` via the FullCalendar Luxon plugin; `datetime-local` inputs are interpreted as IST on the server.
