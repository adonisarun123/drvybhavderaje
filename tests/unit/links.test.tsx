import { describe, expect, it } from "vitest";
import { isValidElement, type ReactElement } from "react";
import { autolink, createLinkBudget, linkTargetFor, relatedServices, relatedServicesWithReason, serviceRelatedPaths } from "@/lib/links";
import { SCHEMA_HOLDOUT_PATHS, SCHEMA_TEST_PATHS, schemaTestGroup } from "@/lib/link-experiment";
import { medicalWebPageJsonLd } from "@/lib/seo";
import { getService, SERVICE_PAGES } from "@/lib/content";
import { ROUTES, servicePath } from "@/lib/routes";
import { SUB_PROCEDURES, subProcedurePath } from "@/lib/sub-procedures";
import { CRANIO_TYPES, cranioTypePath } from "@/lib/cranio-types";

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

describe("related links are relevant, not category padding", () => {
  it("only relates a page to its editor's picks, parent hub, siblings and children", () => {
    for (const p of SERVICE_PAGES) {
      for (const { page: r, reason } of relatedServicesWithReason(p)) {
        const ok = p.related.includes(r.slug) || r.slug === p.parent || (p.parent !== undefined && r.parent === p.parent) || r.parent === p.slug;
        expect(ok, `${p.slug} → ${r.slug} (${reason})`).toBe(true);
      }
    }
    const reduction = getService("breast-reduction-surgery-bangalore")!;
    expect(relatedServices(reduction).map((x) => x.slug)).not.toContain("rhinoplasty-surgery-bangalore");
  });

  it("declares as relatedLink exactly the pages the service template renders, each a real page, never itself", () => {
    const known = new Set(SERVICE_PAGES.map((x) => x.path));
    for (const p of SERVICE_PAGES) {
      const paths = serviceRelatedPaths(p);
      expect(new Set(paths).size).toBe(paths.length);
      expect(paths).not.toContain(p.path);
      for (const path of paths) expect(known.has(path), `${p.slug} → ${path}`).toBe(true);
      for (const r of relatedServices(p)) expect(paths).toContain(r.path);
    }
  });
});

describe("relationship structured data", () => {
  const args = { title: "T", description: "D", path: "/rhinoplasty-surgery-bangalore" };

  it("drops the page itself and duplicates from relatedLink, and never assumes a significantLink", () => {
    const node = medicalWebPageJsonLd({ ...args, relatedPaths: ["/facelift-surgery-bangalore", "/rhinoplasty-surgery-bangalore", "/facelift-surgery-bangalore"] });
    expect(node.relatedLink).toHaveLength(1);
    expect(node.relatedLink?.[0]).toMatch(/\/facelift-surgery-bangalore$/);
    expect(node.significantLink).toBeUndefined();
    expect(medicalWebPageJsonLd(args).relatedLink).toBeUndefined();
  });

  it("is switched off by RELATIONSHIP_SCHEMA=false", () => {
    process.env.RELATIONSHIP_SCHEMA = "false";
    try {
      const node = medicalWebPageJsonLd({ ...args, relatedPaths: ["/facelift-surgery-bangalore"], significantPaths: ["/contact-us"] });
      expect(node.relatedLink).toBeUndefined();
      expect(node.significantLink).toBeUndefined();
    } finally {
      delete process.env.RELATIONSHIP_SCHEMA;
    }
  });
});

describe("schema holdout test", () => {
  it("has two disjoint, near-equal groups of real pages and leaves the home page out", () => {
    const known = new Set([...SERVICE_PAGES.map((p) => p.path), ...SUB_PROCEDURES.map((p) => subProcedurePath(p)), ...CRANIO_TYPES.map((t) => cranioTypePath(t.slug))]);
    for (const p of [...SCHEMA_TEST_PATHS, ...SCHEMA_HOLDOUT_PATHS]) expect(known.has(p), p).toBe(true);
    for (const p of SCHEMA_HOLDOUT_PATHS) expect(SCHEMA_TEST_PATHS.has(p)).toBe(false);
    expect(Math.abs(SCHEMA_TEST_PATHS.size - SCHEMA_HOLDOUT_PATHS.size)).toBeLessThanOrEqual(5);
    expect(schemaTestGroup("/")).toBe("not in test");
  });

  it("withholds relatedLink on holdout pages only, until RELATIONSHIP_SCHEMA_HOLDOUT=false", () => {
    const holdout = [...SCHEMA_HOLDOUT_PATHS][0]!;
    const test = [...SCHEMA_TEST_PATHS][0]!;
    const node = (path: string) => medicalWebPageJsonLd({ title: "T", description: "D", path, relatedPaths: ["/contact-us"] });
    expect(node(holdout).relatedLink).toBeUndefined();
    expect(node(test).relatedLink).toHaveLength(1);
    process.env.RELATIONSHIP_SCHEMA_HOLDOUT = "false";
    try {
      expect(node(holdout).relatedLink).toHaveLength(1);
    } finally {
      delete process.env.RELATIONSHIP_SCHEMA_HOLDOUT;
    }
  });
});

