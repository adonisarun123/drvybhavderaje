import Link from "next/link";
import { Image } from "@imagekit/next";
import NextImage from "next/image";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Award, BadgeCheck, BookOpen, Building2, GraduationCap, Mic, Plane, Stethoscope } from "lucide-react";
import { VideoSection } from "@/components/site/video-section";
import { AffiliationLogo, Byline, HospitalPhoto, CtaBand, PhotoGallery, ServiceIndex } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { ABOUT_GALLERY, AFFILIATIONS, CREDENTIALS, DOCTOR, HOSPITALS, PRACTICES, PRESENTATIONS, PUBLICATIONS, PUBLICATIONS_OTHER, SITE } from "@/lib/content";
import { getPublicClinics } from "@/lib/clinics";
import { DOCTOR_PHOTO } from "@/lib/images";
import { autolink, createLinkBudget } from "@/lib/links";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, medicalWebPageJsonLd, pageMetadata, PHYSICIAN_ID, physicianJsonLd, scholarlyArticlesJsonLd } from "@/lib/seo";

export const revalidate = 3600;

const TITLE = "About Dr Vybhav Deraje — Craniofacial & Plastic Surgeon, Bangalore";
const DESCRIPTION = "Dr Vybhav Deraje: MBBS, MS, DNB (Plastic Surgery), craniofacial fellowship at the Australian Craniofacial Unit, Adelaide. Founder of The Head Shape Clinic and Aesthetica Veda, Bangalore.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.about, ogType: "profile" });

/**
 * Presentation-only labels for the career timeline. Each entry pairs with the same-index paragraph of
 * DOCTOR.bio (lib/content.ts); the paragraphs themselves are the live-site copy and are not edited here.
 * Years are the ones the doctor supplied on 23 Oct 2026.
 */
const CAREER: { when: string; where: string; title: string }[] = [
  { when: "2002 – 2008", where: "Bangalore", title: "Medical Training — MBBS, Kempegowda Institute of Medical Sciences" },
  { when: "2009 – 2012", where: "Mysore", title: "Surgical Training — MS (General Surgery), Mysore Medical College" },
  { when: "2013 – 2015", where: "Delhi", title: "Plastic Surgical Training — DNB, Lok Nayak Hospital & MAMC" },
  { when: "2016 – 2017", where: "East Grinstead, UK", title: "UK Fellowship — Queen Victoria Hospital" },
  { when: "2018 – 2019", where: "Adelaide, Australia", title: "Australian Fellowship — Australian Craniofacial Unit" },
  { when: "2019 onwards", where: "Bangalore", title: "Practice — Consultant Craniofacial & Plastic Surgeon" },
];

