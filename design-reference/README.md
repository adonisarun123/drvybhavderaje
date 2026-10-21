# Dr Vybhav Deraje — HTML design package

Open index.html in a browser. No installation or build step is needed.

## Contents
- 10 content pages plus a 404 page, with relative links.
- assets/styles.css: the implemented design styles, including responsive rules.
- assets/site.js: mobile navigation, Escape support and form-submission prevention.
- assets/doctor.png: original portrait from the existing practice site.
- assets/favicon.svg: proposed wordmark favicon.
- Dr_Vybhav_Design_Language.md: design specifications and production considerations.
- design-tokens.json: actual implementation tokens.

The separate Dr_Vybhav_Redesign.html file is a single-file version containing all pages, styling, interactions and images. Its hash-based navigation works directly from disk.

## Functionality
Mobile navigation and native FAQ disclosures work. Clinic calls, email links and map links use the existing practice website’s published details. Links to external services require internet access. This package makes no background network requests and uses no external fonts or scripts.

The consultation form is a non-submitting prototype. Its submit button is disabled and no patient details are stored or transmitted. The HTML package does not contain a backend or Neon connection. Use the Next.js server route and database migration from the original project when implementing the production enquiry workflow. Never put a Neon connection string in HTML or browser JavaScript.

## Design provenance
This is the implemented redesign concept, inspired by audience-first healthcare navigation. It is not a pixel-exact copy of UnitedHealthcare. The concept wordmark is not claimed to be Dr Vybhav’s approved brand logo.

## Production
Confirm clinical copy, qualifications, locations, privacy terms and photo use with the practice. Connect and test Neon server-side, approve the enquiry workflow, configure canonical URLs and redirects, and complete desktop/mobile accessibility and visual review before launch. HTML exports retain noindex because they are design-review deliverables.

No live website or database has been changed by this export.
