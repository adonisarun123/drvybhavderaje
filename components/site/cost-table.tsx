import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { inrRange, usdRange, type CostItem } from "@/lib/costs";
import { ROUTES } from "@/lib/routes";

const strip = (s: string) => s.replace(/ \+ GST$/, "");

/**
 * Published costs (lib/costs.ts) as a table: INR, the billing currency, with an approximate USD column.
 * On phones each row becomes a small card (labels come from data-label). Pass `searchTerms` to make rows
 * filterable by the cost finder on /treatment-costs.
 */
export function CostTable({ items, currentPath, caption, searchTerms }: { items: CostItem[]; currentPath?: string; caption?: string; searchTerms?: (c: CostItem) => string }) {
  return (
    <div className="cost-table-wrap">
      <table className="cost-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">Procedure</th>
            <th scope="col">Typical Cost (INR)</th>
            <th scope="col">Approx. (USD)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c) => {
            const href = c.paths[0];
            return (
              <tr key={c.name} data-cost-row={searchTerms ? "" : undefined} data-search={searchTerms ? searchTerms(c).toLowerCase() : undefined}>
                <th scope="row">
                  {href && href !== currentPath ? <Link href={href}>{c.name}</Link> : c.name}
                  {c.gst && <span className="cost-badge">+ GST</span>}
                </th>
                <td data-label="INR">{strip(inrRange(c))}</td>
                <td data-label="USD (approx.)">{strip(usdRange(c))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AllCostsLink() {
  return (
    <p>
      <Link className="text-link" href={ROUTES.costs}>
        All Treatment Costs in INR and USD <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </p>
  );
}

export interface PriceGroup {
  id: string;
  label: string;
  intro: string;
  items: CostItem[];
  /** Related pages shown after the intro. */
  links: { href: string; label: string }[];
  linksLabel?: string;
}

const billedSeparately = (c: CostItem) => {
  const text = (c.notIncluded ?? []).join(", ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
};

/**
 * The whole price list as ONE table for /treatment-costs: the same four columns for every category, so the
 * figures line up down the page. Each category is its own <tbody> with a heading band; what is billed
 * separately sits in its own column instead of in notes under each table. The cost finder hides rows
 * (data-cost-row) and whole categories (data-cost-section). On phones each row becomes a small card.
 */
export function PriceList({ groups, searchTerms }: { groups: PriceGroup[]; searchTerms: (c: CostItem) => string }) {
  return (
    <table className="price-list">
      <caption>Typical treatment costs in Indian rupees, with approximate US dollars and what is billed separately</caption>
      <colgroup>
        <col className="c-name" />
        <col className="c-inr" />
        <col className="c-usd" />
        <col className="c-extra" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">Procedure</th>
          <th scope="col">Typical Cost (INR)</th>
          <th scope="col">Approx. (USD)</th>
          <th scope="col">Billed Separately</th>
        </tr>
      </thead>
      {groups.map((g) => {
        const gst = g.items.some((c) => c.gst);
        return (
          <tbody key={g.id} data-cost-section="">
            <tr className="cost-band">
              <th colSpan={4} scope="colgroup">
                <div className="cost-band-head">
                  <h2 id={g.id}>{g.label}</h2>
                  <span className="cost-band-meta">
                    {g.items.length} {g.items.length === 1 ? "item" : "items"}
                    {gst && <span className="cost-badge">+ GST</span>}
                  </span>
                </div>
                <p className="cost-band-intro">
                  {g.intro}
                  {g.links.length > 0 && (
                    <span className="cost-band-links">
                      {g.linksLabel ?? "Read about:"}{" "}
                      {g.links.map((l, i) => (
                        <span key={l.href}>
                          {i > 0 && ", "}
                          <Link href={l.href}>{l.label}</Link>
                        </span>
                      ))}
                    </span>
                  )}
                </p>
              </th>
            </tr>
            {g.items.map((c) => {
              const href = c.paths[0];
              const extra = billedSeparately(c);
              return (
                <tr key={c.name} data-cost-row="" data-search={searchTerms(c).toLowerCase()}>
                  <th scope="row">
                    {href ? <Link href={href}>{c.name}</Link> : c.name}
                    {c.note && <span className="price-row-note">{c.note}.</span>}
                  </th>
                  <td className="price-inr" data-label="INR">
                    {strip(inrRange(c))}
                  </td>
                  <td className="price-usd" data-label="USD (approx.)">
                    {strip(usdRange(c))}
                  </td>
                  <td className={extra ? "price-extra" : "price-extra price-none"} data-label="Billed separately">
                    {extra || <span aria-label="Nothing listed">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        );
      })}
    </table>
  );
}
