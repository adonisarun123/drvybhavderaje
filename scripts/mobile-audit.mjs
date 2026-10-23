/**
 * Mobile layout audit: every sitemap URL at phone widths. Reports horizontal overflow and the elements that
 * stick out past the viewport, and saves full-page screenshots.
 * Usage: node scripts/mobile-audit.mjs http://localhost:3100 /tmp/mob [390,360]
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";

const base = process.argv[2] ?? "http://localhost:3100";
const out = process.argv[3] ?? "/tmp/mob";
const widths = (process.argv[4] ?? "390,360").split(",").map(Number);
const only = process.argv[5]?.split(",");
fs.mkdirSync(out, { recursive: true });
const sm = await (await fetch(`${base}/sitemap.xml`)).text();
const urls = only ?? [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const browser = await chromium.launch();
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const u of urls) {
    await page.goto(base + u, { waitUntil: "networkidle" });
    // Accept no cookies (banner off) and scroll through so lazy images load before the screenshot.
    await page.evaluate(() => document.querySelector(".cookie-banner")?.remove());
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
    await page.waitForLoadState("networkidle");
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const bad = [];
      for (const el of document.querySelectorAll("body *")) {
        const b = el.getBoundingClientRect();
        if (!b.width || getComputedStyle(el).position === "fixed") continue;
        if (b.right > vw + 1 || b.left < -1) {
          let p = el.parentElement, clipped = false;
          while (p) { const o = getComputedStyle(p).overflowX; if (o === "hidden" || o === "auto" || o === "scroll" || o === "clip") { clipped = true; break; } p = p.parentElement; }
          if (!clipped) bad.push(`${el.tagName.toLowerCase()}.${[...el.classList].join(".")} [${Math.round(b.left)}→${Math.round(b.right)}]`);
        }
      }
      return { sw: document.documentElement.scrollWidth, vw, bad: [...new Set(bad)].slice(0, 8) };
    });
    const name = (u === "/" ? "home" : u.replace(/\//g, "_").replace(/^_/, "")) + `-${w}`;
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(`${r.sw > r.vw ? "OVERFLOW" : "ok      "} ${name}${r.bad.length ? "  ← " + r.bad.join(" | ") : ""}`);
  }
  await ctx.close();
}
await browser.close();
