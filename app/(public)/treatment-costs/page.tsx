import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Byline, CtaBand, Faq, HelpSideCard, KeyFacts, PageHero } from "@/components/site/blocks";
import { CostTable } from "@/components/site/cost-table";
import { JsonLd } from "@/components/site/json-ld";
import { DOCTOR, SITE } from "@/lib/content";
import { COST_CATEGORIES, COST_ITEMS, formatInr, formatUsd, FX_NOTE, GST_NOTE, joinList, PAYMENT_NOTE, notIncludedFor, toUsd, TYPICAL_NOTE, USD_INR } from "@/lib/costs";
import { ROUTES } from "@/lib/routes";
import { breadcrumbJsonLd, costCatalogJsonLd, faqJsonLd, medicalWebPageJsonLd, pageMetadata } from "@/lib/seo";

/**
 * Every cost the doctor chose to publish (lib/costs.ts), in INR with an approximate USD column for overseas
 * patients. Built for the "<procedure> cost in Bangalore / India" searches and for assistants answering them.
 */
const TITLE = "Treatment Costs in Bangalore — INR and USD";
const DESCRIPTION = "Typical costs for craniosynostosis, cleft, jaw, ear and cosmetic surgery with Dr Vybhav Deraje in Bangalore, in Indian rupees with approximate US dollars.";

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: ROUTES.costs });

const CONSULT = formatInr(1200);
const CONSULT_USD = formatUsd(toUsd(1200));

const FAQS = [
  { q: "Are these the final costs?", a: `No. ${TYPICAL_NOTE} The clinic gives you an individual estimate before you commit to surgery, and overseas patients receive it before they book travel.` },
  { q: "What is not included in the figures?", a: `Depending on the procedure: ${joinList(notIncludedFor(COST_ITEMS))}. Travel, accommodation and visa costs are not included. Each procedure page lists what applies to that operation.` },
  { q: "How much is a consultation, and can I consult from abroad?", a: `An in-clinic consultation, a video consultation from within India and a video consultation from overseas each cost ${CONSULT} (about ${CONSULT_USD}). Overseas patients usually start with a video consultation, sending their reports and photographs ahead.` },
  { q: "Why are prices shown in US dollars?", a: `Many patients travel to Bangalore from other countries. The US dollar figures are a guide converted at ₹${USD_INR} to US$1; costs are billed in Indian rupees, so the amount in your currency depends on the exchange rate when you pay.` },
  { q: "Is GST included?", a: `${GST_NOTE} The figures for craniosynostosis, cleft, jaw and ear reconstruction, helmet therapy and EarWell are shown as quoted by the doctor.` },
  { q: "How can I pay from outside India?", a: `${PAYMENT_NOTE} Bills are raised in Indian rupees; your card provider converts the amount to your currency.` },
  { q: "Is the cost of syndromic craniosynostosis surgery for the whole treatment?", a: "No. Syndromic and multisuture craniosynostosis is usually treated in stages through childhood, and the figure shown is per stage." },
  { q: "Is help available with the cost of cleft treatment?", a: "Yes. Subsidised treatment is available for children with Cleft Lip and Palate from economically disadvantaged families; ask the clinic when you enquire." },
];

export default function TreatmentCostsPage() {
  const surgical = COST_ITEMS.filter((c) => !c.per && c.category !== "Consultations");
  const lo = Math.min(...surgical.map((c) => c.inrFrom));
  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Treatment Costs", path: ROUTES.costs }]),
          medicalWebPageJsonLd({ title: TITLE, description: DESCRIPTION, path: ROUTES.costs, speakable: ["#summary", ".faq"] }),
          costCatalogJsonLd(COST_ITEMS, { path: ROUTES.costs, name: `${DOCTOR.name} — typical treatment costs (INR, with approximate USD)`, full: true }),
          faqJsonLd(FAQS),
        ]}
      />
      <PageHero eyebrow="Patient Resources · Costs" crumb="Treatment Costs" title="Treatment Costs" lead="Typical costs for every procedure Dr Vybhav Deraje publishes a figure for — in Indian rupees, with an approximate US dollar guide for patients travelling from abroad." />
      <section className="section container content-grid">
        <article className="prose service-prose">
          <Byline />
          <KeyFacts title="Costs at a Glance">
            <ul>
              <li>
                <b>Consultation:</b> {CONSULT} (about {CONSULT_USD}) — in clinic, or by video from India or overseas.
              </li>
              <li>
                <b>Procedures:</b> from {formatInr(lo)} (about {formatUsd(toUsd(lo))}) for an uncomplicated case; each figure below is the doctor&apos;s typical range.
              </li>
              <li>
                <b>Currency:</b> Billed in Indian rupees (INR). US dollar figures are approximate, at ₹{USD_INR} to US$1.
              </li>
              <li>
                <b>GST:</b> Not included for cosmetic procedures; added to the bill.
              </li>
              <li>
                <b>Payment:</b> Online, including by credit card; billed in Indian rupees.
              </li>
              <li>
                <b>Usually Not Included:</b> {joinList(notIncludedFor(COST_ITEMS))}, depending on the procedure.
              </li>
              <li>
                <b>Your Estimate:</b> Confirmed individually after assessment — before travel for overseas patients.
              </li>
            </ul>
          </KeyFacts>
          <p className="intro">{TYPICAL_NOTE}</p>

          {COST_CATEGORIES.map((cat) => {
            const items = COST_ITEMS.filter((c) => c.category === cat);
            const notes = items.filter((c) => c.note);
            return (
              <section key={cat}>
                <h2>{cat}</h2>
                <CostTable items={items} currentPath={ROUTES.costs} />
                {notes.map((c) => (
                  <p key={c.name} className="note">
                    {c.name}: {c.note}.
                  </p>
                ))}
              </section>
            );
          })}

          <section>
            <h2>What the Figures Cover</h2>
            <p>{TYPICAL_NOTE}</p>
            <p>{GST_NOTE}</p>
            <p>Depending on the procedure, these are billed separately: {joinList(notIncludedFor(COST_ITEMS))}. The procedure pages list what applies to each operation, and your written estimate sets out exactly what is included.</p>
          </section>

          <section className="travel-callout" aria-labelledby="abroad-heading">
            <h2 id="abroad-heading">Travelling from Another Country?</h2>
            <ul>
              <li>Start with a video consultation ({CONSULT}, about {CONSULT_USD}). Send your reports, scans and photographs to the clinic first.</li>
              <li>The clinic confirms your individual estimate and the dates before you book travel.</li>
              <li>Most overseas patients travel on India&apos;s e-Medical Visa, with an e-Medical Attendant Visa for a companion; check the current rules on the official Indian visa website before applying.</li>
              <li>Travel, accommodation and visa costs are not included in the figures on this page.</li>
            </ul>
            <p className="note">{FX_NOTE}</p>
            <Link className="text-link" href={ROUTES.contact}>
              Request a Video Consultation <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            <Faq items={FAQS} />
          </section>
          <p className="note">
            Costs published by {DOCTOR.name} for patients and families. Figures are typical, not a quotation, and can change. Call <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for your estimate.
          </p>
        </article>
        <HelpSideCard />
      </section>
      <CtaBand />
    </>
  );
}
