import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { autolink, createLinkBudget, linkTargetFor, relatedServices } from "@/lib/links";
import { getService, SERVICE_PAGES } from "@/lib/content";
import { ROUTES, servicePath } from "@/lib/routes";

const hrefs = (node: unknown): string[] => (Array.isArray(node) ? node.filter((n) => isValidElement(n)).map((n) => (n as ReactElement<{ href: string }>).props.href) : []);

describe("autolink", () => {
  it("links the first mention of each target and never the current page", () => {
    const b = createLinkBudget(servicePath("rhinoplasty-surgery-bangalore"));
    const text = "Rhinoplasty is often combined with chin augmentation; chin augmentation balances the profile. Cleft lip and palate repair is separate.";
    const out = autolink(text, b);
    expect(hrefs(out)).toEqual([servicePath("chin-augmentation-surgery-bangalore"), servicePath("cleft-lip-and-palate-treatment-bangalore")]);
    // a later block on the same page does not link the same target again
    expect(autolink("Ask about chin augmentation.", b)).toBe("Ask about chin augmentation.");
  });

  it("prefers the longest phrase and respects word boundaries", () => {
    const out = autolink("Corrective jaw surgery (orthognathic surgery) for jaw deformities.", createLinkBudget("/"));
    expect(hrefs(out)).toEqual([servicePath("corrective-jaw-surgery-bangalore")]);
    const el = (out as ReactElement[]).find((n) => isValidElement(n)) as ReactElement<{ children: string }>;
    expect(el.props.children).toBe("Corrective jaw surgery");
    expect(autolink("The facelifting era.", createLinkBudget("/"))).toBe("The facelifting era.");
  });

  it("caps links per block at three", () => {
    const out = autolink("rhinoplasty, blepharoplasty, otoplasty, facelift and liposuction", createLinkBudget("/"));
    expect(hrefs(out)).toHaveLength(3);
  });

  it("maps testimonial topics to pages", () => {
    expect(linkTargetFor("Craniosynostosis")).toBe(servicePath("craniosynostosis-surgery-bangalore"));
    expect(linkTargetFor("Corrective jaw surgery")).toBe(servicePath("corrective-jaw-surgery-bangalore"));
    expect(linkTargetFor("Family of a patient")).toBeUndefined();
  });

  it("every service page is reachable as a link target from copy", () => {
    for (const p of SERVICE_PAGES) expect(linkTargetFor(p.shortTitle) ?? linkTargetFor(p.title), p.slug).toBeDefined();
  });

  it("practice pages are targets too", () => {
    expect(linkTargetFor("book an appointment with the clinic")).toBe(ROUTES.contact);
  });
});

describe("relatedServices", () => {
  it("returns up to six distinct pages, never the page itself, children first for hubs", () => {
    for (const p of SERVICE_PAGES) {
      const r = relatedServices(p);
      expect(r.length).toBeGreaterThanOrEqual(3);
      expect(r.length).toBeLessThanOrEqual(6);
      expect(new Set(r.map((x) => x.slug)).size).toBe(r.length);
      expect(r.map((x) => x.slug)).not.toContain(p.slug);
    }
    const face = getService("face-plastic-surgery-bangalore")!;
    expect(relatedServices(face).map((x) => x.slug)).toContain("rhinoplasty-surgery-bangalore");
  });
});
