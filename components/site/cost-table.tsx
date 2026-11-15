import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { inrRange, usdRange, type CostItem } from "@/lib/costs";
import { ROUTES } from "@/lib/routes";

/** Published costs (lib/costs.ts) as a table: INR, the billing currency, with an approximate USD column. */
export function CostTable({ items, currentPath, caption }: { items: CostItem[]; currentPath?: string; caption?: string }) {
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
              <tr key={c.name}>
                <th scope="row">{href && href !== currentPath ? <Link href={href}>{c.name}</Link> : c.name}</th>
                <td>{inrRange(c)}</td>
                <td>{usdRange(c)}</td>
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
