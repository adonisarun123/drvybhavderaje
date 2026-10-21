import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { CtaBand, PageHero } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { CREDENTIALS } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Meet Dr Vybhav Deraje",
  description: "Dr Vybhav Deraje is a craniofacial and plastic surgeon in Bengaluru, trained in India, the United Kingdom and the Australian Craniofacial Unit, Adelaide. Founder of Aesthetica Veda.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Meet Dr Vybhav Deraje", path: "/about" }])} />
      <PageHero eyebrow="Meet Dr Vybhav Deraje" crumb="Meet Dr Vybhav Deraje" title="Specialist expertise. A personal approach." lead="Craniofacial & plastic surgeon. Founder of Aesthetica Veda. Based in Bengaluru." />
      <section className="section container content-grid">
        <article className="prose">
          <h2>Meet Dr Vybhav Deraje</h2>
          <p>Dr Vybhav’s clinical interests bring together craniofacial, plastic and reconstructive surgery. He completed his medical and surgical training in India, followed by further training in the UK and Australia.</p>
          <p>His approach emphasises patient confidentiality, careful communication and working alongside other specialists.</p>
          <h3>Qualifications and training</h3>
          <div className="credential-list">
            {CREDENTIALS.map((c) => (
              <div key={c.title}>
                <b>{c.title}</b>
                <span>{c.detail}</span>
              </div>
            ))}
          </div>
          <p className="note">Qualifications and training summarised from the doctor’s existing practice website.</p>
        </article>
        <div>
          <Image className="about-image" src="/images/doctor.png" alt="Dr Vybhav Deraje" width={466} height={588} sizes="(max-width: 580px) 90vw, 400px" />
          <div className="side-card" style={{ marginTop: 24 }}>
            <h3>Care begins with listening.</h3>
            <p>Bring your questions, your concerns and your expectations. The consultation is your space to understand your options.</p>
            <Link className="text-link" href="/appointment">
              Arrange a consultation <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
