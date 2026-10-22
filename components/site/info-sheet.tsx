import fs from "node:fs";
import path from "node:path";
import { FileDown } from "lucide-react";

/**
 * Link to a legacy patient-information PDF (served from /public at its original URL so existing links
 * keep working). Rendered only when the file is actually present, so the site never ships a dead link.
 * Server component — runs at build/render time.
 */
export function InfoSheet({ href, label = "Patient information sheet (PDF)" }: { href: string; label?: string }) {
  if (!sheetExists(href)) return null;
  return (
    <a className="sheet-link" href={href} target="_blank" rel="noopener noreferrer" download>
      <FileDown size={16} aria-hidden="true" />
      {label}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}

const cache = new Map<string, boolean>();

export function sheetExists(href: string): boolean {
  if (!href.startsWith("/")) return false;
  const hit = cache.get(href);
  if (hit !== undefined) return hit;
  let ok = false;
  try {
    ok = fs.existsSync(path.join(process.cwd(), "public", href));
  } catch {
    ok = false;
  }
  cache.set(href, ok);
  return ok;
}
