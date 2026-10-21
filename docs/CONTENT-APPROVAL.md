# Items requiring practice approval before launch

Nothing below was invented; everything comes from the supplied design package or the existing website.
It still needs the doctor's sign-off.

## Clinical copy
- All care-page text and FAQs (`lib/content.ts → SERVICE_PAGES`, `HOME_FAQS`) — general, non-promissory wording; the doctor should confirm accuracy and tone.
- Home hero statements: "National Board certified plastic surgeon", "Fellowship-trained in craniofacial surgery, Adelaide", "International training India · United Kingdom · Australia".
- Credentials list on `/about` (MBBS KIMS; MS Mysore Medical College; DNB Plastic Surgery, Lok Nayak Hospital & MAMC; Queen Victoria Hospital, East Grinstead; Australian Craniofacial Unit, Adelaide) — summarised from the existing website.
- Portrait: `public/images/doctor.png` is the 466×588 image from the existing site. A higher-resolution approved portrait is recommended.
- The `vd` monogram is a design concept, not an approved brand asset.

## Clinic information
- Addresses and phone numbers for Whitefield, HRBR Layout and Koramangala (Aesthetica Veda) — taken from the existing site; confirm they are current. Editable in Admin → Clinics.
- Main practice phone `+91 95355 81616` and email `connect@drvybhavderaje.com`.
- Working hours are **not** published and are not seeded; staff must configure them.

## Privacy and data handling
- `/privacy` wording (data collected, retention, staff access) must be reviewed by the practice before `ENQUIRIES_ENABLED` is turned on.
- Consent text version is recorded as `2026-10-privacy-v1` on each enquiry; bump `CONSENT_VERSION` when the notice changes.

## Decisions outstanding
- Whether to add testimonials/terms pages (legacy URLs currently 404 — see docs/SEO-MIGRATION.md).
- Whether to add dedicated sub-service pages for long-tail SEO.
- Notification provider (email/SMS) — none configured; staff contact patients manually.
