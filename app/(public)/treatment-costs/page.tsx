import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Byline, CtaBand, Faq, PageHero } from "@/components/site/blocks";
import { CostFinder } from "@/components/site/cost-finder";
import { PriceList } from "@/components/site/cost-table";
import { JsonLd } from "@/components/site/json-ld";
import { HeroFacts, ServiceSide, StepStrip } from "@/components/site/page-visuals";
import { DOCTOR, getService, SITE } from "@/lib/content";
import { COST_CATEGORIES, COST_ITEMS, formatInr, formatUsd, FX_NOTE, GST_NOTE, joinList, notIncludedFor, PAYMENT_NOTE, toUsd, TYPICAL_NOTE, USD_INR, type CostCategory, type CostItem } from "@/lib/costs";
import { ROUTES, type ServiceSlug } from "@/lib/routes";
import { breadcrumbJsonLd, costCatalogJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

/**
 * The doctor's price list (lib/costs.ts) for every condition he publishes a figure for — requested by
 * Dr Deraje as a separate page (15 Nov 2026). INR is the billing currency; USD is an approximate guide for
 * overseas patients. The tables render in full on the server; the finder only filters them.
 */
const TITLE = "Plastic & Craniofacial Surgery Costs in Bangalore (INR/USD)";
const DESCRIPTION = "Dr Vybhav Deraje's costs for craniosynostosis, cleft, jaw, ear and cosmetic surgery in Bangalore, in Indian rupees with approximate US dollars.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.costs, bare: true });

const CONSULT = formatInr(1200);
const CONSULT_USD = formatUsd(toUsd(1200));

/** Per category: anchor, the conditions it covers (for the reader and the finder) and the condition pages it links to. */
const CATEGORY: Record<CostCategory, { id: string; label: string; tab: string; intro: string; pages: ServiceSlug[] }> = {
  Consultations: { id: "consultations", tab: "Consultations", label: "Consultations", intro: "The first step for every treatment — in clinic in Bangalore, or by video from anywhere in India or abroad.", pages: [] },
  "Craniosynostosis and Head Shape": { id: "craniosynostosis-head-shape", tab: "Craniosynostosis", label: "Craniosynostosis and Head Shape", intro: "Keyhole and open surgery for Craniosynostosis, Orthotic Helmet Therapy, helmet treatment for flat head, and EarWell ear moulding for newborns.", pages: ["craniosynostosis-surgery-bangalore", "helmet-therapy-flat-head-bangalore", "earwell-infant-ear-correction-bangalore"] },
  "Cleft Lip and Palate": { id: "cleft-lip-palate", tab: "Cleft", label: "Cleft Lip and Palate", intro: "Each stage of cleft care is costed on its own, from lip and palate repair in infancy to bone grafting, nose and jaw surgery as the child grows. Subsidised treatment is available for children from economically disadvantaged families.", pages: ["cleft-lip-and-palate-treatment-bangalore"] },
  "Corrective Jaw Surgery": { id: "jaw-surgery", tab: "Jaw", label: "Corrective Jaw Surgery", intro: "Orthognathic surgery for jaw misalignment. Virtual surgical planning, 3D models and orthodontic braces are billed separately.", pages: ["corrective-jaw-surgery-bangalore"] },
  "Ear Reconstruction": { id: "ear-reconstruction", tab: "Ear", label: "Ear Reconstruction", intro: "Reconstruction of an ear that is small or absent from birth (Microtia), done in two stages.", pages: ["ear-reconstruction-surgery-bangalore"] },
  "Face — Cosmetic": { id: "face", tab: "Face", label: "Face — Cosmetic", intro: "Cosmetic surgery of the nose, eyelids, ears, chin, lips and face. GST is added to these figures.", pages: ["rhinoplasty-surgery-bangalore", "blepharoplasty-eyelid-surgery-bangalore", "otoplasty-ear-correction-bangalore", "chin-augmentation-surgery-bangalore", "facelift-surgery-bangalore"] },
  "Non-Surgical Treatments": { id: "non-surgical", tab: "Non-Surgical", label: "Non-Surgical Treatments", intro: "Injectable and thread treatments, priced per unit or per ml where shown. GST is added to these figures.", pages: ["face-plastic-surgery-bangalore"] },
  "Breast and Body — Cosmetic": { id: "breast-body", tab: "Breast and Body", label: "Breast and Body — Cosmetic", intro: "Breast and body contouring surgery. Compression garments are billed separately, and GST is added to these figures.", pages: ["breast-augmentation-surgery-bangalore", "breast-reduction-surgery-bangalore", "gynecomastia-surgery-bangalore", "tummy-tuck-abdominoplasty-bangalore", "liposuction-surgery-bangalore"] },
};

/** Conditions and everyday words patients search with, per procedure (the finder matches name + category + these). */
const KEYWORDS: Record<string, string> = {
  "Video Consultation — Patients in India": "online", "Video Consultation — Overseas Patients": "online abroad international",
  "Endoscope-Assisted (Keyhole) Craniosynostosis Surgery": "sagittal metopic coronal lambdoid scaphocephaly trigonocephaly endoscopic minimally invasive",
  "Orthotic Helmet Therapy After Keyhole Surgery": "helmet orthotic",
  "Open Surgery — Cranial Vault Remodelling": "sagittal metopic coronal lambdoid skull reshaping",
  "Open Surgery — Fronto-Orbital Advancement and Remodelling": "metopic coronal forehead trigonocephaly skull reshaping",
  "Syndromic / Multisuture Craniosynostosis (Per Stage)": "apert crouzon pfeiffer syndrome",
  "Helmet Therapy for Flat Head Syndrome": "flat head plagiocephaly brachycephaly positional baby head shape helmet",
  "EarWell Infant Ear Correction": "newborn baby ear deformity ear moulding",
  "Speech Surgery": "velopharyngeal nasal speech", "Alveolar Bone Grafting": "gum bone graft", "Cleft Rhinoplasty": "nose", "Jaw Surgery After Cleft": "jaw orthognathic",
  "Single-Jaw Surgery": "orthognathic underbite overbite open bite facial asymmetry", "Double-Jaw Surgery": "orthognathic underbite overbite open bite facial asymmetry", "Genioplasty With Jaw Surgery (Add-On)": "chin orthognathic",
  "Ear Reconstruction for Microtia — Stage 1": "microtia anotia ear", "Ear Reconstruction for Microtia — Stage 2": "microtia anotia ear",
  Rhinoplasty: "nose job nasal hump crooked nose", "Revision Rhinoplasty": "nose secondary",
  "Upper Blepharoplasty": "eyelid droopy hooded eyelids", "Lower Blepharoplasty": "eyelid eye bags under eye", "Asian Blepharoplasty": "eyelid double eyelid crease",
  "Otoplasty (Prominent Ear Correction)": "bat ears protruding ears prominent ears", "Chin Implant": "chin augmentation weak chin", "Sliding Genioplasty": "chin augmentation",
  "Facelift and Neck Lift": "ageing sagging face neck jowls", "Fat Grafting to the Face": "volume hollow cheeks",
  "Lip Reduction — One Lip": "lips", "Lip Reduction — Both Lips": "lips", "Dimple Creation": "cheek dimple", "Ear Lobe Repair — One Side": "torn earlobe split earlobe", "Ear Lobe Repair — Both Sides": "torn earlobe split earlobe",
  Botox: "wrinkles anti-ageing", Fillers: "lips cheeks volume", "Liquid Rhinoplasty": "nose non-surgical", "Skin Boosters": "skin hydration", "Thread Lift": "sagging lift",
  "Breast Augmentation — Silicone Implants": "breast enlargement implants", "Breast Augmentation — Fat Transfer": "breast enlargement natural", "Breast Reduction": "heavy breasts", "Breast Lift (Mastopexy)": "sagging breasts",
  "Gynaecomastia Surgery": "male breast gynecomastia", "Tummy Tuck (Abdominoplasty)": "belly loose skin after pregnancy", "Liposuction — One Area": "fat removal", "Liposuction — Each Additional Area": "fat removal",
  "Arm Lift (Brachioplasty)": "loose skin arms weight loss", "Thigh Lift (Thighplasty)": "loose skin thighs weight loss",
};
const searchTerms = (c: CostItem) => `${c.name} ${CATEGORY[c.category].label} ${KEYWORDS[c.name] ?? ""}`;

const SUGGESTIONS = ["Craniosynostosis", "Cleft", "Jaw", "Microtia", "Rhinoplasty", "Blepharoplasty", "Tummy Tuck", "Breast", "Liposuction"];

const STEPS = [
  { title: "Consultation", text: `In clinic or by video, ${CONSULT} (about ${CONSULT_USD}). Send reports, scans and photographs ahead.` },
  { title: "Assessment", text: "Dr Vybhav examines you or your child and explains the options, recovery and limitations." },
  { title: "Your Estimate", text: "The clinic confirms an individual estimate — before you book travel if you live abroad." },
  { title: "Payment", text: "Billed in Indian rupees; pay online, including by credit card." },
];

const FAQS = [
  { q: "Are these the final costs?", a: `No. ${TYPICAL_NOTE} The clinic gives you an individual estimate before you commit to surgery, and overseas patients receive it before they book travel.` },
  { q: "What is not included in the figures?", a: `Depending on the procedure: ${joinList(notIncludedFor(COST_ITEMS))}. Travel, accommodation and visa costs are not included. Each procedure page lists what applies to that operation.` },
  { q: "Is GST included?", a: `${GST_NOTE} The figures for Craniosynostosis, Cleft Lip and Palate, Corrective Jaw Surgery, Ear Reconstruction, Helmet Therapy and EarWell are shown as quoted by the doctor.` },
  { q: "How much is a consultation, and can I consult from abroad?", a: `An in-clinic consultation, a video consultation from within India and a video consultation from overseas each cost ${CONSULT} (about ${CONSULT_USD}). Overseas patients usually start with a video consultation, sending their reports and photographs ahead.` },
  { q: "Why are prices shown in US dollars?", a: `Many patients travel to Bangalore from other countries. The US dollar figures are a guide converted at ₹${USD_INR} to US$1; costs are billed in Indian rupees, so the amount in your currency depends on the exchange rate when you pay.` },
  { q: "How can I pay from outside India?", a: `${PAYMENT_NOTE} Bills are raised in Indian rupees; your card provider converts the amount to your currency.` },
  { q: "Is the cost of syndromic craniosynostosis surgery for the whole treatment?", a: "No. Syndromic and multisuture Craniosynostosis is usually treated in stages through childhood, and the figure shown is per stage." },
  { q: "Is help available with the cost of cleft treatment?", a: "Yes. Subsidised treatment is available for children with Cleft Lip and Palate from economically disadvantaged families; ask the clinic when you enquire." },
];

const TOC = [...COST_CATEGORIES.map((c) => ({ label: CATEGORY[c].label, id: CATEGORY[c].id })), { label: "How Costs Work", id: "how-costs-work" }, { label: "Travelling from Abroad", id: "travelling" }, { label: "Questions", id: "faq" }];

export default function TreatmentCostsPage() {
  const procedures = COST_ITEMS.filter((c) => c.category !== "Consultations");
  const lo = Math.min(...procedures.filter((c) => !c.per).map((c) => c.inrFrom));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Patient Resources", path: ROUTES.resources },
            { name: "Treatment Costs", path: ROUTES.costs },
          ]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.costs, speakable: ["#summary", ".faq"] }),
          costCatalogJsonLd(COST_ITEMS, { path: ROUTES.costs, name: `${DOCTOR.name} — typical treatment costs (INR, with approximate USD)`, full: true }),
          faqJsonLd(FAQS),
        ]}
      />
      <PageHero
        eyebrow="Patient Resources · Treatment Costs"
        crumb={[{ label: "Patient Resources", href: ROUTES.resources }, { label: "Treatment Costs" }]}
        title="Treatment Costs"
        lead={`Dr Vybhav Deraje's costs for every condition he treats with a published figure — Craniosynostosis, Cleft Lip and Palate, jaw and ear surgery, and cosmetic surgery — in Indian rupees, with US dollars for patients travelling from abroad.`}
        after={
          <HeroFacts
            facts={[
              { value: CONSULT, label: `Consultation, in clinic or by video (about ${CONSULT_USD})` },
              { value: `From ${formatInr(lo)}`, label: `${procedures.length} procedures with published costs` },
              { value: "INR · Card", label: "Billed in rupees; pay online or by credit card" },
            ]}
          />
        }
        media={<CostFinder suggestions={SUGGESTIONS} />}
      />
      <section className="section container cost-page">
        <Byline />
        <dl className="cost-legend" id="summary" aria-label="At a Glance">
          <div>
            <dt>What the Figures Are</dt>
            <dd>{TYPICAL_NOTE}</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>Billed in Indian rupees. US dollar figures are approximate, at ₹{USD_INR} to US$1.</dd>
          </div>
          <div>
            <dt>GST and Extras</dt>
            <dd>
              GST is added to cosmetic procedures (marked <span className="cost-badge">+ GST</span>). Each procedure also lists what is billed separately.
            </dd>
          </div>
        </dl>
        <nav className="cost-tabs" aria-label="Cost categories">
          {COST_CATEGORIES.map((c) => (
            <a key={c} href={`#${CATEGORY[c].id}`}>
              {CATEGORY[c].tab}
            </a>
          ))}
        </nav>
        <PriceList
          searchTerms={searchTerms}
          groups={COST_CATEGORIES.map((cat) => {
            const info = CATEGORY[cat];
            const pages = info.pages.map((s) => getService(s)).filter((p) => p !== undefined);
            return {
              id: info.id,
              label: info.label,
              intro: info.intro,
              items: COST_ITEMS.filter((c) => c.category === cat),
              links: cat === "Consultations" ? [{ href: ROUTES.contact, label: "Book a Consultation" }] : pages.map((p) => ({ href: p.path, label: p.shortTitle })),
              linksLabel: cat === "Consultations" ? "" : undefined,
            };
          })}
        />
      </section>
      <section className="section container content-grid cost-details">
        <article className="prose service-prose">
          <section id="how-costs-work">
            <h2>How Costs Work</h2>
            <StepStrip steps={STEPS} />
            <p>{TYPICAL_NOTE}</p>
            <p>Depending on the procedure, these are billed separately: {joinList(notIncludedFor(COST_ITEMS))}. The procedure pages list what applies to each operation, and your estimate sets out exactly what is included.</p>
          </section>

          <section id="travelling" className="travel-callout" aria-labelledby="abroad-heading">
            <h2 id="abroad-heading">Travelling from Another Country?</h2>
            <ul>
              <li>Start with a video consultation ({CONSULT}, about {CONSULT_USD}). Send your reports, scans and photographs to the clinic first.</li>
              <li>The clinic confirms your individual estimate and the dates before you book travel.</li>
              <li>Most overseas patients travel on India&apos;s e-Medical Visa, with an e-Medical Attendant Visa for a companion; check the current rules on the official Indian visa website before applying.</li>
              <li>Travel, accommodation and visa costs are not included in the figures on this page.</li>
            </ul>
            <p className="note">{FX_NOTE}</p>
            <p className="cost-actions">
              <Link className="button small" href={ROUTES.contact} data-analytics-cta="costs_video_consult">
                Request a Video Consultation <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
              <a className="text-link" href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" /> Send Reports on WhatsApp
              </a>
            </p>
          </section>

          <section id="faq">
            <h2>Frequently Asked Questions</h2>
            <Faq items={FAQS} />
          </section>
          <p className="note">
            Costs published by {DOCTOR.name} for patients and families. Figures are typical, not a quotation, and can change. Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for your estimate.
          </p>
        </article>
        <ServiceSide toc={TOC.slice(COST_CATEGORIES.length)} />
      </section>
      <CtaBand />
    </>
  );
}
