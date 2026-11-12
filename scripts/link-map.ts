/**
 * Writes docs/internal-link-map.csv — the record of every internal link on the public site.
 *
 * It reads the pages as rendered, so the map is what a visitor and a crawler actually get: every
 * <a href> to another page of the site, where it sits on the page, whether the page also declares it
 * as `relatedLink` in its structured data, and whether the destination answers 200.
 *
 *   npm run build && npm run start          # or point at any deployment
 *   npx tsx scripts/link-map.ts [base-url]  # default http://localhost:3000
 *
 * Header and footer links are identical on every page and are listed once, as "Every page".
 * Links to other sites, phone, email and WhatsApp links are not internal links and are left out.
 */
import { writeFileSync } from "node:fs";
import { childServices, getService, SERVICE_PAGES } from "../lib/content";
import { CRANIO_TYPES, cranioTypePath } from "../lib/cranio-types";
import { schemaTestGroup } from "../lib/link-experiment";
import { relatedServicesWithReason, TERM_LINKS } from "../lib/links";
import { ROUTES } from "../lib/routes";
import { SUB_PROCEDURES, subProcedurePath } from "../lib/sub-procedures";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://drvybhavderaje.com";

type Zone = "header" | "footer" | "main";
interface Found {
  href: string;
  anchor: string;
  zone: Zone;
  placement: string;
  kind: "breadcrumb" | "glance" | "related" | "practice" | "contact" | "cta" | "faq" | "copy" | "other";
}

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const attr = (attrs: string, name: string) => new RegExp(`\\b${name}="([^"]*)"`).exec(attrs)?.[1];

/** Walks the page's tags in order, keeping the stack of open elements, and returns every link with its placement. */
function linksIn(html: string): Found[] {
  const body = html.slice(html.indexOf("<body")).replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<svg[\s\S]*?<\/svg>/g, "");
  const stack: { tag: string; cls: string; attrs: string }[] = [];
  const out: Found[] = [];
  let heading = "";
  const tagRe = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  for (let m = tagRe.exec(body); m; m = tagRe.exec(body)) {
    const tag = m[2]!.toLowerCase();
    const attrs = m[3] ?? "";
    if (m[1]) {
      const i = stack.map((s) => s.tag).lastIndexOf(tag);
      if (i >= 0) stack.length = i;
      continue;
    }
    if (tag === "h2" || tag === "h1") {
      const end = body.indexOf(`</${tag}>`, tagRe.lastIndex);
      if (end > 0 && tag === "h2") heading = text(body.slice(tagRe.lastIndex, end));
    }
    if (tag === "main") heading = "";
    if (tag === "a") {
      const href = attr(attrs, "href");
      const end = body.indexOf("</a>", tagRe.lastIndex);
      if (href && end > 0) {
        const has = (pred: (s: { tag: string; cls: string; attrs: string }) => boolean) => stack.some(pred);
        const cls = (c: string) => has((s) => s.cls.split(/\s+/).includes(c));
        const zone: Zone = has((s) => s.tag === "footer") ? "footer" : has((s) => s.tag === "main") ? "main" : "header";
        let kind: Found["kind"] = "other";
        let placement = heading ? `Section: ${heading}` : "Page introduction";
        if (cls("breadcrumb")) [kind, placement] = ["breadcrumb", "Breadcrumb"];
        else if (cls("key-facts")) [kind, placement] = ["glance", "At a Glance panel"];
        else if (has((s) => /data-link-group="related"/.test(s.attrs))) [kind, placement] = ["related", `Related links: ${heading}`];
        else if (cls("page-links")) [kind, placement] = ["practice", "More About the Practice links"];
        else if (cls("side-card")) [kind, placement] = ["contact", "Contact side card"];
        else if (cls("cta")) [kind, placement] = ["cta", "Call-to-action band"];
        else if (cls("faq")) [kind, placement] = ["faq", "FAQ answer"];
        else if (cls("service-prose")) kind = "copy";
        out.push({ href, anchor: text(body.slice(tagRe.lastIndex, end)), zone, placement, kind });
      }
    }
    if (!VOID.has(tag) && !attrs.trim().endsWith("/")) stack.push({ tag, cls: attr(attrs, "class") ?? "", attrs });
  }
  return out;
}

