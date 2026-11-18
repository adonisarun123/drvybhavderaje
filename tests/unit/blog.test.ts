import { describe, expect, it } from "vitest";
import { BLOG_POSTS, blogPath, getPost, postInternalLinks, postStrings, postsForService, plainText, sectionId } from "@/lib/blog";
import { SERVICE_PAGES, getService } from "@/lib/content";
import { COST_ITEMS } from "@/lib/costs";
import { ROUTES } from "@/lib/routes";
import { blogPostingJsonLd, medicalWebPageJsonLd } from "@/lib/seo";

const KNOWN_PATHS = new Set<string>([...Object.values(ROUTES), ...SERVICE_PAGES.map((p) => p.path), ...BLOG_POSTS.map((p) => blogPath(p.slug))]);
/** Indian digit grouping, as the articles print rupee figures: 150000 → "1,50,000". */
const lakh = (n: number) => new Intl.NumberFormat("en-IN").format(n);

describe("blog posts", () => {
  it("have unique slugs, titles within 60 characters and descriptions within 160", () => {
    expect(new Set(BLOG_POSTS.map((p) => p.slug)).size).toBe(BLOG_POSTS.length);
    for (const p of BLOG_POSTS) {
      expect(p.metaTitle.length, p.slug).toBeLessThanOrEqual(60);
      expect(p.description.length, p.slug).toBeLessThanOrEqual(160);
      expect(p.faqs.length, p.slug).toBeGreaterThan(0);
      expect(p.references.length, p.slug).toBeGreaterThan(0);
    }
  });

  it("link only to pages that exist, and never leave a placeholder or broken markup behind", () => {
    for (const p of BLOG_POSTS) {
      for (const href of postInternalLinks(p)) expect(KNOWN_PATHS.has(href), `${p.slug} links to ${href}`).toBe(true);
      for (const s of postStrings(p)) {
        expect(s, p.slug).not.toMatch(/INTERNAL LINK|drvybhavderaje\.com|\\/);
        expect(plainText(s), p.slug).not.toMatch(/\*\*|\]\(/);
      }
    }
  });

  it("point at real procedure pages and at each other", () => {
    for (const p of BLOG_POSTS) {
      expect(getService(p.service), p.slug).toBeDefined();
      expect(p.services, p.slug).toContain(p.service);
      for (const s of p.services) expect(getService(s), `${p.slug} → ${s}`).toBeDefined();
      for (const r of p.relatedPosts) expect(getPost(r), `${p.slug} → ${r}`).toBeDefined();
      expect(p.relatedPosts).not.toContain(p.slug);
      expect(postsForService(p.service)).toContain(p);
    }
  });

  it("quote the same cost figures as the doctor's price list (lib/costs.ts)", () => {
    for (const p of BLOG_POSTS) {
      const text = postStrings(p).join(" ");
      expect(p.costs.length, p.slug).toBeGreaterThan(0);
      for (const name of p.costs) {
        const item = COST_ITEMS.find((c) => c.name === name);
        expect(item, `${p.slug}: ${name}`).toBeDefined();
        expect(text, `${p.slug}: ${name}`).toContain(`INR ${lakh(item!.inrFrom)} to ${lakh(item!.inrTo!)} plus GST`);
      }
    }
  });

  it("have unique section anchors", () => {
    for (const p of BLOG_POSTS) {
      const ids = p.sections.map((s) => sectionId(s.heading));
      expect(new Set(ids).size, p.slug).toBe(ids.length);
      for (const reserved of ["summary", "faqs", "references"]) expect(ids).not.toContain(reserved);
    }
  });

  it("declare an article node tied to its page and its procedure", () => {
    const post = BLOG_POSTS[0]!;
    const article = blogPostingJsonLd(post, ["https://example.test/#procedure-1"]);
    expect(article["@type"]).toBe("BlogPosting");
    expect(article.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/);
    expect(article.citation).toHaveLength(post.references.length);
    expect(article.wordCount).toBeGreaterThan(1000);
    const page = medicalWebPageJsonLd({ title: post.metaTitle, description: post.description, path: blogPath(post.slug), lastReviewed: post.modified, dateModified: post.modified });
    expect(article.mainEntityOfPage["@id"]).toBe(page["@id"]);
    expect(page.dateModified).toBe(post.modified);
  });
});
