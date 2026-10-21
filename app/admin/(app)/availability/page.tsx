import { and, asc, eq, gte, isNull } from "drizzle-orm";
import { BlockForm, OverrideForm, RecurringBlockForm, RemoveButton, SettingsForm, WeeklySessionForm } from "@/components/admin/availability-forms";
import { can, requireStaff } from "@/lib/auth/guard";
import { getPrimaryDoctor, listClinics } from "@/lib/clinics";
import { db } from "@/lib/db/client";
import { blocks, dateOverrides, recurringBlocks, weeklySessions, clinics as clinicsTable } from "@/lib/db/schema";
import { loadPolicy } from "@/lib/scheduling/engine";
import { fmtDate, fmtDateTime, fmtLocalTime, WEEKDAY_NAMES, localDate } from "@/lib/time";

export default async function AvailabilityPage() {
  const user = await requireStaff();
  const allowed = can(user, "availability:manage");
  const doctor = await getPrimaryDoctor();
  if (!doctor) return <div className="alert warn">No doctor record. Run the seed script first.</div>;
  const clinics = (await listClinics()).filter((c) => c.active).map((c) => ({ id: c.id, name: c.name }));
  const policy = await db.transaction((tx) => loadPolicy(tx, doctor.id));
  const now = new Date();
  const [weekly, overrides, recurring, blockRows] = await Promise.all([
    db.select({ w: weeklySessions, clinicName: clinicsTable.name }).from(weeklySessions).leftJoin(clinicsTable, eq(clinicsTable.id, weeklySessions.clinicId)).where(and(eq(weeklySessions.doctorId, doctor.id), eq(weeklySessions.active, true))).orderBy(asc(weeklySessions.weekday), asc(weeklySessions.startTime)),
    db.select({ o: dateOverrides, clinicName: clinicsTable.name }).from(dateOverrides).leftJoin(clinicsTable, eq(clinicsTable.id, dateOverrides.clinicId)).where(and(eq(dateOverrides.doctorId, doctor.id), gte(dateOverrides.date, localDate(now)))).orderBy(asc(dateOverrides.date), asc(dateOverrides.startTime)),
    db.select().from(recurringBlocks).where(and(eq(recurringBlocks.doctorId, doctor.id), eq(recurringBlocks.active, true))).orderBy(asc(recurringBlocks.startTime)),
    db.select().from(blocks).where(and(eq(blocks.doctorId, doctor.id), isNull(blocks.deletedAt), gte(blocks.endAt, now))).orderBy(asc(blocks.startAt)),
  ]);
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Availability</h1>
          <p>
            Working hours establish potential availability; breaks, blocks, holds and confirmed appointments remove it. Unavailable periods always win over additional hours. Changing hours never moves existing bookings.
          </p>
        </div>
      </div>
      {!allowed && <div className="alert warn" style={{ marginBottom: 18 }}>You can view the availability rules but only administrators (or staff granted “availability:manage”) can change them.</div>}
      <div className="stack">
        <section className="card" id="settings">
          <h2>Scheduling rules</h2>
          {allowed ? (
            <SettingsForm doctorId={doctor.id} s={policy} />
          ) : (
            <dl className="kv">
              <dt>Appointment duration</dt><dd>{policy.defaultDurationMin} min</dd>
              <dt>Buffer / travel buffer</dt><dd>{policy.bufferMin} / {policy.travelBufferMin} min</dd>
              <dt>Public requests</dt><dd>{policy.publicSlotsEnabled ? "Published times shown" : "General request only"} · {policy.minNoticeHours} h notice · {policy.maxHorizonDays} days ahead</dd>
            </dl>
          )}
        </section>

        <section className="card" id="weekly">
          <h2>Weekly working hours</h2>
          {weekly.length === 0 ? (
            <div className="empty">No working hours configured yet. Until hours exist, the public site offers a general request only and staff can book with an outside-hours acknowledgement.</div>
          ) : (
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Clinic</th>
                    <th>Hours (IST)</th>
                    <th>Effective</th>
                    {allowed && <th />}
                  </tr>
                </thead>
                <tbody>
                  {weekly.map(({ w, clinicName }) => (
                    <tr key={w.id}>
                      <td>{WEEKDAY_NAMES[w.weekday]}</td>
                      <td>{clinicName}</td>
                      <td>
                        {fmtLocalTime(w.startTime)} – {fmtLocalTime(w.endTime)}
                      </td>
                      <td className="muted">
                        {w.effectiveFrom ?? "—"} → {w.effectiveTo ?? "ongoing"}
                      </td>
                      {allowed && (
                        <td>
                          <RemoveButton id={w.id} kind="weekly" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {allowed && <WeeklySessionForm doctorId={doctor.id} clinics={clinics} />}
        </section>

        <section className="card" id="overrides">
          <h2>Date-specific hours</h2>
          {overrides.length === 0 ? (
            <div className="empty">No upcoming date-specific hours.</div>
          ) : (
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Clinic</th>
                    <th>Hours (IST)</th>
                    <th>Mode</th>
                    <th>Note</th>
                    {allowed && <th />}
                  </tr>
                </thead>
                <tbody>
                  {overrides.map(({ o, clinicName }) => (
                    <tr key={o.id}>
                      <td>{o.date}</td>
                      <td>{clinicName}</td>
                      <td>
                        {fmtLocalTime(o.startTime)} – {fmtLocalTime(o.endTime)}
                      </td>
                      <td>{o.mode === "replace" ? "Replaces weekly" : "Additional"}</td>
                      <td className="muted">{o.note ?? ""}</td>
                      {allowed && (
                        <td>
                          <RemoveButton id={o.id} kind="override" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {allowed && <OverrideForm doctorId={doctor.id} clinics={clinics} />}
        </section>

        <section className="card" id="blocks">
          <h2>Leave, holidays &amp; blocked time</h2>
          {blockRows.length === 0 ? (
            <div className="empty">No upcoming blocks.</div>
          ) : (
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>When (IST)</th>
                    <th>Reason (private)</th>
                    <th>Recurring</th>
                    {allowed && <th />}
                  </tr>
                </thead>
                <tbody>
                  {blockRows.map((b) => (
                    <tr key={b.id}>
                      <td>{b.kind}</td>
                      <td>{b.allDay ? `${fmtDate(b.startAt)} → ${fmtDate(new Date(b.endAt.getTime() - 1))} (all day)` : `${fmtDateTime(b.startAt)} → ${fmtDateTime(b.endAt)}`}</td>
                      <td>{b.reason}</td>
                      <td>No</td>
                      {allowed && (
                        <td>
                          <RemoveButton id={b.id} kind="block" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {allowed && <BlockForm doctorId={doctor.id} clinics={clinics} />}
        </section>

        <section className="card" id="recurring">
          <h2>Breaks &amp; recurring blocks</h2>
          {recurring.length === 0 ? (
            <div className="empty">No recurring breaks or blocks.</div>
          ) : (
            <div className="table-wrap" style={{ marginBottom: 16 }}>
              <table className="data">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Days</th>
                    <th>Time (IST)</th>
                    <th>Period</th>
                    <th>Reason (private)</th>
                    {allowed && <th />}
                  </tr>
                </thead>
                <tbody>
                  {recurring.map((r) => (
                    <tr key={r.id}>
                      <td>{r.kind}</td>
                      <td>{r.weekdays.map((d) => WEEKDAY_NAMES[d]?.slice(0, 3)).join(", ")}</td>
                      <td>
                        {fmtLocalTime(r.startTime)} – {fmtLocalTime(r.endTime)}
                      </td>
                      <td className="muted">
                        {r.startsOn ?? "—"} → {r.endsOn ?? "ongoing"}
                      </td>
                      <td>{r.reason}</td>
                      {allowed && (
                        <td>
                          <RemoveButton id={r.id} kind="recurring" label="Stop" />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {allowed && <RecurringBlockForm doctorId={doctor.id} />}
        </section>
      </div>
    </>
  );
}