export default async function AboutPage() {
  const clinics = await getPublicClinics();
  const budget = createLinkBudget(ROUTES.about, [ROUTES.locations]);
  const bio = DOCTOR.bio.map((p) => autolink(p, budget));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Dr Vybhav Deraje", path: ROUTES.about }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.about, type: "AboutPage", speakable: [".page-hero .lead", ".timeline li:first-child p"], mainEntityId: PHYSICIAN_ID() }),
          physicianJsonLd(clinics),
          ...scholarlyArticlesJsonLd(PUBLICATIONS),
        ]}
      />

      {/* Hero: navy band, portrait on the left with a candid second photo, copy on the right.
          Deliberately unlike the home hero (pale split, arched portrait on the right). Keeps .page-hero
          so the speakable selector (.page-hero .lead) and breadcrumb styles still apply. */}
      <section className="page-hero about-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">DR VYBHAV DERAJE</li>
            </ol>
          </nav>
          <div className="about-hero-grid">
            <div className="about-portrait">
              <div className="portrait-main">
                <Image className="portrait-img" src={DOCTOR_PHOTO} alt="Dr Vybhav Deraje, craniofacial and plastic surgeon, in blue surgical scrubs" width={466} height={588} priority sizes="(max-width: 580px) 90vw, (max-width: 1080px) 40vw, 420px" />
              </div>
              <figure className="portrait-candid">
                <Image src={ABOUT_GALLERY.find((g) => g.src === "/custom/gallery_1.png")!.src} alt="" width={370} height={260} sizes="220px" />
                <figcaption>Craniofacial Fellowship, Australian Craniofacial Unit, Adelaide</figcaption>
              </figure>
            </div>
            <div className="about-hero-copy">
              <p className="eyebrow">Meet the Doctor</p>
              <h1>Dr Vybhav Deraje</h1>
              <p className="credentials">
                {DOCTOR.honorificSuffix} · {DOCTOR.fellowship}
              </p>
              <p className="lead">Consultant Craniofacial &amp; Plastic Surgeon, Bangalore. Founder of The Head Shape Clinic and Aesthetica Veda.</p>
              <ul className="fact-chips" aria-label="At a Glance">
                <li>
                  <BadgeCheck size={16} aria-hidden="true" /> KMC Reg. No. {DOCTOR.kmcRegistration} · Registered since 2008
                </li>
                <li>
                  <Award size={16} aria-hidden="true" /> Craniofacial Fellowship, ACFU Adelaide
                </li>
                <li>
                  <Stethoscope size={16} aria-hidden="true" /> Consultant in Bangalore Since 2019
                </li>
              </ul>
              <blockquote className="hero-quote">
                <p>{DOCTOR.values}</p>
              </blockquote>
              <div className="actions">
                <Link className="button light" href={ROUTES.contact}>
                  Book an Appointment <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link className="text-link on-dark" href={ROUTES.locations}>
                  Where He Consults <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four facts, all taken from the content on this page. */}
      <section className="fact-strip" aria-label="Key facts">
        <div className="container">
          <div>
            <GraduationCap aria-hidden="true" />
            <span>
              National Board Certified<small>DNB — Plastic Surgery, 2015</small>
            </span>
          </div>
          <div>
            <Plane aria-hidden="true" />
            <span>
              Trained in the UK and Australia<small>East Grinstead · Australian Craniofacial Unit</small>
            </span>
          </div>
          <div>
            <Building2 aria-hidden="true" />
            <span>
              {HOSPITALS.length} Bangalore Hospitals<small>Plus The Head Shape Clinic and Aesthetica Veda</small>
            </span>
          </div>
          <div>
            <BookOpen aria-hidden="true" />
            <span>
              {PUBLICATIONS.length} Peer-Reviewed Papers<small>Craniofacial and Plastic Surgery</small>
            </span>
          </div>
        </div>
      </section>

      <section className="section container content-grid about-grid">
        <article className="prose">
          <Byline />

          <h2 id="training">Training and Career</h2>
          <ol className="timeline">
            {bio.map((p, i) => {
              const step = CAREER[i];
              return (
                <li key={i}>
                  <div className="timeline-marker" aria-hidden="true" />
                  {step && (
                    <div className="timeline-head">
                      <span className="timeline-when">{step.when}</span>
                      <span className="timeline-where">{step.where}</span>
                      <h3>{step.title}</h3>
                    </div>
                  )}
                  <p>{p}</p>
                </li>
              );
            })}
          </ol>

          <h2 id="practice">Areas of Practice</h2>
          <p>
            Dr Vybhav’s work spans two fields: craniofacial surgery for conditions of the skull, face, jaws and ears in children and adults, and cosmetic surgery of the face, breast and body. Each condition and procedure has its own page explaining who it suits, how it is done and what recovery involves.
          </p>
          <ServiceIndex heading="Conditions and Procedures Treated" />

          <h2 id="qualifications">Qualifications</h2>
          <ul className="qual-grid">
            {CREDENTIALS.map((c) => (
              <li key={c.title}>
                <GraduationCap size={22} aria-hidden="true" />
                <b>{c.title}</b>
                <span>{c.detail}</span>
              </li>
            ))}
          </ul>

          <h2 id="affiliations">Affiliations and Memberships</h2>
          <ul className="affiliation-cards" aria-label="Memberships and registrations">
            {AFFILIATIONS.map((a) => (
              <li key={a.org}>
                <a href={a.url} target="_blank" rel="noopener noreferrer">
                  <AffiliationLogo a={a} alt="" sizes="64px" />
                  <span>
                    <b>{a.org}</b>
                    <small>{a.detail}</small>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <h2 id="practices">Practices</h2>
          <p>Dr Vybhav founded and leads two practices in Bangalore:</p>
          <ul className="practice-tiles">
            {PRACTICES.map((p) => (
              <li key={p.slug}>
                <NextImage className="practice-logo" src={p.logo} alt={`${p.name} logo`} width={p.logoWidth} height={p.logoHeight} sizes="72px" />
                <b>{p.name}</b>
                <span>{p.description}</span>
                <small>{p.where}</small>
                <a href={p.url} target="_blank" rel="noopener noreferrer">
                  Visit {p.name.replace(/^The /, "the ")} <ArrowUpRight size={14} aria-hidden="true" />
                  <span className="visually-hidden">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          <h2 id="hospitals">Hospital Affiliations</h2>
          <p>Dr Vybhav consults at The Head Shape Clinic and Aesthetica Veda, and operates at the following hospitals in Bangalore:</p>
          <ul className="hospital-tiles">
            {HOSPITALS.map((h) => (
              <li key={h.name}>
                <Link href={ROUTES.locations}>
                  {h.image ? (
                    <HospitalPhoto src={h.image} alt="" sizes="(max-width: 580px) 90vw, 240px" />
                  ) : (
                    <span className="hospital-noimg" aria-hidden="true">
                      <Building2 size={34} />
                    </span>
                  )}
                  <span>{h.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p>
            <Link className="text-link" href={ROUTES.locations}>
              Addresses and Phone Numbers <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </p>

          <VideoSection page="about" heading="Dr Vybhav on Plastic Surgery" />

          <h2 id="publications">Publications</h2>
          <h3>Scientific</h3>
          <ol className="pub-list">
            {PUBLICATIONS.map((p) => (
              <li key={p.slice(0, 50)}>
                <cite>{p}</cite>
              </li>
            ))}
          </ol>
          <h3>Non-Scientific</h3>
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
          <ul className="talk-list">
            {PRESENTATIONS.map((p) => (
              <li key={p.slice(0, 50)}>
                <Mic size={18} aria-hidden="true" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="about-side">
          <nav className="side-card toc" aria-label="On This Page">
            <p className="eyebrow">On This Page</p>
            <a href="#training">Training and Career</a>
            <a href="#practice">Areas of Practice</a>
            <a href="#qualifications">Qualifications</a>
            <a href="#affiliations">Affiliations</a>
            <a href="#practices">Practices</a>
            <a href="#hospitals">Hospitals</a>
            <a href="#publications">Publications</a>
            <a href="#presentations">Presentations</a>
            <a href="#gallery">Gallery</a>
          </nav>
          <div className="side-card">
            <h3>Care Begins with Listening.</h3>
            <p>Bring your questions, your concerns and your expectations. The consultation is your space to understand your options.</p>
            <Link className="button" href={ROUTES.contact}>
              Book an Appointment <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </section>

      {/* Gallery runs full width below the article so the photos get room. */}
      <section className="section container about-gallery" id="gallery" aria-labelledby="gallery-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Teachers, Colleagues and Conferences</p>
            <h2 id="gallery-heading">Gallery</h2>
          </div>
        </div>
        <PhotoGallery photos={ABOUT_GALLERY} columns={4} />
      </section>

      <CtaBand />
    </>
  );
}
