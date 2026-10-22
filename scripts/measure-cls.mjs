// Measures CLS + LCP on a running server and prints every layout-shift source.
// Usage: node scripts/measure-cls.mjs http://localhost:3000/
import { chromium } from "@playwright/test";

const url = process.argv[2] || "http://localhost:3000/";
const browser = await chromium.launch();
for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__shifts = [];
    window.__lcp = null;
    const po = new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({
          t: Math.round(e.startTime),
          value: +e.value.toFixed(4),
          sources: (e.sources || []).map((s) => {
            const n = s.node;
            const d = n && n.nodeType === 1 ? `${n.tagName.toLowerCase()}${n.id ? "#" + n.id : ""}${n.className && typeof n.className === "string" ? "." + n.className.trim().split(/\s+/).join(".") : ""}` : String(n);
            return { el: d, from: [s.previousRect.y, s.previousRect.height], to: [s.currentRect.y, s.currentRect.height] };
          }),
        });
      }
    });
    po.observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => {
      const e = l.getEntries().pop();
      if (e) window.__lcp = { t: Math.round(e.startTime), el: e.element ? e.element.tagName + (e.element.id ? "#" + e.element.id : "") : null };
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // scroll through the page slowly so lazy content loads
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ shifts: window.__shifts, lcp: window.__lcp, cls: window.__shifts.reduce((a, s) => a + s.value, 0) }));
  console.log(`\n=== ${vp.width}x${vp.height}  CLS=${r.cls.toFixed(4)}  LCP=${JSON.stringify(r.lcp)}`);
  for (const s of r.shifts) console.log(JSON.stringify(s));
  await ctx.close();
}
await browser.close();
