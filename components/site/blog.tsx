import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { BLOG_POSTS, blogPath, headingText, type BlogBlock, type BlogPost } from "@/lib/blog";
import { ROUTES } from "@/lib/routes";
import { autolink, type LinkBudget } from "@/lib/links";
import { titleCase } from "@/lib/title-case";

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;

/**
 * Article text: `**bold**` and `[label](href)` markup, with the plain text in between run through the
 * site's autolinker. A link written into the copy counts against the page's link budget, so the autolinker
 * never adds a second contextual link to the same page further down.
 */
export function RichText({ text, budget }: { text: string; budget?: LinkBudget }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  const plain = (s: string) => {
    if (!s) return;
    const linked = budget ? autolink(s, budget) : s;
    out.push(<span key={`t${key++}`}>{linked}</span>);
  };
  // Links written into this passage are claimed first, so the autolinker does not link the same page a few words earlier.
  if (budget) for (const m of text.matchAll(INLINE)) if (m[3]?.startsWith("/")) budget.used.add(m[3]);
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    plain(text.slice(last, at));
    if (m[1] !== undefined) {
      // A bold label that opens the line ("Work:") follows the site's Title Case rule for labels.
      out.push(<b key={`b${key++}`}>{at === 0 && m[1].endsWith(":") ? titleCase(m[1]) : m[1]}</b>);
    } else if (m[2] !== undefined && m[3] !== undefined) {
      const href = m[3];
      if (href.startsWith("/")) {
        out.push(
          <Link key={`l${key++}`} href={href}>
            {m[2]}
          </Link>,
        );
      } else {
        out.push(
          <a key={`l${key++}`} href={href} target="_blank" rel="noopener noreferrer">
            {m[2]}
          </a>,
        );
      }
    }
    last = at + m[0].length;
  }
  plain(text.slice(last));
  return out;
}

export function PostBlock({ block, budget }: { block: BlogBlock; budget: LinkBudget }) {
  if (block.t === "p") {
    return (
      <p>
        <RichText text={block.text} budget={budget} />
      </p>
    );
  }
  if (block.t === "h3") return <h3>{headingText(block.text)}</h3>;
  if (block.t === "table") {
    return (
      <div className="post-table" role="region" aria-label="Comparison table" tabIndex={0}>
        <table>
          <thead>
            <tr>
              {block.head.map((h) => (
                <th key={h} scope="col">
                  {titleCase(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i}>
                      <RichText text={cell} budget={budget} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  const List = block.t;
  return (
    <List>
      {block.items.map((item, i) => (
        <li key={i}>
          <RichText text={item} budget={budget} />
        </li>
      ))}
    </List>
  );
}

/** Article cards — the blog index and the "More Guides" block under each article. */
export function PostCards({ posts, columns }: { posts: BlogPost[]; columns?: 3 | 4 }) {
  return (
    <div className={`care-grid compact${columns === 3 ? " cols-3" : columns === 4 ? " cols-4" : ""}`}>
      {posts.map((p, i) => (
        <Link key={p.slug} href={blogPath(p.slug)} className={`care-card care-${i % 4}`}>
          <BookOpen className="care-icon" size={28} strokeWidth={1.3} aria-hidden="true" />
          <h3>{p.title}</h3>
          <p>{p.card}</p>
          <span className="card-link">
            Read the Guide <ArrowUpRight size={19} aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Plain list of articles for a procedure page or a resources page. */
export function PostList({ posts }: { posts: BlogPost[] }) {
  return (
    <ul className="child-list">
      {posts.map((p) => (
        <li key={p.slug}>
          <Link href={blogPath(p.slug)}>{p.title}</Link> — {p.card}
        </li>
      ))}
    </ul>
  );
}

/** "From the Blog" band: the newest guides as cards, with a link to the index. Sits below the Video Gallery on the home and Patient Stories pages. */
export function BlogCardsSection({ limit = 4 }: { limit?: number }) {
  const posts = BLOG_POSTS.slice(0, limit);
  if (!posts.length) return null;
  return (
    <section className="section container" aria-labelledby="blog-heading" style={{ paddingTop: 0 }} data-link-group="related">
      <div className="section-heading">
        <div>
          <p className="eyebrow">From the Blog</p>
          <h2 id="blog-heading">Patient Guides</h2>
        </div>
        <Link href={ROUTES.blog} className="text-link">
          All Patient Guides <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <PostCards posts={posts} columns={posts.length % 4 === 0 ? 4 : posts.length % 3 === 0 ? 3 : undefined} />
    </section>
  );
}
