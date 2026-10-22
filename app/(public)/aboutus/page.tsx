import Link from "next/link";
import { Image } from "@imagekit/next";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AffiliationLogos, CtaBand, PageHero, PhotoGallery, ServiceIndex } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { ABOUT_GALLERY, AFFILIATIONS, CREDENTIALS, DOCTOR, HOSPITALS, PRESENTATIONS, PUBLICATIONS, PUBLICATIONS_OTHER, SITE } from "@/lib/content";
import { getPublicClinics } from "@/lib/clinics";
import { DOCTOR_PHOTO } from "@/lib/images";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, PHYSICIAN_ID, physicianJsonLd, scholarlyArticlesJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "About Dr Vybhav Deraje — Craniofacial & Plastic Surgeon, Bangalore";
const DESCRIPTION = "Dr Vybhav Deraje: MBBS, MS, DNB (Plastic Surgery), craniofacial fellowship at the Australian Craniofacial Unit, Adelaide. Founder of Aesthetica Veda, Bangalore.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.about, ogType: "profile" });

export default async function AboutPage() {
  const clinics = await getPublicClinics();
  const budget = createLinkBudget(ROUTES.about, [ROUTES.locations]);
  const bio = DOCTOR.bio.map((p) => autolink(p, budget));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Dr Vybhav Deraje", path: ROUTES.about }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.about, type: "AboutPage", speakable: [".page-hero .lead", ".prose > p:first-of-type"], mainEntityId: PHYSICIAN_ID() }),
          physicianJsonLd(clinics),
          ...scholarlyArticlesJsonLd(PUBLICATIONS),
        ]}
      />
      <PageHero eyebrow={`${DOCTOR.honorificSuffix} · ${DOCTOR.fellowship}`} crumb="Dr Vybhav Deraje" title="Dr Vybhav Deraje" lead="Consultant Craniofacial & Plastic Surgeon, Bangalore. Founder & Director, Aesthetica Veda." />
      <section className="section container content-grid">
        <article className="prose">
          <h2>Training and career</h2>
          {bio.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <h2 id="practice">Areas of practice</h2>
          <p>
            Dr Vybhav’s work spans two fields: craniofacial surgery for conditions of the skull, face, jaws and ears in children and adults, and cosmetic surgery of the face, breast and body. Each condition and procedure has its own page explaining who it suits, how it is done and what recovery involves.
          </p>
          <ServiceIndex heading="Conditions and procedures treated" />

          <h2 id="qualifications">Qualifications</h2>
          <div className="credential-list">
            {CREDENTIALS.map((c) => (
              <div key={c.title}>
                <b>{c.title}</b>
                <span>{c.detail}</span>
              </div>
            ))}
          </div>

          <h2 id="affiliations">Affiliations and memberships</h2>
          <AffiliationLogos />
          <div className="credential-list">
            {AFFILIATIONS.map((a) => (
              <div key={a.org}>
                <b>{a.org}</b>
                <span>{a.detail}</span>
              </div>
            ))}
          </div>

          <h2 id="hospitals">Hospital affiliations</h2>
          <p>Dr Vybhav consults at Aesthetica Veda clinics and operates at the following hospitals in Bangalore:</p>
          <ul>
            {HOSPITALS.map((h) => (
              <li key={h.name}>{h.name}</li>
            ))}
          </ul>
          <p>
            <Link className="text-link" href={ROUTES.locations}>
              Addresses and phone numbers <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>

          <h2 id="publications">Publications</h2>
          <h3>Scientific</h3>
          <ol className="pub-list">
            {PUBLICATIONS.map((p) => (
              <li key={p.slice(0, 50)}>
                <cite>{p}</cite>
              </li>
            ))}
          </ol>
          <h3>Non-scientific</h3>
          <ol className="pub-list">
            {PUBLICATIONS_OTHER.map((p) => (
              <li key={p.slice(0, 50)}>
                <cite>{p}</cite>
              </li>
            ))}
          </ol>
          <p className="note">
            To read any of these articles in full, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and the clinic will email you a PDF.
          </p>

          <h2 id="presentations">Presentations</h2>
          <ul>
            {PRESENTATIONS.map((p) => (
              <li key={p.slice(0, 50)}>{p}</li>
            ))}
          </ul>

          <h2 id="gallery">Gallery</h2>
          <PhotoGallery photos={ABOUT_GALLERY} columns={2} />
        </article>
        <div>
          <Image className="about-image" src={DOCTOR_PHOTO} alt="Dr Vybhav Deraje" width={466} height={588} sizes="(max-width: 580px) 90vw, 400px" />
          <nav className="side-card toc" aria-label="On this page" style={{ marginTop: 24 }}>
            <p className="eyebrow">On this page</p>
            <a href="#practice">Areas of practice</a>
            <a href="#qualifications">Qualifications</a>
            <a href="#affiliations">Affiliations</a>
            <a href="#hospitals">Hospitals</a>
            <a href="#publications">Publications</a>
            <a href="#presentations">Presentations</a>
            <a href="#gallery">Gallery</a>
          </nav>
          <div className="side-card" style={{ marginTop: 24 }}>
            <h3>Care begins with listening.</h3>
            <p>Bring your questions, your concerns and your expectations. The consultation is your space to understand your options.</p>
            <Link className="button" href={ROUTES.contact}>
              Book an appointment <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
