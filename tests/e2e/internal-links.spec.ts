/**
 * Internal-linking QA against a running server (default http://localhost:3000, or E2E_BASE_URL for the live site).
 * Every URL a page declares as `relatedLink` in its structured data must also be a visible, crawlable
 * <a href> on that page (docs/INTERNAL-LINKING.md). Read-only: safe to run against production.
 *
 *   E2E_BASE_URL=https://drvybhavderaje.com npx playwright test internal-links
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// One page per template: home, index, hub, procedure, legacy service, sub-procedure, condition type.
const SAMPLE = [
  "/",
  "/procedures",
  "/face-plastic-surgery-bangalore",
  "/rhinoplasty-surgery-bangalore",
  "/craniosynostosis-surgery-bangalore",
  "/cleft-lip-and-palate-treatment-bangalore/cleft-lip-repair",
  "/craniosynostosis-surgery-bangalore/sagittal-synostosis",
];

for (const path of SAMPLE) {
  test(`relatedLink URLs are visible links on ${path}`, async ({ page }) => {
    await page.goto(BASE + path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const nodes = blocks.flatMap((b) => {
      const parsed: unknown = JSON.parse(b);
      return Array.isArray(parsed) ? parsed : [parsed];
    }) as { relatedLink?: string[]; significantLink?: string[] }[];
    const declared = nodes.flatMap((n) => [...(n.relatedLink ?? []), ...(n.significantLink ?? [])]);
    expect(declared.length, "page declares related links").toBeGreaterThan(0);
    const hrefs = new Set(await page.locator("main a[href]").evaluateAll((as) => as.map((a) => new URL((a as HTMLAnchorElement).href).pathname)));
    for (const url of declared) {
      const target = new URL(url).pathname;
      expect(target).not.toBe(path);
      expect(hrefs.has(target), `${path} declares ${target} but does not link to it in <main>`).toBe(true);
    }
  });
}
