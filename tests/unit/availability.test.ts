import { describe, expect, it } from "vitest";
import { computeSlots, expandRecurringBlocks, findConflicts, isWithinSessions, sessionWindows, subtract, type SchedulingPolicy } from "@/lib/scheduling/availability";
import { localToUtc } from "@/lib/time";

const TZ = "Asia/Kolkata";
const WF = "clinic-whitefield";
const KM = "clinic-koramangala";
const policy: SchedulingPolicy = { defaultDurationMin: 30, slotStepMin: 30, bufferMin: 10, travelBufferMin: 60, minNoticeHours: 0, maxHorizonDays: 90, timezone: TZ };
const now = new Date("2026-11-01T00:00:00Z");
// 2026-11-02 is a Monday
const weekly = [
  { clinicId: WF, weekday: 1, startTime: "10:00", endTime: "13:00", timezone: TZ },
  { clinicId: KM, weekday: 1, startTime: "16:00", endTime: "19:00", timezone: TZ },
];

describe("session windows", () => {
  it("builds weekly windows in UTC for the local weekday", () => {
    const w = sessionWindows("2026-11-02", "2026-11-02", weekly, [], TZ);
    expect(w).toHaveLength(2);
    expect(w[0]!.start.toISOString()).toBe("2026-11-02T04:30:00.000Z"); // 10:00 IST
    expect(w[1]!.clinicId).toBe(KM);
  });
  it("replace override discards weekly sessions, add override keeps them", () => {
    const replaced = sessionWindows("2026-11-02", "2026-11-02", weekly, [{ clinicId: WF, date: "2026-11-02", startTime: "09:00", endTime: "11:00", timezone: TZ, mode: "replace" }], TZ);
    expect(replaced).toHaveLength(1);
    expect(replaced[0]!.source).toBe("override");
    const added = sessionWindows("2026-11-02", "2026-11-02", weekly, [{ clinicId: WF, date: "2026-11-02", startTime: "14:00", endTime: "15:00", timezone: TZ, mode: "add" }], TZ);
    expect(added).toHaveLength(3);
  });
  it("respects effective date ranges", () => {
    const w = sessionWindows("2026-11-02", "2026-11-02", [{ ...weekly[0]!, effectiveFrom: "2026-12-01" }], [], TZ);
    expect(w).toHaveLength(0);
  });
});

describe("conflicts", () => {
  const slot = { clinicId: WF, start: localToUtc("2026-11-02", "10:00"), end: localToUtc("2026-11-02", "10:30") };
  it("flags concrete blocks", () => {
    const c = findConflicts(slot, { blocks: [{ id: "b1", startAt: localToUtc("2026-11-02", "10:15"), endAt: localToUtc("2026-11-02", "12:00"), reason: "Leave", kind: "leave" }], recurring: [], occupied: [], policy, now });
    expect(c.map((x) => x.kind)).toEqual(["block"]);
  });
  it("flags recurring breaks on matching weekdays only", () => {
    const rule = { id: "r1", weekdays: [1], startTime: "10:00", endTime: "10:20", timezone: TZ, reason: "Ward round", kind: "break" };
    expect(findConflicts(slot, { blocks: [], recurring: [rule], occupied: [], policy, now })).toHaveLength(1);
    expect(findConflicts(slot, { blocks: [], recurring: [{ ...rule, weekdays: [2] }], occupied: [], policy, now })).toHaveLength(0);
    expect(findConflicts(slot, { blocks: [], recurring: [{ ...rule, endsOn: "2026-10-31" }], occupied: [], policy, now })).toHaveLength(0);
  });
  it("applies same-clinic buffer and cross-clinic travel buffer", () => {
    const prev = { id: "a1", kind: "appointment" as const, clinicId: WF, startAt: localToUtc("2026-11-02", "09:25"), endAt: localToUtc("2026-11-02", "09:55") };
    // 5 minutes gap < 10 min buffer → buffer conflict
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [prev], policy, now })[0]!.kind).toBe("buffer");
    // different clinic 30 min gap < 60 min travel buffer → travel conflict
    const other = { ...prev, clinicId: KM, startAt: localToUtc("2026-11-02", "09:00"), endAt: localToUtc("2026-11-02", "09:30") };
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [other], policy, now })[0]!.kind).toBe("travel_buffer");
    // same clinic 30 min gap → fine
    const fine = { ...prev, startAt: localToUtc("2026-11-02", "09:00"), endAt: localToUtc("2026-11-02", "09:30") };
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [fine], policy, now })).toHaveLength(0);
  });
  it("ignores expired holds and excluded ids", () => {
    const hold = { id: "h1", kind: "hold" as const, clinicId: WF, startAt: slot.start, endAt: slot.end, expiresAt: new Date(now.getTime() - 1) };
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [hold], policy, now })).toHaveLength(0);
    const live = { ...hold, expiresAt: new Date(now.getTime() + 60_000) };
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [live], policy, now })).toHaveLength(1);
    expect(findConflicts(slot, { blocks: [], recurring: [], occupied: [live], policy, now }, { holdId: "h1" })).toHaveLength(0);
  });
  it("isWithinSessions requires the same clinic", () => {
    const w = sessionWindows("2026-11-02", "2026-11-02", weekly, [], TZ);
    expect(isWithinSessions(slot, w)).toBe(true);
    expect(isWithinSessions({ ...slot, clinicId: KM }, w)).toBe(false);
  });
});

