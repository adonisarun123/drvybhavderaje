import { describe, expect, it } from "vitest";
import { CLINIC_HOURS_SEED } from "@/lib/content";
import { formatDays, formatHours, groupSessions, openingHoursSpecification } from "@/lib/hours";

describe("clinic hours", () => {
  it("formats day lists as ranges and pairs", () => {
    expect(formatDays([1, 2, 3, 4, 5, 6])).toBe("Mon–Sat");
    expect(formatDays([1, 5])).toBe("Mon & Fri");
    expect(formatDays([2, 3, 4, 6])).toBe("Tue–Thu & Sat");
    expect(formatDays([0, 6])).toBe("Sat & Sun");
    expect(formatDays([3])).toBe("Wed");
  });

  it("renders the doctor's published hours (12 Nov 2026)", () => {
    expect(CLINIC_HOURS_SEED.whitefield!.map(formatHours)).toEqual(["Mon–Sat, 11:00 AM – 1:00 PM"]);
    expect(CLINIC_HOURS_SEED["hrbr-layout"]!.map(formatHours)).toEqual(["Mon & Fri, 3:00 PM – 5:00 PM"]);
    expect(CLINIC_HOURS_SEED.koramangala!.map(formatHours)).toEqual(["Tue–Thu & Sat, 2:00 PM – 5:00 PM"]);
  });

  it("groups one-row-per-weekday sessions by shared times", () => {
    const rows = [2, 3, 4, 6].map((weekday) => ({ weekday, startTime: "14:00:00", endTime: "17:00:00" }));
    expect(groupSessions(rows)).toEqual([{ days: [2, 3, 4, 6], start: "14:00", end: "17:00" }]);
    expect(groupSessions([...rows, { weekday: 1, startTime: "09:00:00", endTime: "10:00:00" }]).map(formatHours)).toEqual(["Mon, 9:00 AM – 10:00 AM", "Tue–Thu & Sat, 2:00 PM – 5:00 PM"]);
  });

  it("emits schema.org opening hours", () => {
    expect(openingHoursSpecification(CLINIC_HOURS_SEED["hrbr-layout"]!)).toEqual([{ "@type": "OpeningHoursSpecification", dayOfWeek: ["https://schema.org/Monday", "https://schema.org/Friday"], opens: "15:00", closes: "17:00" }]);
  });
});
