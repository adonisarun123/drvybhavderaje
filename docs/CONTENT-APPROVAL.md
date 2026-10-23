# Items requiring practice approval before launch

Nothing below was invented; everything comes from the supplied design package or the existing website.
It still needs the doctor's sign-off.

## Clinical copy — 11 new procedure pages (22 Oct 2026) — REVIEW BEFORE LAUNCH
Source: `lib/procedures.ts`. The ten cosmetic pages expand the doctor's existing one-paragraph descriptions (anaesthesia, admission, recovery, technique) with general patient-education sections written in non-promissory language. Points for the doctor to confirm or strike:
- **Ear reconstruction** had no content on the live site. The page is a draft from standard craniofacial practice: rib-cartilage two-stage reconstruction from ~8–10 years, porous polyethylene as an alternative, hearing pathway with ENT/audiology. Confirm the techniques and ages he actually offers.
- Rhinoplasty: open vs closed approach, septal cartilage grafts, revision rhinoplasty, 6-week contact-sport advice.
- Blepharoplasty: transconjunctival lower-lid option, 5–7 day sutures, contraindications listed.
- Otoplasty: age 5–6 timing, adults under local + sedation, headband for several weeks, lobe repair under local.
- Chin: Medpor and silicone implants, sliding genioplasty with titanium plates, intra-oral incision, 6–8 week final contour.
- Facelift: SMAS technique, submental incision for neck, mini-lift option, 2-week return to work, 4-week exercise.
- Tummy tuck: mini-abdominoplasty option, 6-week garment; existing figures (3–4 day stay, 1 week, 6 weeks) retained.
- Breast augmentation: inframammary incision default, sub-/pre-pectoral, "not lifetime devices", augmentation-mastopexy, breastfeeding statement.
- Breast reduction: pedicle technique, vertical/anchor scars, breastfeeding "cannot be guaranteed".
- Gynaecomastia: adolescent deferral, compression vest 4–6 weeks, periareolar gland excision.
- Liposuction: MicroAire PAL retained; tumescent infiltration, 4–6 week garment, 3-month final contour.
- All pages: scars, risks and limitations wording; the standing "Is a consultation a commitment" and "cost estimate" FAQs reused from the hub pages.

## Clinical copy
- All care-page text and FAQs (`lib/content.ts → SERVICE_PAGES`, `HOME_FAQS`) — general, non-promissory wording; the doctor should confirm accuracy and tone.
- Home hero statements: "National Board certified plastic surgeon", "Fellowship-trained in craniofacial surgery, Adelaide", "International training India · United Kingdom · Australia".
- Credentials list on `/about` (MBBS KIMS; MS Mysore Medical College; DNB Plastic Surgery, Lok Nayak Hospital & MAMC; Queen Victoria Hospital, East Grinstead; Australian Craniofacial Unit, Adelaide) — summarised from the existing website.
- Portrait: `public/images/doctor.png` is the 466×588 image from the existing site. A higher-resolution approved portrait is recommended.
- The `vd` monogram is a design concept, not an approved brand asset.

## International visitors (22 Oct 2026) — confirmed by Arun
- The doctor accepts overseas patients and offers video consultations. Live on the site: the "Patients from abroad are welcome" card on `/contact-us`, a "Video consultation" choice in the enquiry form (stored as `clinic_preference = video_consultation`, labelled in Admin), and a home-page FAQ. The FAQ states that surgery always needs an in-person assessment in Bangalore — confirm this wording.
- Privacy policy now has a "Where your data is stored and international transfers" section naming Neon (AWS Singapore), Vercel (Singapore functions, global CDN), ImageKit and Google Analytics, consent as the legal basis, and the visitor's rights. `vercel.json` pins functions to `sin1` so the statement is true. Google Analytics now loads only after "Accept analytics" in the cookie banner (Consent Mode v2 defaults denied, IP anonymised, choice kept 6 months, "Cookie settings" in the footer). Expect GA to under-count by the decline rate — that is the compliant trade-off, not a bug.

