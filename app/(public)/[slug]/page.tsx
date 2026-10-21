import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand, Faq, HelpSideCard, PageHero, TopicList } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { SERVICE_PAGES } from "@/lib/content";
import { breadcrumbJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  if (!page) return {};
  return pageMetadata({ title: page.metaTitle, description: page.description, path: `/${page.slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = SERVICE_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: page.title, path: `/${page.slug}` }]),
          medicalWebPageJsonLd({ title: page.metaTitle, description: page.description, path: `/${page.slug}` }),
          faqJsonLd(page.faqs),
        ]}
      />
      <PageHero eyebrow={page.eyebrow} crumb={page.eyebrow} title={page.title} lead={page.lead} />
      <section className="section container content-grid">
        <article className="prose">
          <h2>Start with a conversation.</h2>
          <p>{page.intro}</p>
          <h3>What a consultation can cover</h3>
          <TopicList topics={page.topics} />
          <h2>Questions you may have</h2>
          <Faq items={page.faqs} />
          <p className="note">General information only. Individual assessment is essential. Clinical content should be discussed with your treating doctor.</p>
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
