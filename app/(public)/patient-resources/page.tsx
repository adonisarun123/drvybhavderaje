import Link from "next/link";
import type { Metadata } from "next";
import { VideoSection } from "@/components/site/video-section";
import { Byline, CtaBand, Faq, HelpSideCard, PageHero, ServiceIndex } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { PostList } from "@/components/site/blog";
import { BLOG_POSTS, blogPath } from "@/lib/blog";
import { HOME_FAQS, RESOURCES } from "@/lib/content";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata, pageVideosJsonLd } from "@/lib/seo";

const TITLE = "Patient Resources — Preparing for Your Consultation";
const DESCRIPTION = "Before you see Dr Vybhav Deraje in Bangalore: what to bring, travelling from another city, questions worth asking and a guide to every procedure.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.resources });

export default function PatientResourcesPage() {
  const faqs = HOME_FAQS.map((f) => ({ q: f.q, a: autolink(f.a, createLinkBudget(ROUTES.resources)) }));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Patient Resources", path: ROUTES.resources }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.resources, relatedPaths: [ROUTES.costs, ROUTES.blog, ...BLOG_POSTS.map((p) => blogPath(p.slug))] }),
          faqJsonLd(HOME_FAQS),
          ...pageVideosJsonLd("resources"),
        ]}
      />
      <PageHero eyebrow="Patient Resources" crumb="Patient Resources" title="A little preparation. A clearer conversation." lead="Practical information to help you feel ready for your first consultation." />
      <section className="section container content-grid">
        <article className="prose">
          <Byline />
          <div className="resource-list">
            {RESOURCES.map((r) => (
              <div className="resource-item" key={r.title}>
                <h3 style={{ marginTop: 0 }}>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          <p className="callout">
            Costs: every procedure with a published figure is listed on the <Link href={ROUTES.costs}>Treatment Costs</Link> page, in Indian rupees with approximate US dollars.
          </p>
          <section id="guides" data-link-group="related">
            <h2>Patient Guides</h2>
            <p>
              Longer reads from the <Link href={ROUTES.blog}>blog</Link> on how the options compare, recovery and cost.
            </p>
            <PostList posts={BLOG_POSTS} />
          </section>
          <ServiceIndex heading="Procedure Guides" intro={<p>Every condition and procedure Dr Vybhav Deraje treats has its own page: who it suits, how it is done, recovery, limitations and the questions patients ask most.</p>} />
          <VideoSection page="resources" heading="Before and After Surgery" />
          <h2 style={{ marginTop: 40 }}>Frequently Asked Questions</h2>
          <Faq items={faqs} />
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
