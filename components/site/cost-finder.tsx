"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

/**
 * Filters the cost tables on /treatment-costs by condition or procedure name. The tables are rendered on the
 * server and stay complete without JavaScript; this only hides rows (and empty categories) that don't match.
 */
export function CostFinder({ suggestions }: { suggestions: string[] }) {
  const [q, setQ] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  function apply(value: string) {
    setQ(value);
    const term = value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll<HTMLElement>("[data-cost-row]").forEach((row) => {
      const hit = !term || (row.dataset.search ?? "").includes(term);
      row.hidden = !hit;
      if (hit) count++;
    });
    document.querySelectorAll<HTMLElement>("[data-cost-section]").forEach((section) => {
      section.hidden = !!term && !section.querySelector("[data-cost-row]:not([hidden])");
    });
    setShown(term ? count : null);
    return term ? count : 0;
  }

  /** Chips and Enter jump to the table, which sits below the hero; typing alone does not move the page. */
  function showResults(value: string) {
    if (apply(value) > 0) document.querySelector(".cost-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="cost-finder" role="search">
      <label htmlFor="cost-search" className="cost-finder-label">
        Find the cost for a condition or procedure
      </label>
      <div className="cost-finder-input">
        <Search size={18} aria-hidden="true" />
        <input id="cost-search" type="search" placeholder="e.g. Craniosynostosis, Cleft Palate, Rhinoplasty" value={q} onChange={(e) => apply(e.target.value)} onKeyDown={(e) => e.key === "Enter" && showResults(q)} autoComplete="off" />
        {q && (
          <button type="button" onClick={() => apply("")} aria-label="Clear search">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="cost-finder-chips" aria-label="Popular searches">
        {suggestions.map((s) => (
          <button type="button" key={s} onClick={() => showResults(s)} aria-pressed={q === s}>
            {s}
          </button>
        ))}
      </div>
      <p className="cost-finder-status" aria-live="polite">
        {shown === null ? "" : shown === 0 ? "No published cost matches that search — ask the clinic for an estimate." : `${shown} matching ${shown === 1 ? "procedure" : "procedures"}`}
      </p>
    </div>
  );
}