## Clinic information
- Addresses and phone numbers for Whitefield, HRBR Layout and Koramangala (Aesthetica Veda) — taken from the existing site; confirm they are current. Editable in Admin → Clinics.
- Main practice phone `+91 95355 81616` and email `connect@drvybhavderaje.com`.
- Working hours are **not** published and are not seeded; staff must configure them.

## Privacy and data handling
- `/privacy` wording (data collected, retention, staff access) must be reviewed by the practice before `ENQUIRIES_ENABLED` is turned on.
- Consent text version is recorded as `2026-10-privacy-v1` on each enquiry; bump `CONSENT_VERSION` when the notice changes.

## Decisions outstanding
- Whether to add testimonials/terms pages (legacy URLs currently 404 — see docs/SEO-MIGRATION.md).
- ~~Whether to add dedicated sub-service pages for long-tail SEO.~~ Done 22 Oct 2026 (11 pages).
- Notification provider (email/SMS) — none configured; staff contact patients manually.

## Practices (added 23 Oct 2026)

The site now names and links both practices — **The Head Shape Clinic** (theheadshapeclinic.com) and **Aesthetica Veda** (aestheticaveda.com) — on the home page, About, Practice locations, every service page's "At a glance" box, the footer, structured data and llms.txt. The one-paragraph descriptions in `lib/content.ts` (`PRACTICES`) were drafted from the two public websites; please confirm the wording, the Head Shape Clinic's location (Docube Clinic, Koramangala) and the "outreach clinics in other Indian cities" line.

## Helmet therapy and EarWell pages (added 23 Oct 2026)

Two new pages under "Also treated" — `/helmet-therapy-flat-head-bangalore` and `/earwell-infant-ear-correction-bangalore` — written from theheadshapeclinic.com's own Helmet Therapy and Ear Well System pages, with no figures added. Points for the doctor:

- **Helmet duration after endoscopic craniosynostosis surgery:** theheadshapeclinic.com says 6–15 months; drvybhavderaje.com's craniosynostosis page says 1–2 years. The new page says "from about 6 months and in some cases up to 1–2 years". Please confirm one figure and we will align both pages.
- Partner names (Orthomerica, KARE Orthotics & Prosthetics, MediTEC Devices, Becon Medical / Dr H. Steven Byrd) and the EarWell 93–95% figure are quoted from theheadshapeclinic.com; confirm they may appear here.
- Both pages route patients to The Head Shape Clinic; neither page is in the 14 featured procedures.

## 15 procedure pages from the patient-information sheets (added 23 Oct 2026) — APPROVED 23 Oct 2026

One page per sheet that had no page of its own, nested under its parent (source: `lib/sub-procedures.ts`; URLs `/<parent>/<procedure>`). Copy is the doctor's own sheet, edited for plain language only; FAQs restate the sheet. Sheets that already feed a page (craniosynostosis types, the 10 cosmetic pages, jaw surgery, facial injuries, head & neck cancer) did not get a second page.

- Cleft (`/cleft-lip-and-palate-treatment-bangalore/…`): cleft-lip-repair, cleft-palate-repair, speech-surgery, alveolar-bone-grafting, cleft-jaw-surgery, cleft-rhinoplasty
- Hand (`/hand-plastic-surgeon-bangalore/…`): carpal-tunnel-release, trigger-finger-release, syndactyly-release
- Face (`/face-plastic-surgery-bangalore/…`): endoscopic-scarless-forehead-surgery, fat-grafting
- Breast (`/breast-plastic-surgeon-bangalore/…`): breast-lift-mastopexy, breast-reconstruction-after-cancer
- Body (`/body-plastic-surgeon-bangalore/…`): arm-lift-brachioplasty, thigh-lift-thighplasty

Points approved by the doctor (23 Oct 2026):
- Cleft jaw surgery: discharge after 3–4 days (the sheet's "34 days" was a typo).
- Breast reconstruction: phyllodes tumour listed under "other breast tumours", not cancers.
- Arm lift, thigh lift and breast lift are day-care procedures.

Full sign-off: the doctor has read all 15 pages (confirmed by Arun, 23 Oct 2026). Cleared for launch.
