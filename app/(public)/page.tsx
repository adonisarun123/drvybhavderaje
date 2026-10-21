import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, Baby, Check, GraduationCap, Hand, HeartHandshake, MapPin, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { CtaBand, Faq } from "@/components/site/blocks";
import { JsonLd } from "@/components/site/json-ld";
import { CARE_PATHS, HOME_FAQS, SITE } from "@/lib/content";
import { getPublicClinics } from "@/lib/clinics";
import { faqJsonLd, pageMetadata, physicianJsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({ title: "Home", description: SITE.defaultDescription, path: "/" });

const ICONS = { baby: Baby, sparkles: Sparkles, "heart-handshake": HeartHandshake, hand: Hand } as const;

export default async function HomePage() {
  const clinics = await getPublicClinics();
  return (
    <>
      <JsonLd data={[physicianJsonLd(clinics), faqJsonLd(HOME_FAQS)]} />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="blue-line" aria-hidden="true" /> Expertise with empathy
            </p>
            <h1>
              Specialist care.
              <br />A more <em>confident</em>
              <br />
              tomorrow.
            </h1>
            <p className="hero-description">Craniofacial and plastic surgery with a personal approach. Helping you understand your options, one conversation at a time.</p>
            <div className="actions">
              <Link className="button" href="/appointment">
                Let’s talk about your care <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <Link className="text-link" href="/about">
                Meet Dr Vybhav <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero-note">
              <ShieldCheck size={20} aria-hidden="true" />
              <span>
                National Board certified plastic surgeon
                <br />
                <b>Fellowship-trained in craniofacial surgery, Adelaide</b>
              </span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="image-frame">
              <Image className="doctor-hero" src="/images/doctor.png" alt="Dr Vybhav Deraje in blue surgical scrubs" width={466} height={588} priority sizes="(max-width: 580px) 90vw, (max-width: 1080px) 45vw, 520px" />
            </div>
            <div className="portrait-label">
              <span className="label-line" aria-hidden="true" />
              <div>
                <strong>{SITE.name}</strong>
                <span>MBBS, MS, DNB (Plastic Surgery)</span>
              </div>
              <ArrowUpRight size={23} aria-hidden="true" />
            </div>
            <span className="image-caption">A human approach to specialist care.</span>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="About the practice">
        <div className="container">
          <div>
            <GraduationCap size={24} aria-hidden="true" />
            <span>
              International training<small>India · United Kingdom · Australia</small>
            </span>
          </div>
          <div>
            <HeartHandshake size={24} aria-hidden="true" />
            <span>
              Patient-centred approach<small>Empathy, integrity &amp; collaboration</small>
            </span>
          </div>
          <Link href="/locations">
            <MapPin size={24} aria-hidden="true" />
            <span>
              Care closer to you<small>{clinics.length} consultation locations in Bengaluru</small>
            </span>
            <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="care" className="section container" aria-labelledby="care-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your path to care</p>
            <h2 id="care-heading">How can we help you?</h2>
          </div>
          <p>
            For your child. For yourself. For the next chapter.
            <br />
            Start with what matters to you.
          </p>
        </div>
        <div className="care-grid">
          {CARE_PATHS.map((c, i) => {
            const Icon = ICONS[c.icon];
            return (
              <Link key={c.href} href={c.href} className={`care-card care-${i}`}>
                <Icon className="care-icon" size={37} strokeWidth={1.3} aria-hidden="true" />
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="card-link">
                  Explore care <ArrowUpRight size={19} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
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
            <span className="art-bottom">Craniofacial care, centred on your child.</span>
          </div>
          <div className="feature-copy">
            <p className="eyebrow">A little clarity can make a big difference</p>
            <h2 id="feature-heading">
              When it’s your child,
              <br />
              every question matters.
            </h2>
            <p>If you’re concerned about your baby’s head shape or have been told they have craniosynostosis, knowing where to begin can help — whether you live in Bengaluru or are travelling from another part of India.</p>
            <ul className="check-list">
              <li>
                <Check aria-hidden="true" />
                Understand the condition and next steps
              </li>
              <li>
                <Check aria-hidden="true" />
                Discuss care with a craniofacial specialist
              </li>
              <li>
                <Check aria-hidden="true" />
                Plan your consultation in Bengaluru
              </li>
            </ul>
            <Link href="/craniosynostosis" className="text-link">
              Explore craniosynostosis care <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section container doctor-section" aria-labelledby="doctor-heading">
        <div>
          <p className="eyebrow">Meet your surgeon</p>
          <h2 id="doctor-heading">
            Expertise you can understand.
            <br />
            Care you can feel.
          </h2>
        </div>
        <div>
          <p>Dr Vybhav Deraje is a plastic surgeon with a special interest in craniofacial surgery. His training spans India, the United Kingdom and the Australian Craniofacial Unit in Adelaide.</p>
          <p>His practice puts clear conversations, patient privacy and collaboration at the centre of care.</p>
          <Link href="/about" className="text-link">
            Get to know Dr Vybhav <ArrowRight size={18} aria-hidden="true" />
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
            <Link href="/patient-resources" className="text-link">
              Plan your visit <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="steps">
            <div>
              <span className="step-number">01</span>
              <h3>Let’s connect</h3>
              <p>Tell the clinic what you’d like to discuss and choose a convenient location.</p>
            </div>
            <div>
              <span className="step-number">02</span>
              <h3>Let’s understand</h3>
              <p>Bring your questions and relevant reports for an individual consultation.</p>
            </div>
            <div>
              <span className="step-number">03</span>
              <h3>Let’s plan</h3>
              <p>Discuss your options, expectations and follow-up before deciding.</p>
            </div>
          </div>
        </div>
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
        </div>
        <Faq items={HOME_FAQS} />
      </section>

      <CtaBand />
    </>
  );
}
