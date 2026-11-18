import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatPostDate } from "@/components/site/blog";
import { Byline, CtaBand, HelpSideCard, PageHero, ServiceIndex } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { BLOG_DESCRIPTION, BLOG_POSTS, BLOG_TITLE, blogPath } from "@/lib/blog";
import { getService } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { BLOG_ID, blogJsonLd, breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

/**
 * Blog index — every patient guide (lib/blog.ts), newest first. Each guide links to its procedure page
 * and each procedure page links back under "Patient Guides", so this page is a hub, not the only way in.
 */
const META_TITLE = `${BLOG_TITLE} | Dr Vybhav Deraje`;
const LATEST = BLOG_POSTS.reduce((d, p) => (p.modified > d ? p.modified : d), BLOG_POSTS[0]?.modified ?? "2026-11-18");

export const metadata: Metadata = pageMetadata({ title: META_TITLE, description: BLOG_DESCRIPTION, path: ROUTES.blog, bare: true });

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: ROUTES.blog },
          ]),
          medicalWebPageJsonLd({
            title: META_TITLE,
            description: BLOG_DESCRIPTION,
            path: ROUTES.blog,
            type: "CollectionPage",
            mainEntityId: BLOG_ID(),
            relatedPaths: [...BLOG_POSTS.map((p) => blogPath(p.slug)), ROUTES.procedures, ROUTES.costs, ROUTES.resources],
            lastReviewed: LATEST,
            dateModified: LATEST,
          }),
          blogJsonLd(BLOG_POSTS),
        ]}
      />
      <PageHero eyebrow="Blog · Patient Guides" crumb="Blog" title={BLOG_TITLE} lead="Longer reads on the questions patients ask most before surgery: how the options compare, who each one suits, what recovery is really like and what affects the cost." />
      <section className="section container content-grid">
        <article className="prose">
          <Byline />
          <ul className="post-index" data-link-group="related">
            {BLOG_POSTS.map((p) => {
              const service = getService(p.service);
              return (
                <li key={p.slug}>
                  <p className="eyebrow">
                    {p.category} · <time dateTime={p.published}>{formatPostDate(p.published)}</time>
                  </p>
                  <h2>
                    <Link href={blogPath(p.slug)}>{p.title}</Link>
                  </h2>
                  <p>{p.card}</p>
                  <p className="post-index-links">
                    <Link className="text-link" href={blogPath(p.slug)}>
                      Read the Guide <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    {service && (
                      <Link className="text-link" href={service.path}>
                        {service.shortTitle} in Bangalore <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="callout">
            Looking for a figure? Every procedure with a published cost is on the <Link href={ROUTES.costs}>Treatment Costs</Link> page, and <Link href={ROUTES.resources}>Patient Resources</Link> covers how to prepare for a consultation.
          </p>
          <ServiceIndex heading="Procedure Pages" intro={<p>Each guide supports a procedure page, where Dr Vybhav Deraje sets out how the operation is done at his practice in Bangalore.</p>} />
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
