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

## International visitors — contact page note (22 Oct 2026)
- `/contact-us` now carries a short "Patients travelling from abroad" card: use the form (with a country selector for the phone number) or email; replies are in IST; don't email medical reports unsolicited. **Confirm the doctor accepts overseas enquiries and whether he offers video consultations** — the copy deliberately promises neither until he says so. If he does, say so here and the card (and the FAQ on the home page) should state it.
- Data-protection note for the privacy policy: visitors from the EU/UK/Gulf are submitting personal data to servers hosted outside India (Vercel/Neon). The policy should name where data is stored and the legal basis; this is a legal-review item, not something drafted here.

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
