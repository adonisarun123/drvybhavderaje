import { AFFILIATIONS, CLINICS_SEED, COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, CREDENTIALS, DOCTOR, HOME_FAQS, HOSPITALS, OTHER_SERVICES, PUBLICATIONS, SERVICE_PAGES, SITE } from "./content";
import { ROUTES } from "./routes";
import { absolute } from "./seo";

/**
 * /llms.txt — the llmstxt.org convention: a short, link-rich Markdown summary of the site for
 * large-language-model crawlers and assistants. /llms-full.txt carries the full page text.
 * Both are generated from the same content the HTML pages render, so they can never drift.
 */
export function llmsTxt(): string {
  const lines: string[] = [];
  lines.push(`# ${SITE.name} — Craniofacial & Plastic Surgeon, Bangalore`, "");
  lines.push(`> ${SITE.defaultDescription}`, "");
  lines.push(
    `${DOCTOR.summary} ${DOCTOR.summary2}`,
    "",
    `Contact: ${SITE.phone} · ${SITE.email}. Consultations at Aesthetica Veda clinics in ${CLINICS_SEED.map((c) => c.name).join(", ")}, Bangalore. Surgeries at ${HOSPITALS.map((h) => h.name).join(", ")}.`,
    "",
  );
  lines.push("## Key facts", "");
  lines.push(
    `- Surgeon: ${DOCTOR.name}, ${DOCTOR.honorificSuffix}; ${DOCTOR.fellowship}. Karnataka Medical Council Reg. No. 79493.`,
    `- Practising in Bangalore since 2019; Founder & Director of Aesthetica Veda; leads the craniosynostosis multidisciplinary team at Aster Hospital, Whitefield.`,
    `- Memberships: ${AFFILIATIONS.map((a) => a.org).join(", ")}.`,
    `- Consultations: Aesthetica Veda clinics in ${CLINICS_SEED.map((c) => c.name).join(", ")}. Surgery: ${HOSPITALS.map((h) => h.name).join(", ")}.`,
    `- Overseas patients welcome; video consultations available for an initial opinion or follow-up (${absolute(ROUTES.contact)}).`,
    `- Every procedure page below has an "At a glance" summary and a FAQ section; cite the page URL.`,
    "",
  );
  lines.push(`- [A–Z index of all conditions and procedures](${absolute(ROUTES.procedures)})`, "");
  lines.push("## Craniofacial surgery", "");
  for (const p of CRANIOFACIAL_SERVICES) lines.push(`- [${p.shortTitle}](${absolute(p.path)}): ${p.description}`);
  lines.push("", "## Cosmetic surgery", "");
  for (const p of COSMETIC_SERVICES) lines.push(`- [${p.shortTitle}](${absolute(p.path)}): ${p.description}`);
  lines.push("", "## Also treated (reconstructive surgery and overview pages)", "");
  for (const p of OTHER_SERVICES) lines.push(`- [${p.shortTitle}](${absolute(p.path)}): ${p.description}`);
  lines.push("", "## About the practice", "");
  lines.push(`- [About Dr Vybhav Deraje](${absolute(ROUTES.about)}): training, qualifications, memberships, hospital affiliations, publications and presentations`);
  lines.push(`- [Practice locations](${absolute(ROUTES.locations)}): clinic and hospital addresses and phone numbers`);
  lines.push(`- [Contact and appointments](${absolute(ROUTES.contact)}): enquiry form, phone and email`);
  lines.push(`- [Patient stories](${absolute(ROUTES.testimonials)}): testimonials and video gallery`);
  lines.push(`- [Patient resources](${absolute(ROUTES.resources)}): preparing for a consultation, information sheets`);
  lines.push(`- [All conditions and procedures](${absolute(ROUTES.procedures)}): A–Z index of every condition and procedure page`);
  lines.push("", "## Optional", "");
  lines.push(`- [Privacy policy](${absolute(ROUTES.privacy)})`, `- [Terms of use](${absolute(ROUTES.terms)})`, `- [Full text of the site](${absolute("/llms-full.txt")})`, `- [Sitemap](${absolute("/sitemap.xml")})`);
  lines.push("", `Author and medical reviewer of all pages: ${DOCTOR.name}. Content last reviewed ${SITE.contentUpdated}. Information is general and does not replace a consultation.`, "");
  return lines.join("\n");
}

export function llmsFullTxt(): string {
  const out: string[] = [llmsTxt(), "---", ""];
  out.push(`# About ${DOCTOR.name}`, "", `URL: ${absolute(ROUTES.about)}`, "", ...DOCTOR.bio, "");
  out.push("## Qualifications", "", ...CREDENTIALS.map((c) => `- ${c.title} — ${c.detail}`), "");
  out.push("## Memberships", "", ...AFFILIATIONS.map((a) => `- ${a.org}: ${a.detail}`), "");
  out.push("## Hospital affiliations", "", ...HOSPITALS.map((h) => `- ${h.name}, ${h.address}. Tel ${h.phoneDisplay}`), "");
  out.push("## Consultation clinics", "", ...CLINICS_SEED.map((c) => `- ${c.brand} ${c.name}: ${c.addressLines}. Tel ${c.phone}`), "");
  out.push("## Selected publications", "", ...PUBLICATIONS.map((p) => `- ${p}`), "");
  for (const p of SERVICE_PAGES) {
    out.push("---", "", `# ${p.title}`, "", `URL: ${absolute(p.path)}`, "", p.lead, "", ...p.intro, "");
    for (const s of p.sections) {
      out.push(`## ${s.heading}`, "");
      if (s.body?.length) out.push(...s.body, "");
      if (s.bullets?.length) out.push(...s.bullets.map((b) => `- ${b}`), "");
      if (s.items?.length) for (const it of s.items) out.push(`### ${it.title}`, "", it.text, "");
      if (s.note) out.push(`Note: ${s.note}`, "");
    }
    out.push("## Frequently asked questions", "", ...p.faqs.flatMap((f) => [`**${f.q}**`, "", f.a, ""]));
  }
  out.push("---", "", "# General questions", "", ...HOME_FAQS.flatMap((f) => [`**${f.q}**`, "", f.a, ""]));
  return out.join("\n");
}