/** Path of an internal link without its fragment, or null for external / phone / email / same-page links. */
function internalPath(href: string, from: string): string | null {
  if (/^(tel:|mailto:|#|javascript:)/i.test(href)) return null;
  let url: URL;
  try {
    url = new URL(href, BASE + from);
  } catch {
    return null;
  }
  if (url.origin !== new URL(BASE).origin && url.origin !== SITE) return null;
  if (url.pathname.startsWith("/_next") || /\.(pdf|png|jpe?g|webp|svg|ico|xml|txt)$/i.test(url.pathname)) return null;
  return url.pathname === from ? null : url.pathname;
}

async function get(path: string) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  return { status: res.status, html: res.status === 200 ? await res.text() : "" };
}

const subPaths = new Map(SUB_PROCEDURES.map((s) => [subProcedurePath(s), s]));
const typePaths = new Map(CRANIO_TYPES.map((t) => [cranioTypePath(t.slug), t]));
const servicePaths = new Map(SERVICE_PAGES.map((p) => [p.path, p]));
const termTargets = new Set(TERM_LINKS.map((t) => t.href));

function sourceType(path: string): string {
  const s = servicePaths.get(path);
  if (s) return childServices(s.slug).length ? "Service hub" : "Service page";
  if (subPaths.has(path)) return "Sub-procedure page";
  if (typePaths.has(path)) return "Condition type page";
  return path === "/" ? "Home page" : "Practice page";
}

function pageName(path: string): string {
  return servicePaths.get(path)?.shortTitle ?? subPaths.get(path)?.shortTitle ?? typePaths.get(path)?.shortTitle ?? (path === "/" ? "Home" : path.slice(1));
}

function why(source: string, dest: string, f: Found): string {
  if (f.kind === "breadcrumb") return "Navigation path back to the parent page";
  if (f.kind === "glance") return "Surgeon, clinic and consultation reference";
  if (f.kind === "practice") return "Practice information";
  if (f.kind === "contact" || f.kind === "cta") return "Next step: enquiry or contact";
  if (f.kind === "related") {
    if (dest === ROUTES.procedures) return "Full index of conditions and procedures";
    const s = servicePaths.get(source);
    const reason = s ? relatedServicesWithReason(s).find((r) => r.page.path === dest)?.reason : undefined;
    if (reason) return { "editor-pick": "Editor's pick", "parent-hub": "Parent hub", sibling: "Procedure of the same hub", child: "Procedure page of this hub" }[reason];
    if (s && getService(servicePaths.get(dest)?.slug ?? "")?.parent === s.slug) return "Procedure page of this hub";
    if (subPaths.has(source) || typePaths.has(source)) return dest.startsWith(source.slice(0, source.lastIndexOf("/")) + "/") ? "Sibling page of the same service" : "Parent or see-also service";
    return "Related page";
  }
  if ((f.kind === "copy" || f.kind === "faq") && termTargets.has(dest)) return "First mention of the topic in the copy";
  if (dest.startsWith(source + "/")) return "Detail page of this service";
  return "Reference within the section";
}

async function main() {
  const sitemap = await get("/sitemap.xml");
  if (sitemap.status !== 200) throw new Error(`No sitemap at ${BASE}/sitemap.xml (${sitemap.status}). Start the site first: npm run build && npm run start`);
  const pages = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);

  const rows: string[][] = [];
  const dests = new Set<string>();
  const seen = new Set<string>();
  let declaredTotal = 0;
  const notRendered: string[] = [];

  for (const page of pages) {
    const { status, html } = await get(page);
    if (status !== 200) throw new Error(`${page} answered ${status}`);
    const declared = new Set(
      [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .flatMap((m) => {
          const j: unknown = JSON.parse(m[1]!);
          return (Array.isArray(j) ? j : [j]) as { relatedLink?: string[] }[];
        })
        .flatMap((n) => n.relatedLink ?? [])
        .map((u) => new URL(u).pathname),
    );
    declaredTotal += declared.size;
    const found = linksIn(html);
    const mainTargets = new Set(found.filter((f) => f.zone === "main").map((f) => internalPath(f.href, page)));
    for (const d of declared) if (!mainTargets.has(d)) notRendered.push(`${page} → ${d}`);

    for (const f of found) {
      const dest = internalPath(f.href, page);
      if (!dest) continue;
      const siteWide = f.zone !== "main";
      const source = siteWide ? "Every page" : SITE + page;
      const placement = siteWide ? (f.zone === "header" ? "Header menu" : "Footer") : f.placement;
      const key = `${source}|${dest}|${placement}`;
      if (seen.has(key)) continue;
      seen.add(key);
      dests.add(dest);
      rows.push([
        source,
        siteWide ? "Site-wide" : sourceType(page),
        SITE + dest,
        pageName(dest),
        f.anchor,
        siteWide ? "Site navigation" : why(page, dest, f),
        placement,
        !siteWide && declared.has(dest) ? "relatedLink" : "—",
        siteWide ? "—" : schemaTestGroup(page),
        dest,
      ]);
    }
  }

  // Destination health: every internal link should land on a 200 page, not a redirect or an error.
  const health = new Map<string, number>();
  for (const d of dests) health.set(d, (await get(d)).status);
  const unhealthy = [...health].filter(([, s]) => s !== 200);

  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const header = ["Source URL", "Source type", "Destination URL", "Destination", "Anchor text", "Why useful", "Visible placement", "Schema", "Schema test group", "Destination status"];
  const lines = rows.map((r) => [...r.slice(0, 9), health.get(r[9]!) === 200 ? "200 OK" : `${health.get(r[9]!)} — fix`].map(cell).join(","));
  writeFileSync(new URL("../docs/internal-link-map.csv", import.meta.url), [header.join(","), ...lines].join("\n") + "\n");

  console.log(`${pages.length} pages read from ${BASE}`);
  console.log(`${rows.length} internal links written to docs/internal-link-map.csv (${rows.filter((r) => r[0] === "Every page").length} site-wide, ${rows.filter((r) => r[7] === "relatedLink").length} declared as relatedLink)`);
  console.log(`${declaredTotal} relatedLink URLs declared; ${notRendered.length} not rendered as a visible link`);
  console.log(`${dests.size} distinct destinations; ${unhealthy.length} not answering 200${unhealthy.length ? ": " + unhealthy.map(([d, s]) => `${d} (${s})`).join(", ") : ""}`);
  if (notRendered.length) console.log(notRendered.join("\n"));
  if (notRendered.length || unhealthy.length) process.exitCode = 1;
}

void main();
