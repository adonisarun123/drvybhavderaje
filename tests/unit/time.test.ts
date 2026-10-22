import { describe, expect, it } from "vitest";
import { fmtDateTime, localDate, localToUtc, startOfLocalDay, weekdayOf, endOfLocalDay } from "@/lib/time";
import { normalisePhone } from "@/lib/phone";

describe("IST ↔ UTC conversions", () => {
  it("converts a local IST time to the correct UTC instant", () => {
    // 09:00 IST = 03:30 UTC
    expect(localToUtc("2026-11-02", "09:00").toISOString()).toBe("2026-11-02T03:30:00.000Z");
  });
  it("handles the local-day boundary (00:30 IST is the previous UTC day)", () => {
    const d = localToUtc("2026-11-02", "00:30");
    expect(d.toISOString()).toBe("2026-11-01T19:00:00.000Z");
    expect(localDate(d)).toBe("2026-11-02");
    expect(startOfLocalDay("2026-11-02").toISOString()).toBe("2026-11-01T18:30:00.000Z");
    expect(endOfLocalDay("2026-11-02").toISOString()).toBe("2026-11-02T18:30:00.000Z");
  });
  it("labels display times with IST", () => {
    expect(fmtDateTime(new Date("2026-11-02T03:30:00.000Z"))).toBe("Mon 2 Nov 2026, 9:00 AM IST");
  });
  it("computes weekdays in local zone (2026-11-01 is a Sunday)", () => {
    expect(weekdayOf("2026-11-01")).toBe(0);
    expect(weekdayOf("2026-11-02")).toBe(1);
  });
});

describe("phone normalisation", () => {
  it("normalises Indian formats to E.164", () => {
    expect(normalisePhone("95355 81616")).toBe("+919535581616");
    expect(normalisePhone("09535581616")).toBe("+919535581616");
    expect(normalisePhone("+91 95355 81616")).toBe("+919535581616");
    expect(normalisePhone("919535581616")).toBe("+919535581616");
    expect(normalisePhone("+44 20 7946 0958")).toBe("+442079460958");
  });
  it("reads a national number against the visitor's chosen country", () => {
    expect(normalisePhone("07700 900123", "44")).toBe("+447700900123");
    expect(normalisePhone("7700 900123", "44")).toBe("+447700900123");
    expect(normalisePhone("(202) 555-0123", "1")).toBe("+12025550123");
    expect(normalisePhone("050 123 4567", "971")).toBe("+971501234567");
    expect(normalisePhone("+91 95355 81616", "44")).toBe("+919535581616");
    expect(normalisePhone("0044 7700 900123", "44")).toBe("+447700900123");
  });
  it("rejects junk", () => {
    expect(normalisePhone("abc")).toBeNull();
    expect(normalisePhone("12")).toBeNull();
  });
});
