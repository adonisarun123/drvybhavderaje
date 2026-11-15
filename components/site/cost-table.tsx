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
