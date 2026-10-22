// Screenshots a page at several widths and reports header height + nav overflow.
// Usage: node scripts/shot.mjs http://localhost:3011/ /tmp/shots
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [url, out] = [process.argv[2] || "http://localhost:3011/", process.argv[3] || "/tmp/shots"];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const w of [1440, 1280, 1261, 1260, 390]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto(url, { waitUntil: "networkidle" });
  const info = await page.evaluate(() => {
    const nav = document.querySelector(".nav");
    const links = [...document.querySelectorAll("nav.site-nav > a, nav.site-nav > .nav-group > button")];
    const tops = new Set(links.map((l) => Math.round(l.getBoundingClientRect().top)));
    const fs = (sel) => getComputedStyle(document.querySelector(sel)).fontSize;
    return { navHeight: nav.getBoundingClientRect().height, navRows: tops.size, scrollW: document.documentElement.scrollWidth, body: fs("body"), heroP: fs(".hero-description"), sectionP: fs(".section-heading p:not(.eyebrow)"), eyebrow: fs(".eyebrow"), navLink: fs("nav.site-nav") };
  });
  console.log(w, JSON.stringify(info));
  await page.screenshot({ path: `${out}/home-${w}.png`, fullPage: false });
  await page.close();
}
await browser.close();
