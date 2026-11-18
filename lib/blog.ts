/**
 * Blog — long-form patient guides (added 18 Nov 2026).
 *
 * Content lives in lib/blog-posts.json, converted from the practice's blog content sheet. Text fields use a
 * small inline markup — `**bold**` and `[label](href)` — rendered by components/site/blog.tsx; everything
 * else is plain text and goes through the site's autolinker, so the first mention of a procedure links to
 * its page. Internal hrefs in the JSON are checked against the site's routes in tests/unit/blog.test.ts.
 *
 * To add an article: add its entry to the JSON (newest date wins the top of the index). The index, the
 * sitemap, llms.txt and the "Patient Guides" block on each related procedure page pick it up from here.
 */
import POSTS_JSON from "./blog-posts.json";
import { ROUTES, type ServiceSlug } from "./routes";
import { titleCase } from "./title-case";

export type BlogBlock = { t: "p"; text: string } | { t: "h3"; text: string } | { t: "ul" | "ol"; items: string[] } | { t: "table"; head: string[]; rows: string[][] };

export interface BlogSection {
  heading: string;
  blocks: BlogBlock[];
}

export interface BlogPost {
  slug: string;
  /** The H1. */
  title: string;
  /** <title>, used as given (≤60 characters). */
  metaTitle: string;
  description: string;
  /** ISO dates. `modified` changes only when the article's text changes. */
  published: string;
  modified: string;
  category: "Face" | "Breast" | "Body" | "Craniofacial";
  /** The procedure page this article supports — its schema `about` and first contextual link. */
  service: ServiceSlug;
  /** Procedure pages shown under the article, and the pages that list this article under "Patient Guides". */
  services: ServiceSlug[];
  relatedPosts: string[];
  /** Names in lib/costs.ts whose figures the article quotes (kept in step by tests/unit/blog.test.ts). */
  costs: string[];
  /** Topics for schema `about` / `keywords`. */
  about: string[];
  /** One-line summary for cards and lists. */
  card: string;
  intro: string[];
  takeaways: string[];
  sections: BlogSection[];
  faqs: { q: string; a: string }[];
  disclaimer: string;
  references: { label: string; url: string }[];
}

export const BLOG_POSTS: BlogPost[] = [...(POSTS_JSON as unknown as BlogPost[])].sort((a, b) => b.published.localeCompare(a.published));

export const blogPath = (slug: string): string => `${ROUTES.blog}/${slug}`;

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Articles to list on a procedure page. */
export function postsForService(slug: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => (p.services as string[]).includes(slug));
}

export function relatedPosts(post: BlogPost): BlogPost[] {
  return post.relatedPosts.flatMap((s) => getPost(s) ?? []);
}

/** Headings follow the site's Title Case rule; questions stay in sentence case, like the FAQ headings. */
export function headingText(heading: string): string {
  return heading.trim().endsWith("?") ? heading : titleCase(heading);
}

/** Short breadcrumb / card label: the part of the title before the colon. */
export function postShortTitle(post: BlogPost): string {
  return (post.title.split(":")[0] ?? post.title).trim();
}

/** Side-menu label: the heading up to its colon, without the question mark. */
export function tocLabel(heading: string): string {
  return titleCase((heading.split(":")[0] ?? heading).replace(/\?$/, "").trim());
}

export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Inline markup removed — for structured data, llms.txt and word counts. */
export function plainText(markup: string): string {
  return markup.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*(.+?)\*\*/g, "$1");
}

function blockStrings(b: BlogBlock): string[] {
  if (b.t === "p" || b.t === "h3") return [b.text];
  if (b.t === "table") return [...b.head, ...b.rows.flat()];
  return b.items;
}

/** Every text string of the article in reading order (markup intact). */
export function postStrings(post: BlogPost): string[] {
  return [...post.intro, ...post.takeaways, ...post.sections.flatMap((s) => [s.heading, ...s.blocks.flatMap(blockStrings)]), ...post.faqs.flatMap((f) => [f.q, f.a])];
}

export function postWordCount(post: BlogPost): number {
  return postStrings(post).map(plainText).join(" ").split(/\s+/).filter(Boolean).length;
}

/** Internal paths the article links to in its own copy (markup links), in reading order, without duplicates. */
export function postInternalLinks(post: BlogPost): string[] {
  const out: string[] = [];
  for (const s of postStrings(post)) for (const m of s.matchAll(/\]\((\/[^)#]*)(?:#[^)]*)?\)/g)) if (m[1] && !out.includes(m[1])) out.push(m[1]);
  return out;
}

export const BLOG_TITLE = "Plastic Surgery Guides for Patients";
export const BLOG_DESCRIPTION = "Plain-language guides from Dr Vybhav Deraje, plastic surgeon in Bangalore: Rhinoplasty, Breast Augmentation, Tummy Tuck and recovery after pregnancy.";
