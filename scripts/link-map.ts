/**
 * Writes docs/internal-link-map.csv — the editorial record of the site's internal links, generated
 * from the same data the pages render from (lib/links.tsx), so the record cannot drift from the site.
 *
 *   npx tsx scripts/link-map.ts
 *
 * Covers: Related Care grids, parent / child / sibling / see-also links, and the in-copy links the
 * autolinker adds on service pages. Not covered: header, footer, breadcrumbs, key-facts links, and
 * in-copy links on sub-procedure and Craniosynostosis type pages.
 */
import { writeFileSync } from "node:fs";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { childServices, getService, SERVICE_PAGES, type ServicePage } from "../lib/content";
import { CRANIO_PARENT, CRANIO_TYPES, cranioTypePath } from "../lib/cranio-types";
import { autolink, createLinkBudget, relatedServicesWithReason, TERM_LINKS } from "../lib/links";
import { ROUTES } from "../lib/routes";
import { SUB_PROCEDURES, subProcedurePath, subProceduresOf } from "../lib/sub-procedures";

const ORIGIN = "https://drvybhavderaje.com";

/** Editor's picks queried at the 12 Nov 2026 audit — the relationship needs the doctor's confirmation. */
const TO_CONFIRM = new Set([
  "ear-reconstruction-surgery-bangalore>craniosynostosis-surgery-bangalore",
  "chin-augmentation-surgery-bangalore>liposuction-surgery-bangalore",
  "liposuction-surgery-bangalore>facelift-surgery-bangalore",
  "head-and-neck-cancer-treatment>breast-plastic-surgeon-bangalore",
  "facial-injuries-and-fracture-treatments>hand-plastic-surgeon-bangalore",
  "face-plastic-surgery-bangalore>corrective-jaw-surgery-bangalore",
]);

type Row = { source: string; sourceType: string; dest: string; anchor: string; why: string; placement: string; schema: string; status: string };
const rows: Row[] = [];
const push = (r: Row) => rows.push(r);

const sourceType = (p: ServicePage) => (childServices(p.slug).length ? "Service hub" : "Service page");
const titleFor = (path: string) => SERVICE_PAGES.find((p) => p.path === path)?.shortTitle ?? path;

function contextual(text: string | undefined, budget: ReturnType<typeof createLinkBudget>, source: string, type: string, placement: string) {
  if (!text) return;
  const out: ReactNode = autolink(text, budget);
  if (!Array.isArray(out)) return;
  for (const n of out) {
    if (!isValidElement(n)) continue;
    const el = n as ReactElement<{ href: string; children: string }>;
    push({ source, sourceType: type, dest: el.props.href, anchor: el.props.children, why: "First mention of the topic in the copy", placement, schema: "—", status: "Live" });
  }
}

for (const page of SERVICE_PAGES) {
  const type = sourceType(page);
  const parent = page.parent ? getService(page.parent) : undefined;
  if (parent) push({ source: page.path, sourceType: type, dest: parent.path, anchor: parent.title, why: "Parent hub", placement: "Breadcrumb and 'part of' link", schema: "relatedLink", status: "Live" });
  for (const c of childServices(page.slug)) push({ source: page.path, sourceType: type, dest: c.path, anchor: c.shortTitle, why: "Procedure page of this hub", placement: "Procedure Pages list", schema: "relatedLink", status: "Live" });
  for (const r of relatedServicesWithReason(page)) {
    const why = { "editor-pick": "Editor's pick", "parent-hub": "Parent hub", sibling: "Procedure of the same hub", child: "Procedure page of this hub" }[r.reason];
    const confirm = r.reason === "editor-pick" && TO_CONFIRM.has(`${page.slug}>${r.page.slug}`);
    push({ source: page.path, sourceType: type, dest: r.page.path, anchor: r.page.shortTitle, why, placement: "Related Care grid", schema: "relatedLink", status: confirm ? "Live — doctor to confirm relationship" : "Live" });
  }
  // Cards inside sections that carry their own link (sub-procedure and condition-type pages).
  for (const s of page.sections) for (const it of s.items ?? []) if (it.href) push({ source: page.path, sourceType: type, dest: it.href.split("#")[0]!, anchor: it.title, why: "Detail page of this service", placement: `Section: ${s.heading}`, schema: "—", status: "Live" });
  // In-copy links, resolved in the template's reading order (app/(public)/[slug]/page.tsx).
  const budget = createLinkBudget(page.path, [ROUTES.about, ROUTES.locations, ROUTES.contact]);
  for (const p of page.intro) contextual(p, budget, page.path, type, "Introduction");
  for (const s of page.sections) {
    const where = `Section: ${s.heading}`;
    for (const p of s.body ?? []) contextual(p, budget, page.path, type, where);
    for (const b of s.bullets ?? []) contextual(b, budget, page.path, type, where);
    for (const it of s.items ?? []) contextual(it.text, budget, page.path, type, where);
    contextual(s.note, budget, page.path, type, where);
  }
  for (const f of page.faqs) contextual(f.a, budget, page.path, type, "FAQ answer");
}

