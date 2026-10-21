"use client";

import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, EventDropArg, EventInput, EventSourceFuncArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import luxonPlugin from "@fullcalendar/luxon3";
import { cancelAppointmentAction, confirmAppointmentAction, markAppointmentAction, releaseHoldAction, rescheduleByInstantAction } from "@/lib/actions/appointments";
import type { ActionResult } from "@/lib/errors";
import type { CalendarEvent } from "@/lib/admin/queries";
import { ResultAlert } from "./ui";

interface Props {
  clinics: { id: string; name: string }[];
  initialDate?: string;
  initialView?: string;
  canManageAvailability: boolean;
}

const fmt = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) + " IST";

export function AdminCalendar({ clinics, initialDate, initialView, canManageAvailability }: Props) {
  const calRef = useRef<FullCalendar>(null);
  const [clinic, setClinic] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [proposed, setProposed] = useState<{ id: string; title: string; from: string; to: string; newStart: string; newEnd: string; revert: () => void } | null>(null);
  const [result, setResult] = useState<ActionResult<unknown> | null>(null);
  const [ack, setAck] = useState(false);
  const [pending, start] = useTransition();
  const [loadError, setLoadError] = useState<string | null>(null);
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 800;

  const fetchEvents = useCallback(
    async (arg: EventSourceFuncArg): Promise<EventInput[]> => {
      const params = new URLSearchParams({ start: arg.start.toISOString(), end: arg.end.toISOString() });
      if (clinic) params.set("clinic", clinic);
      if (status) params.set("status", status);
      const res = await fetch(`/api/admin/calendar?${params}`);
      if (!res.ok) {
        setLoadError("Could not load the schedule. Check your connection and try again.");
        return [];
      }
      setLoadError(null);
      const data = (await res.json()) as CalendarEvent[];
      return data.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        allDay: !!e.allDay,
        editable: !!e.editable,
        classNames: [`ev-${e.kind === "appointment" ? e.status : e.kind}`],
        extendedProps: e,
      }));
    },
    [clinic, status],
  );

  const refetch = () => calRef.current?.getApi().refetchEvents();

  const onEventClick = (arg: EventClickArg) => {
    arg.jsEvent.preventDefault();
    setResult(null);
    setAck(false);
    setSelected(arg.event.extendedProps as CalendarEvent);
  };

  const onMove = (arg: EventDropArg | EventResizeDoneArg) => {
    const ev = arg.event.extendedProps as CalendarEvent;
    if (ev.kind !== "appointment" || !arg.event.start || !arg.event.end) {
      arg.revert();
      return;
    }
    setResult(null);
    setAck(false);
    setProposed({ id: String(ev.meta?.appointmentId ?? ""), title: ev.title, from: ev.start, to: ev.end, newStart: arg.event.start.toISOString(), newEnd: arg.event.end.toISOString(), revert: arg.revert });
  };

  const commitMove = () => {
    if (!proposed) return;
    const p = proposed;
    start(async () => {
      const r = await rescheduleByInstantAction(p.id, p.newStart, p.newEnd, ack);
      setResult(r);
      if (r.ok) {
        setProposed(null);
        setAck(false);
        refetch();
      } else if (r.code !== "ack_required") {
        p.revert();
        setProposed(null);
      }
    });
  };

  const cancelMove = () => {
    proposed?.revert();
    setProposed(null);
    setResult(null);
  };

  const act = (fn: () => Promise<ActionResult<unknown>>) =>
    start(async () => {
      const r = await fn();
      setResult(r);
      if (r.ok) {
        setSelected(null);
        refetch();
      }
    });

  const legend = useMemo(
    () => [
      ["Confirmed", "#0759c7"],
      ["Requested", "#fff3d6"],
      ["Arrived", "#0c7fb8"],
      ["Completed", "#2f7d4a"],
      ["Hold", "#f3e8ff"],
      ["Block / leave", "#ffe9e5"],
      ["Recurring block", "#fff1ea"],
      ["Cancelled / no-show", "#e9eef4"],
    ],
    [],
  );

  return (
    <div className="stack">
      <div className="filters">
        <label>
          Clinic
          <select
            value={clinic}
            onChange={(e) => {
              setClinic(e.target.value);
              setTimeout(refetch, 0);
            }}
          >
            <option value="">All clinics</option>
            {clinics.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setTimeout(refetch, 0);
            }}
          >
            <option value="">Active + completed</option>
            <option value="all">Everything incl. cancelled</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="arrived">Arrived</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No-show</option>
          </select>
        </label>
        <Link className="btn" href="/admin/appointments/new">
          Add appointment
        </Link>
        {canManageAvailability && (
          <Link className="btn secondary" href="/admin/availability#blocks">
            Block time
          </Link>
        )}
      </div>
      <div className="legend" aria-label="Legend">
        {legend.map(([label, color]) => (
          <span key={label}>
            <i style={{ background: color, borderColor: "#bbb" }} /> {label}
          </span>
        ))}
      </div>
      {loadError && (
        <div className="alert error" role="alert">
          {loadError}
        </div>
      )}
      <div className="calendar-wrap">
        <FullCalendar
          ref={calRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, luxonPlugin]}
          timeZone="Asia/Kolkata"
          initialView={initialView ?? (isNarrow ? "listWeek" : "timeGridWeek")}
          initialDate={initialDate}
          headerToolbar={{ left: "prev,next today", center: "title", right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek" }}
          buttonText={{ today: "Today", day: "Day", week: "Week", month: "Month", list: "Agenda" }}
          views={{ listWeek: { buttonText: "Agenda" } }}
          events={fetchEvents}
          eventClick={onEventClick}
          editable
          eventDurationEditable
          eventDrop={onMove}
          eventResize={onMove}
          nowIndicator
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          slotDuration="00:15:00"
          height="auto"
          firstDay={1}
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          slotLabelFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          dayMaxEvents={4}
          noEventsContent="No appointments, holds or blocks in this period."
        />
      </div>
      <p className="help">All times shown in IST (Asia/Kolkata) regardless of your device settings. Drag a confirmed or requested appointment to propose a new time; nothing changes until you confirm.</p>

      {proposed && (
        <>
          <div className="drawer-backdrop" onClick={cancelMove} />
          <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="move-h">
            <h2 id="move-h">Confirm reschedule</h2>
            <p className="help">{proposed.title}</p>
            <dl className="kv" style={{ margin: "14px 0" }}>
              <dt>From</dt>
              <dd>{fmt(proposed.from)}</dd>
              <dt>To</dt>
              <dd>
                <strong>{fmt(proposed.newStart)}</strong> → {fmt(proposed.newEnd)}
              </dd>
            </dl>
            <ResultAlert result={result} />
            {result && !result.ok && result.code === "ack_required" && (
              <label className="check" style={{ display: "flex", gap: 10, alignItems: "center", margin: "10px 0", fontSize: 14 }}>
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} style={{ width: 20, height: 20, minHeight: 20 }} /> Confirmed with the doctor — book outside published hours
              </label>
            )}
            <div className="inline-actions" style={{ marginTop: 12 }}>
              <button className="btn" disabled={pending} onClick={commitMove}>
                {pending ? "Checking…" : "Save new time"}
              </button>
              <button className="btn secondary" disabled={pending} onClick={cancelMove}>
                Keep original
              </button>
            </div>
          </div>
        </>
      )}

      {selected && !proposed && (
        <>
          <div className="drawer-backdrop" onClick={() => setSelected(null)} />
          <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="sel-h">
            <button className="btn secondary sm close" onClick={() => setSelected(null)} aria-label="Close">
              ✕
            </button>
            <h2 id="sel-h">{selected.title}</h2>
            <p className="help">
              {fmt(selected.start)} → {fmt(selected.end)}
            </p>
            <ResultAlert result={result} />
            {selected.kind === "appointment" && (
              <>
                <dl className="kv" style={{ margin: "14px 0" }}>
                  <dt>Status</dt>
                  <dd>{selected.status}</dd>
                  <dt>Reference</dt>
                  <dd>{String(selected.meta?.reference ?? "")}</dd>
                  <dt>Phone</dt>
                  <dd>
                    <a href={`tel:${String(selected.meta?.phone ?? "")}`}>{String(selected.meta?.phone ?? "")}</a>
                  </dd>
                  <dt>Clinic</dt>
                  <dd>{selected.clinicName}</dd>
                </dl>
                {result && !result.ok && result.code === "ack_required" && (
                  <label className="check" style={{ display: "flex", gap: 10, alignItems: "center", margin: "10px 0", fontSize: 14 }}>
                    <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} style={{ width: 20, height: 20, minHeight: 20 }} /> Confirmed with the doctor — outside published hours
                  </label>
                )}
                <div className="inline-actions">
                  <Link className="btn" href={`/admin/appointments/${String(selected.meta?.appointmentId)}`}>
                    Open details
                  </Link>
                  {selected.status === "requested" && (
                    <button className="btn" disabled={pending} onClick={() => act(() => confirmAppointmentAction(String(selected.meta?.appointmentId), ack))}>
                      Confirm
                    </button>
                  )}
                  {selected.status === "confirmed" && (
                    <>
                      <button className="btn secondary" disabled={pending} onClick={() => act(() => markAppointmentAction(String(selected.meta?.appointmentId), "arrived"))}>
                        Arrived
                      </button>
                      <button className="btn secondary" disabled={pending} onClick={() => act(() => markAppointmentAction(String(selected.meta?.appointmentId), "no_show"))}>
                        No-show
                      </button>
                    </>
                  )}
                  {(selected.status === "confirmed" || selected.status === "arrived") && (
                    <button className="btn secondary" disabled={pending} onClick={() => act(() => markAppointmentAction(String(selected.meta?.appointmentId), "completed"))}>
                      Completed
                    </button>
                  )}
                  {(selected.status === "requested" || selected.status === "confirmed" || selected.status === "arrived") && (
                    <button
                      className="btn danger"
                      disabled={pending}
                      onClick={() => {
                        const reason = window.prompt("Reason for cancellation (required):");
                        if (reason && reason.trim()) act(() => cancelAppointmentAction(String(selected.meta?.appointmentId), reason));
                      }}
                    >
                      Cancel…
                    </button>
                  )}
                </div>
              </>
            )}
            {selected.kind === "hold" && (
              <>
                <p>Hold expires {fmt(String(selected.meta?.expiresAt ?? ""))}.</p>
                <div className="inline-actions">
                  <Link className="btn" href={`/admin/appointments/new?start=${encodeURIComponent(selected.start)}${selected.clinicId ? `&clinic=${selected.clinicId}` : ""}`}>
                    Book this time
                  </Link>
                  <button className="btn secondary" disabled={pending} onClick={() => act(() => releaseHoldAction(String(selected.meta?.holdId)))}>
                    Release hold
                  </button>
                </div>
              </>
            )}
            {(selected.kind === "block" || selected.kind === "recurring") && (
              <>
                <p>The doctor is unavailable during this period.</p>
                {canManageAvailability && (
                  <Link className="btn secondary" href="/admin/availability#blocks">
                    Manage blocks
                  </Link>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
