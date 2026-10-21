import { chromium } from "playwright";
const out = "/tmp/claude-0/-home-claude/6f02bc21-4f00-5377-9cdb-4a54802ec23d/scratchpad/shots";
const base = process.argv[2] ?? "http://localhost:3100";
const pages = (process.argv[3] ?? "/,/about,/craniosynostosis,/locations,/appointment,/patient-resources,/privacy,/nope").split(",");
const widths = (process.argv[4] ?? "320,390,768,1024,1440").split(",").map(Number);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? document.documentElement.scrollWidth : 0);
    const name = (p === "/" ? "home" : p.replace(/\//g, "_").replace(/^_/, "")) + `-${w}`;
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(name, overflow ? `HORIZONTAL OVERFLOW scrollWidth=${overflow}` : "ok");
  }
  await ctx.close();
}
await browser.close();
