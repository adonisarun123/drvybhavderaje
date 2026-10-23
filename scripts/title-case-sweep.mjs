/**
 * One-off codemod (doctor's review, 23 Oct 2026: "lots of places that need capitals have small letters").
 * Crawls the running site, collects short UI labels (headings, nav, buttons, eyebrows, card titles), converts
 * the sentence-case ones to Title Case, and rewrites the exact same strings in the source.
 *
 * Only whole tokens are replaced: a "quoted" string literal or a JSX text node that is exactly the label.
 * Questions (FAQ headings) and full sentences ending in a full stop are left alone.
 *
 * Usage: node scripts/title-case-sweep.mjs http://localhost:3100 [--dry]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3100";
const DRY = process.argv.includes("--dry");

const MINOR = new Set("a an the and or nor but of for in on at to by with vs via per as from into after before over under up out off than".split(" "));

export function titleCase(s) {
  let first = true;
  return s.replace(/[A-Za-z][A-Za-z’'.-]*/g, (w, idx) => {
    const before = s.slice(0, idx);
    const startOfPhrase = first || /[—–:(·|]\s*$/.test(before) || /[.!?]\s+$/.test(before);
    first = false;
    const isLast = !/[A-Za-z]/.test(s.slice(idx + w.length).replace(/^[’'.-]*/, "").replace(/[)\]:*]/g, ""));
    if (/[A-Z]/.test(w.slice(1).split("-")[0])) return w; // acronym / brand (EarWell, YouTube, MBBS)
    if (/^(e\.g|i\.e|etc)\b/.test(w)) return w;
    if (!startOfPhrase && !isLast && MINOR.has(w.toLowerCase())) return w;
    // hyphenated: capitalise each part (Endoscope-Assisted, 3D-Printed), except minor words
    return w
      .split("-")
      .map((p, i) => (p && (i === 0 || !MINOR.has(p)) ? p[0].toUpperCase() + p.slice(1) : p))
      .join("-");
  });
}

const SELECTOR = [
  "h1", "h2", "h3", "h4", "nav a", "a.button", "button", ".eyebrow", "summary", "th", "label", ".text-link",
  ".toc a", "footer a", "footer h2", "footer h3", "li > b", ".fact-strip span", ".fact-chips li", "dt", ".timeline-head h3",
].join(",");

async function collect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const found = new Set();
  for (const u of urls) {
    await page.goto(BASE + u, { waitUntil: "domcontentloaded" });
    const texts = await page.$$eval(SELECTOR, (els) =>
      els.map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ").trim().replace(/\s+/g, " ")),
    );
    for (const t of texts) {
      if (!t || t.length > 80 || /[?]$/.test(t) || /\.$/.test(t)) continue;
      if (t.split(" ").length > 10) continue;
      if (!/\s[a-z]{2,}/.test(t)) continue;
      found.add(t);
    }
  }
  await browser.close();
  return [...found];
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p);
  }
  return out;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const labels = await collect();
const map = labels.map((t) => [t, titleCase(t)]).filter(([a, b]) => a !== b);
const files = ["app", "components", "lib"].flatMap((d) => walk(d));
let edits = 0;
const missing = [];
for (const [from, to] of map) {
  let hit = false;
  const variants = [from, from.replace(/’/g, "'"), from.replace(/&/g, "&amp;")];
  for (const f of files) {
    let src = fs.readFileSync(f, "utf8");
    const before = src;
    for (const v of new Set(variants)) {
      const t = v === from ? to : to.replace(/’/g, "'").replace(/&(?!amp;)/g, v.includes("&amp;") ? "&amp;" : "&");
      // "label" / 'label' / `label` string literals
      src = src.replace(new RegExp(`(["'\`])${esc(v)}\\1`, "g"), (_m, q) => `${q}${t}${q}`);
      // JSX text nodes that are exactly the label
      src = src.replace(new RegExp(`(>\\s*)${esc(v)}(\\s*<)`, "g"), (_m, a, b) => `${a}${t}${b}`);
    }
    if (src !== before) {
      hit = true;
      edits++;
      if (!DRY) fs.writeFileSync(f, src);
    }
  }
  if (!hit) missing.push(from);
}
console.log(`${map.length} labels to change, ${edits} file edits${DRY ? " (dry run)" : ""}`);
fs.writeFileSync("/tmp/title-case-map.json", JSON.stringify({ map, missing }, null, 1));
console.log(`not found verbatim in source (built from parts — fix by hand): ${missing.length}`);
for (const m of missing) console.log("  · " + m);
