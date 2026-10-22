import Link from "next/link";
import { Image } from "@imagekit/next";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Baby, Building2, Check, GraduationCap, HeartHandshake, MapPin, Phone, ShieldCheck } from "lucide-react";
import { AffiliationLogos, CtaBand, Faq, ServiceGrid, TestimonialCard } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { VideoGallery } from "@/components/site/video-gallery";
import { COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, DOCTOR, HOME_FAQS, HOSPITALS, OTHER_SERVICES, SITE, TESTIMONIALS, VIDEOS } from "@/lib/content";
import { getPublicClinics } from "@/lib/clinics";
import { DOCTOR_PHOTO } from "@/lib/images";
import { autolink, createLinkBudget, linkTargetFor } from "@/lib/links";
import { ROUTES, servicePath } from "@/lib/routes";
import { faqJsonLd, medicalWebPageJsonLd, pageMetadata, PHYSICIAN_ID, physicianJsonLd, practiceJsonLd, videoJsonLd, websiteJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({ title: "Home", description: SITE.metaDescription, path: "/" });

export default async function HomePage() {
  const clinics = await getPublicClinics();
  const featured = TESTIMONIALS.filter((t) => ["Sandeep", "Anand", "Abhishek"].includes(t.name));
  // Contextual links in the hero and the FAQ answers (first mention of each procedure links to its page).
  const budget = createLinkBudget("/", [ROUTES.about, ROUTES.locations, ROUTES.contact]);
  const heroCopy = autolink(
    "Dr Vybhav Deraje is a National Board certified plastic surgeon with fellowship training in craniofacial surgery. From a baby’s first craniosynostosis consultation to rhinoplasty, facelift, breast and body surgery — specialist care, explained clearly.",
    budget,
  );
  const faqs = HOME_FAQS.map((f) => ({ q: f.q, a: autolink(f.a, createLinkBudget("/")) }));
  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(),
          medicalWebPageJsonLd({ title: `${SITE.name} | Craniofacial & Plastic Surgeon, Bangalore`, description: SITE.metaDescription, path: "/", type: "WebPage", speakable: [".hero-description", ".faq"], mainEntityId: PHYSICIAN_ID(), relatedPaths: [...CRANIOFACIAL_SERVICES, ...COSMETIC_SERVICES].map((s) => s.path) }),
          physicianJsonLd(clinics),
          practiceJsonLd(clinics),
          faqJsonLd(HOME_FAQS),
          videoJsonLd(VIDEOS),
        ]}
      />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="blue-line" aria-hidden="true" /> Craniofacial &amp; plastic surgeon, Bangalore
            </p>
            <h1>
              Reconstructing faces.
              <br />
              Rebuilding <em>lives</em>.
            </h1>
            <p className="hero-description">{heroCopy}</p>
            <div className="actions">
              <Link className="button" href={ROUTES.contact}>
                Book an appointment <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" href={ROUTES.about}>
                Meet Dr Vybhav <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-note">
              <ShieldCheck size={20} aria-hidden="true" />
              <span>
                MBBS, MS, DNB (Plastic Surgery)
                <br />
                <b>Fellowship in Craniofacial Surgery — Australian Craniofacial Unit, Adelaide</b>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="image-frame">
              <Image className="doctor-hero" src={DOCTOR_PHOTO} alt="Dr Vybhav Deraje, craniofacial and plastic surgeon, in blue surgical scrubs" width={466} height={588} priority sizes="(max-width: 580px) 90vw, (max-width: 1080px) 45vw, 520px" />
            </div>
            <div className="portrait-label">
              <span className="label-line" aria-hidden="true" />
              <div>
                <strong>{SITE.name}</strong>
                <span>{DOCTOR.honorificSuffix}</span>
              </div>
              <ArrowUpRight size={23} aria-hidden="true" />
            </div>
            <span className="image-caption">Empathy. Integrity. Collaboration.</span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="About the practice">
        <div className="container">
          <div>
            <GraduationCap size={24} aria-hidden="true" />
            <span>
              Trained in India, UK &amp; Australia<small>Lok Nayak Hospital · Queen Victoria Hospital · Australian Craniofacial Unit</small>
            </span>
          </div>
          <div>
            <Building2 size={24} aria-hidden="true" />
            <span>
              Operates at {HOSPITALS.length} Bangalore hospitals<small>Aster Whitefield · Sakra World · Gleneagles Global · Apollo Spectra · Kauvery · Belenus</small>
            </span>
          </div>
          <Link href={ROUTES.locations}>
            <MapPin size={24} aria-hidden="true" />
            <span>
              Consultations at Aesthetica Veda<small>{clinics.map((c) => c.name).join(" · ")}</small>
            </span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="craniofacial" className="section container" aria-labelledby="craniofacial-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our services</p>
            <h2 id="craniofacial-heading">Craniofacial surgery</h2>
          </div>
          <p>
            Conditions of the skull, face, jaws and ears — in children and adults.
            <br />
            Protocol-based care with a multidisciplinary team.
          </p>
        </div>
        <ServiceGrid services={CRANIOFACIAL_SERVICES} />
      </section>

      <section id="cosmetic-surgery" className="section container" aria-labelledby="cosmetic-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Our services</p>
            <h2 id="cosmetic-heading">Cosmetic surgery</h2>
          </div>
          <p>
            Face, breast and body procedures by a board-certified plastic surgeon.
            <br />
            Honest conversations about options, limits and recovery.
          </p>
        </div>
        <ServiceGrid services={COSMETIC_SERVICES} />
      </section>

      <section id="also-treated" className="section container" aria-labelledby="also-treated-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Also treated</p>
            <h2 id="also-treated-heading">Reconstructive and other conditions</h2>
          </div>
          <p>
            Facial injuries, head and neck cancer, facial palsy, vascular anomalies and hand surgery.
            <br />
            Plus overview pages for the full range of face, breast and body procedures.
          </p>
        </div>
        <div className="also-treated">
          {OTHER_SERVICES.map((s) => (
            <Link key={s.slug} href={s.path}>
              {s.shortTitle} <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className="feature-section" aria-labelledby="feature-heading">
        <div className="container feature-grid">
          <div className="feature-art" aria-hidden="true">
            <span className="art-label">
              FOR LITTLE ONES.
              <br />
              FOR THEIR BIG FUTURES.
            </span>
            <div className="rings">
              <span />
              <span />
              <span />
              <Baby size={93} strokeWidth={0.8} />
            </div>
            <span className="art-bottom">Craniosynostosis care, centred on your child.</span>
          </div>
          <div className="feature-copy">
            <p className="eyebrow">Craniosynostosis — endoscopic surgery and helmet therapy</p>
            <h2 id="feature-heading">
              When it’s your child,
              <br />
              every question matters.
            </h2>
            <p>
              Dr Vybhav leads the craniosynostosis multidisciplinary team at Aster Hospital, Whitefield — the only hospital in India offering minimally invasive endoscope-assisted surgery with 3D-printed helmet therapy for babies under six months.
            </p>
            <ul className="check-list">
              <li>
                <Check aria-hidden="true" />
                Keyhole strip craniectomy: less blood loss, shorter stay, faster recovery
              </li>
              <li>
                <Check aria-hidden="true" />
                Open fronto-orbital and cranial vault remodelling for older children
              </li>
              <li>
                <Check aria-hidden="true" />
                Families from across India — the clinic helps you plan your visit
              </li>
            </ul>
            <Link href={servicePath("craniosynostosis-surgery-bangalore")} className="text-link">
              Read about craniosynostosis care <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section container doctor-section" aria-labelledby="doctor-heading">
        <div>
          <p className="eyebrow">Meet Dr Vybhav Deraje</p>
          <h2 id="doctor-heading">
            Expertise you can understand.
            <br />
            Care you can feel.
          </h2>
        </div>
        <div>
          <p>{DOCTOR.summary}</p>
          <p>{DOCTOR.summary2}</p>
          <p>{DOCTOR.values}</p>
          <AffiliationLogos />
          <Link href={ROUTES.about} className="text-link">
            Read the full profile, publications and training <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="journey" aria-labelledby="journey-heading">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your visit, made simpler</p>
              <h2 id="journey-heading">A clear next step. At every step.</h2>
            </div>
            <Link href={ROUTES.resources} className="text-link">
              Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="steps">
            <div>
              <span className="step-number">01</span>
              <h3>Let’s connect</h3>
              <p>Call, email or send an enquiry. Tell the clinic what you’d like to discuss and choose a convenient clinic.</p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>Let’s understand</h3>
              <p>Bring your reports and questions for an individual consultation with Dr Vybhav.</p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Let’s plan</h3>
              <p>Discuss your options, expectations, hospital and follow-up before deciding.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="stories-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Patient stories</p>
            <h2 id="stories-heading">What patients say</h2>
          </div>
          <Link href={ROUTES.testimonials} className="text-link">
            All testimonials and videos <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="testimonial-grid">
          {featured.map((t) => (
            <TestimonialCard key={t.name} {...t} href={linkTargetFor(t.topic)} />
          ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="video-heading" style={{ paddingTop: 0 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Video gallery</p>
            <h2 id="video-heading">Watch and learn</h2>
          </div>
          <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" className="text-link">
            YouTube channel <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        <VideoGallery ids={VIDEOS.slice(0, 3)} />
      </section>

      <section className="section container faq-section" aria-labelledby="faq-heading">
        <div>
          <p className="eyebrow">A little more clarity</p>
          <h2 id="faq-heading">
            Questions?
            <br />{" "}
            Start here.
          </h2>
          <p>
            For anything specific to your care,
            <br />
            the clinic is a call away.
          </p>
          <a className="text-link" href={`tel:${SITE.phoneTel}`}>
            <Phone size={16} aria-hidden="true" /> {SITE.phone}
          </a>
          <br />
          <span className="note" style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <HeartHandshake size={14} aria-hidden="true" /> Empathy. Integrity. Collaboration.
          </span>
        </div>
        <Faq items={faqs} />
      </section>

      <CtaBand />
    </>
  );
}
