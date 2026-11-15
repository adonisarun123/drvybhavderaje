import { describe, expect, it } from "vitest";
import { COST_ITEMS, bothRanges, costsForPath, toUsd } from "@/lib/costs";
import { SERVICE_PAGES } from "@/lib/content";
import { CRANIO_TYPES, cranioTypePath } from "@/lib/cranio-types";
import { SUB_PROCEDURES, subProcedurePath } from "@/lib/sub-procedures";

const PAGES = new Set([...SERVICE_PAGES.map((p) => p.path), ...SUB_PROCEDURES.map(subProcedurePath), ...CRANIO_TYPES.map((t) => cranioTypePath(t.slug))]);

describe("published costs", () => {
  it("carries every 'Publish: Yes' row of the doctor's sheet and nothing unmarked", () => {
    expect(COST_ITEMS).toHaveLength(51);
    for (const unpublished of ["Labiaplasty", "Hymenoplasty", "Vaginoplasty"]) expect(COST_ITEMS.some((c) => c.name.includes(unpublished))).toBe(false);
  });

  it("only points at pages that exist", () => {
    for (const c of COST_ITEMS) for (const p of c.paths) expect(PAGES.has(p), `${c.name} → ${p}`).toBe(true);
  });

  it("rounds USD to a sensible precision", () => {
    expect(toUsd(1200)).toBe(13);
    expect(toUsd(30000)).toBe(320);
    expect(toUsd(450000)).toBe(4800);
    expect(toUsd(1200000)).toBe(12800);
  });

  it("formats INR with Indian grouping and an approximate USD range", () => {
    const rhino = COST_ITEMS.find((c) => c.name === "Rhinoplasty")!;
    expect(bothRanges(rhino)).toBe("₹1,50,000 – ₹2,00,000 (about US$1,600 – US$2,150)");
  });

  it("puts a cost section and a cost FAQ with figures on every service page that has costs", () => {
    for (const p of SERVICE_PAGES.filter((s) => costsForPath(s.path).length)) {
      expect(p.sections.some((s) => s.id === "costs"), p.path).toBe(true);
      expect(p.faqs.some((f) => /cost/i.test(f.q) && f.a.includes("₹")), p.path).toBe(true);
    }
  });
});