for (const sp of SUB_PROCEDURES) {
  const source = subProcedurePath(sp);
  const parent = getService(sp.parent);
  if (parent) push({ source, sourceType: "Sub-procedure page", dest: parent.path, anchor: parent.shortTitle, why: "Parent service", placement: "Breadcrumb and Related section", schema: "relatedLink", status: "Live" });
  for (const s of subProceduresOf(sp.parent).filter((x) => x.slug !== sp.slug)) push({ source, sourceType: "Sub-procedure page", dest: subProcedurePath(s), anchor: s.shortTitle, why: "Procedure of the same service", placement: "Related section", schema: "relatedLink", status: "Live" });
  const seeAlso = sp.seeAlso ? getService(sp.seeAlso) : undefined;
  if (seeAlso) push({ source, sourceType: "Sub-procedure page", dest: seeAlso.path, anchor: seeAlso.shortTitle, why: "Editor's see-also", placement: "See also line", schema: "relatedLink", status: "Live" });
}

const cranioParent = getService(CRANIO_PARENT)!;
for (const t of CRANIO_TYPES) {
  const source = cranioTypePath(t.slug);
  push({ source, sourceType: "Condition type page", dest: cranioParent.path, anchor: "Craniosynostosis Surgery in Bangalore — Full Overview", why: "Parent service", placement: "Breadcrumb and Other Types section", schema: "relatedLink", status: "Live" });
  for (const s of CRANIO_TYPES.filter((x) => x.slug !== t.slug)) push({ source, sourceType: "Condition type page", dest: cranioTypePath(s.slug), anchor: s.shortTitle, why: "Other type of the same condition", placement: "Other Types section", schema: "relatedLink", status: "Live" });
}

const known = new Set<string>([...SERVICE_PAGES.map((p) => p.path), ...SUB_PROCEDURES.map((s) => subProcedurePath(s)), ...CRANIO_TYPES.map((t) => cranioTypePath(t.slug)), ...Object.values(ROUTES), ...TERM_LINKS.map((t) => t.href)]);
const unknown = rows.filter((r) => !known.has(r.dest));
if (unknown.length) throw new Error(`Link map has destinations that are not site routes: ${[...new Set(unknown.map((r) => r.dest))].join(", ")}`);

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const header = ["Source URL", "Source type", "Destination URL", "Destination", "Anchor text", "Why useful", "Visible placement", "Schema", "Status"];
const lines = rows.map((r) => [ORIGIN + r.source, r.sourceType, ORIGIN + r.dest, titleFor(r.dest), r.anchor, r.why, r.placement, r.schema, r.status].map(cell).join(","));
writeFileSync(new URL("../docs/internal-link-map.csv", import.meta.url), [header.join(","), ...lines].join("\n") + "\n");
console.log(`${rows.length} links written to docs/internal-link-map.csv (${rows.filter((r) => r.schema === "relatedLink").length} declared as relatedLink, ${rows.filter((r) => r.status !== "Live").length} to confirm)`);