describe("slots", () => {
  it("produces slots inside sessions minus occupancy, buffers and blocks", () => {
    const occupied = [{ id: "a1", kind: "appointment" as const, clinicId: WF, startAt: localToUtc("2026-11-02", "11:00"), endAt: localToUtc("2026-11-02", "11:30") }];
    const slots = computeSlots({ fromDate: "2026-11-02", toDate: "2026-11-02", weekly, overrides: [], recurring: [], blocks: [], occupied, policy, now, clinicId: WF });
    const times = slots.map((s) => s.start.toISOString().slice(11, 16));
    // 10:00 IST = 04:30Z. Slots: 10:00, 10:30 (ends 11:00 → 10 min buffer against 11:00 appt → removed), 11:30 (needs buffer → removed), 12:00, 12:30
    expect(times).toEqual(["04:30", "06:30", "07:00"]);
  });
  it("hides slots before minimum notice", () => {
    const soonNow = localToUtc("2026-11-02", "09:30");
    const slots = computeSlots({ fromDate: "2026-11-02", toDate: "2026-11-02", weekly, overrides: [], recurring: [], blocks: [], occupied: [], policy: { ...policy, minNoticeHours: 2 }, now: soonNow, clinicId: WF });
    expect(slots[0]!.start.toISOString()).toBe(localToUtc("2026-11-02", "11:30").toISOString());
  });
  it("subtract splits windows correctly", () => {
    const r = subtract({ start: new Date(0), end: new Date(100) }, [{ start: new Date(20), end: new Date(40) }, { start: new Date(90), end: new Date(200) }]);
    expect(r.map((x) => [x.start.getTime(), x.end.getTime()])).toEqual([[0, 20], [40, 90]]);
  });
  it("expands recurring blocks across a UTC day boundary", () => {
    const rules = [{ id: "r", weekdays: [1], startTime: "00:15", endTime: "01:00", timezone: TZ, reason: "x", kind: "block" }];
    const out = expandRecurringBlocks(rules, new Date("2026-11-01T18:00:00Z"), new Date("2026-11-01T20:00:00Z"), TZ);
    expect(out).toHaveLength(1);
    expect(out[0]!.start.toISOString()).toBe("2026-11-01T18:45:00.000Z");
  });
});

describe("slotDates", () => {
  it("groups slot instants into distinct local dates in the practice zone, sorted", async () => {
    const { slotDates } = await import("@/lib/scheduling/availability");
    const slots = [
      { start: localToUtc("2026-11-03", "10:00", TZ) },
      { start: localToUtc("2026-11-02", "10:30", TZ) },
      { start: localToUtc("2026-11-02", "10:00", TZ) },
      // 00:30 IST on 4 Nov is 19:00 UTC on 3 Nov — must be reported as 4 Nov.
      { start: localToUtc("2026-11-04", "00:30", TZ) },
    ];
    expect(slotDates(slots, TZ)).toEqual(["2026-11-02", "2026-11-03", "2026-11-04"]);
  });
});
