# Dr Vybhav Deraje — Website Design Language

**Version:** 1.0 · **Date:** 21 October 2026  
**Purpose:** Design and developer handoff for the current redesign.  
**Status:** Implemented visual specification, with separately identified production recommendations.

## 1. Design direction

**Calm, clear, personal specialist care.** The website should help a parent or adult patient understand where to start, recognise the doctor, find relevant care information and arrange a consultation without pressure.

The design uses a white and pale-blue foundation, deep navy typography, purposeful blue actions, restrained corner rounding and generous section spacing. Editorial headings and an authentic doctor portrait give the website a human identity. Soft colours distinguish service pathways without suggesting clinical rankings or different standards of care.

The main audiences are families seeking craniosynostosis or craniofacial care and adults exploring cosmetic or reconstructive consultations. Each audience receives its own clearly named entry point. All journeys lead to understandable information and a consultation request, rather than a promise of treatment or an immediate booking.

### Relationship to the UnitedHealthcare reference

The reference is [UnitedHealthcare](https://www.uhc.com/). Its accessible page text informed the use of audience-led entry points, clearly grouped services, practical help and FAQs. The original reference capture did **not** produce an inspected screenshot or extracted branding data. Exact UHC typefaces, colours, spacing, breakpoints and visual fidelity have not been established.

The visual values in this guide are independently proposed and implemented values from this redesign. They are **not extracted UHC brand tokens**, and this is not a pixel-for-pixel reproduction. The proposed `vd` wordmark is also a concept, not a verified existing clinic logo.

## 2. Colour system

### Core semantic palette

| CSS token | Value | Implemented role |
| --- | --- | --- |
| `--navy` | `#08294A` | Headings, primary text, dark consultation band |
| `--blue` | `#0759C7` | Primary actions, links, icons, highlighted heading word |
| `--muted` | `#536578` | Supporting copy and descriptions |
| `--pale` | `#EDF5FC` | Inner-page title area and information feedback |
| `--line` | `#DCE4EC` | Card borders, dividers and disclosure rules |
| `--white` | `#FFFFFF` | Main canvas, navigation and inverse text |

### Supporting surfaces and states

| Use | Value | Notes |
| --- | --- | --- |
| Primary button hover | `#03449C` | Darker blue; white text retained |
| Hero left field | `#F4F8FB` | Desktop hero gradient begins here |
| Hero right field | `#E9F2FA` | Desktop hero changes at 61% on a 100° angle |
| Mobile hero / feature section | `#F2F7FC` | Flat support surface |
| Craniosynostosis card | `#EDF5FE` | Border: `#D3E5F8` |
| Cosmetic care card | `#F6F7FD` | Very light lavender |
| Cleft care card | `#F4F8F5` | Very light green |
| Reconstructive care card | `#FFF9F3` | Very light warm neutral |
| Feature illustration field | `#DFEEF9` | Abstract rings and baby line icon |
| Journey section | `#F8F9FB` | Soft neutral background |
| Footer | `#F5F7FA` | Distinct closing surface |
| Utility bar | `#EDF4FA` | Utility copy: `#41566B` |
| Input border | `#A8B9CA` | Stronger than decorative card borders |
| Error background / border | `#FFF4F1` / `#A13C31` | Pair with a written error message |
| Preview notice background / border / text | `#FFF7E8` / `#EDDDBA` / `#6B5529` | Identifies the current preview state |

Use blue selectively for actions and navigational emphasis. Keep most body copy slate and headings navy. The pastel care surfaces are navigational aids; always include a written service name. Avoid bright gradients, neon accents, heavy glass effects or colour as the only carrier of meaning.

## 3. Typography

### Typeface

The interface uses `Arial, Helvetica, sans-serif`. It requires no external font service. The concept monogram alone uses italic `Georgia, serif`. Retain the system stack for this export; any future switch to a licensed brand font should be treated as a visual revision and checked for reflow.

### Implemented scale

| Element | Default / desktop | Smaller-screen behaviour | Other properties |
| --- | --- | --- | --- |
| Homepage H1 | 62px | 52px at ≤1080; 42px at ≤800; 49px at ≤580; 68px at ≥1500 | Weight 500; line-height 1.08; default tracking −2.6px |
| Inner-page H1 | 51px | 39px at ≤580 | Max width 800px |
| Section H2 | 39px | 32px at ≤800 | Weight 500; line-height 1.13; default tracking −1.4px |
| General H3 | 23px | Component-specific | Weight 500; tracking −0.6px |
| Care-card title | 21px | 19px at ≤580 | Line-height 1.25; tracking −0.5px |
| Inner-page introduction | 17px | 15px at ≤580 | Max width 680px |
| Body base | 16px | Inherited unless overridden | Line-height 1.6 |
| Hero description | 15px | 13px at ≤800; 14px at ≤580 | Line-height 1.8; max width 445px |
| Content descriptions | 12–14px | Component-specific | Usually line-height 1.8–1.85 |
| Eyebrow / section label | 10px | Generally 9px at ≤580 | Uppercase, 700 weight, tracking 1.7px |
| Primary button | 13px | Homepage action becomes 11px at ≤580 | Weight 600 |
| Main navigation | 12px | 11px at ≤1080; 14px in expanded mobile menu | Weight 500 |
| Form labels | 13px | Unchanged | Labels remain visible above fields |
| Footnotes | 12px | Unchanged except footer-specific rules | Muted text |

The homepage title becomes larger again on small phones because the hero changes from two columns to one. These are the actual breakpoint values, not a fluid type scale.

**Production recommendation:** Raise small body, navigation, caption and eyebrow text where needed after reviewing at real device sizes. The current design includes 8–12px secondary text; that should not be treated as an accessibility target. Essential patient instructions should normally be at least 16px, with secondary copy comfortably readable and no information carried only in tiny text.

### Writing and hierarchy

Use one primary H1 per page, followed by section H2s and card/topic H3s. Use sentence case for headings. Reserve uppercase for short navigation labels and eyebrows. Prefer clear phrasing such as “Request a consultation”, “Explore care” and “What to bring”. Keep paragraphs short and headings informative.

## 4. Layout, spacing and geometry

### Containers and breakpoints

| Viewport rule | Container | Main structural behaviour |
| --- | --- | --- |
| Default desktop | `min(1180px, 100% − 88px)` | 44px minimum side gutters |
| ≥1500px | 1240px | Larger hero and portrait |
| ≤1080px | `100% − 48px` | 24px gutters; tighter gaps |
| ≤800px | `100% − 40px` | 20px gutters; mobile menu; two care columns; one clinic/form column |
| ≤580px | `100% − 36px` | 18px gutters; stacked hero, feature, doctor, steps and FAQ |

### Primary grids

| Section | Desktop grid | Gap |
| --- | --- | --- |
| Hero | `1.12fr 1fr` | 42px |
| Trust strip | Three equal columns | Internal item spacing 17px |
| Care cards | Four equal columns | 18px |
| Craniosynostosis feature | `1fr 1.1fr` | 80px |
| Doctor introduction | `1.1fr 1fr` | 80px |
| Visit steps | Three equal columns | 55px |
| FAQ | `1fr 1.6fr` | 70px |
| Inner content + sidebar | `1.5fr 0.8fr` | 65px |
| Clinic cards | Three equal columns | 22px |
| Footer | `1.6fr 1fr 1fr` | 70px |

The four care cards remain in **two columns** on narrow phones in this version. Clinic cards switch to one column at 800px. The footer uses two columns on phones, with the contact block spanning both.

### Spacing rhythm

Implemented values cluster around 12, 18, 20, 24, 28, 32, 36, 40, 54, 64, 66, 76 and 80px. The current stylesheet is component-specific rather than a strict 8px token scale.

- Main section vertical padding: 76px desktop, 54px at ≤800px.
- Hero copy: 56px vertically; 36px top and 20px bottom on phones.
- Section heading to content: 36px, reducing to 28px on phones.
- Care-card padding: 26px top, 22px sides/bottom; 20px/15px on phones.
- Inner sidebar: 28px padding.
- Form panel: 32px padding, then 24px at ≤800px and 22px at ≤580px.
- Desktop consultation band: 38px vertical / 40px horizontal padding.

### Edges, shadows and motion

- Buttons, fields and topic rows: 4px radius.
- Cards, forms and CTA band: 6px radius.
- Feature illustration: 8px radius.
- Standard decorative border: 1px solid `#DCE4EC`.
- Portrait label shadow: `0 8px 30px #0929480A`.
- Care-card hover: rise 4px; shadow `0 8px 24px #0C396914`.
- Most transitions last 200ms.
- Smooth in-page scrolling is enabled, with 100px scroll padding.
- `prefers-reduced-motion: reduce` disables transitions and smooth scrolling.

Avoid adding motion that delays access to information. No autoplay video, testimonial carousel or rotating hero is required by this design.

## 5. Component language

### Header and navigation

The desktop header pairs the concept wordmark with doctor, expertise, resources, locations and consultation links. A pale utility strip exposes the location and telephone. The header is in normal document flow; it is not sticky in this version.

At 800px and below, a labelled menu button controls the navigation using `aria-expanded` and `aria-controls`. The open panel sits beneath the header with a white background and subtle shadow. The wordmark links home, and the “Our expertise” link points to the homepage care section.

**Recommended refinement:** Add current-page indication, Escape-to-close and close-on-navigation behaviour to the mobile menu when reviewing the final production interaction. Verify keyboard focus order rather than assuming the menu behaves correctly from appearance alone.

### Hero and portrait

The hero has a short eyebrow, three-line headline, concise introduction, primary consultation action and secondary doctor-profile link. A small qualification note sits below the actions.

Use the real doctor image supplied by the existing website. The current file is `doctor.png`, 466 × 588px. It is visually cropped within a tall arch rather than displayed as a floating cutout. The desktop frame is 448px high, 90% of its grid cell and rounded `180px 180px 10px 10px`; the phone frame is 340px high, 87% wide and rounded `140px 140px 8px 8px`. The image uses CSS `object-fit: cover` and saturation 0.8. A compact white identification label overlaps the lower image area.

**Production recommendation:** Obtain a higher-resolution approved portrait, preserve its natural appearance and test the crop at 320, 375, 390, 768, 1024 and 1440px. Do not replace the doctor with an AI-generated lookalike or imply that stock people are patients.

### Care pathways

Each card is one complete link with a line icon, service name, short explanation and “Explore care” action. Icons use a consistent Lucide-style outline; the default care icon is 37px with a 1.3 stroke. Cards align their action rows at the bottom using flex layout. No clinical claim should depend on an icon or pastel surface.

### Buttons and links

| State | Implemented treatment |
| --- | --- |
| Primary | Blue fill, white label, 4px radius, 50px minimum height |
| Compact header action | 44px minimum height, smaller typography |
| Hover | Darker blue fill |
| Inverse | White action on navy CTA band |
| Disabled | 50% opacity, unavailable cursor |
| Text link | Blue label with directional icon; underline on hover |
| Focus | Browser focus outline retained with 5px offset |

Prefer one visually dominant action per section. Use `tel:` links for telephone actions and `mailto:` links for email. An enquiry request must never be labelled as a confirmed appointment.

### FAQs

Use native `details` and `summary` elements. A plus indicator rotates 45° when open. Thin horizontal rules separate questions. The current pattern permits multiple questions to be open at the same time. Do not hide essential safety or booking information exclusively inside disclosures.

### Consultation form

The current form collects name, phone, optional email and preferred clinic. Contact consent is required. A hidden honeypot field is excluded from keyboard navigation. A two-column desktop field grid becomes one column at 800px. Controls have visible labels, a 47px minimum height and stronger borders than decorative cards.

The interface contains unavailable, sending, error and success states. Success explicitly means the request was received, with clinic confirmation still needed. Errors use written messages and `role="alert"`; success uses `role="status"`.

In this preview, submission remains disabled. An HTML export cannot itself connect safely to Neon. It should retain the unavailable message and working clinic telephone links until a server endpoint is connected.

### Clinic directory and contact

The three clinic cards show location name, address, telephone, directions and consultation link. Directions open Google Maps in a new tab with `noopener noreferrer`. Confirm current clinic details and appointment availability with the practice before launch; the website does not currently show live appointment slots.

## 6. Page map

| Route | Page purpose | Main content |
| --- | --- | --- |
| `/` | Help visitors find the right care path | Hero, qualifications, care cards, craniosynostosis feature, doctor, visit steps, FAQs, consultation band |
| `/about` | Introduce the surgeon | Training, qualifications, portrait and consultation link |
| `/craniosynostosis` | First steps for parents | Overview, discussion topics, FAQs and contact sidebar |
| `/cosmetic-surgery` | Support an informed consultation | Goals, categories, questions, costs discussion and sidebar |
| `/cleft-care` | Explain the relevant care pathway | Cleft/craniofacial topics, previous treatment and coordinated care questions |
| `/reconstructive-surgery` | Introduce reconstructive consultations | Facial, hand and reconstruction topics; records and emergency guidance |
| `/patient-resources` | Prepare for a visit | What to bring, travel preparation, questions and FAQs |
| `/locations` | Find a clinic | Whitefield, HRBR Layout and Koramangala cards |
| `/appointment` | Request contact | Enquiry form, phone/email alternatives and locations |
| `/privacy` | Explain the preview form’s intended data use | Data minimisation, contact consent and launch preparation notice |
| Not-found page | Recover from a missing route | Clear message and home action |

The HTML package may use `.html` filenames in place of these application routes. Keep the content hierarchy and navigation labels consistent between the static export and the Next.js version.

## 7. Content, imagery and medical communication

The tone is calm, respectful and specific. Address families without frightening them and adult patients without exploiting insecurities. Explain what a consultation can help them understand, rather than promising a procedure, result or recovery period.

Use short introductions and focused FAQs. Avoid unsupported “best”, “only”, guaranteed outcomes, invented patient numbers, invented reviews or unverified awards. Credentials, practice locations and contact details must come from approved sources. Clinical information should be reviewed by the doctor before public release.

The current site intentionally excludes before/after galleries and patient stories. Add them only with appropriate consent, clinical context and an approved presentation standard. Keep abstract graphics clearly illustrative; the rings and baby icon are decorative and are not anatomical or diagnostic diagrams.

Keep images local where possible, specify dimensions to reduce layout movement, provide informative alt text and mark purely decorative SVGs as hidden from assistive technology. Essential meaning must remain in the text.

## 8. Accessibility and verification

### Implemented foundations

- Semantic main, navigation, header, footer and section structure.
- Skip-to-content link.
- Visible field labels and appropriate autocomplete attributes.
- Native FAQ disclosures and HTML form validation.
- Menu state exposed through ARIA.
- Focus outline retained; reduced-motion preference respected.
- Error and success announcements in the application form.
- Explicitly disabled submission when the preview has no working backend.

### Required production review

These foundations are not a claim of audited WCAG compliance. Browser-based visual verification of the earlier preview was blocked by the environment. Review the delivered HTML and final application in real browsers.

Check colour contrast for every state, readable small text, 200% text zoom, 320px reflow, touch targets, keyboard-only navigation, visible focus, mobile-menu behaviour, screen-reader field names and error associations. Avoid fixed heights that crop text after translation or zoom. Ensure icons accompanying visible labels do not create duplicate announcements. Test portrait overlays, long clinic addresses and email strings on small screens.

## 9. Next.js and Neon boundaries

| Layer | Responsibility |
| --- | --- |
| Standalone HTML/CSS/JavaScript | Visual layout, navigation, mobile-menu interaction, native disclosures, demonstration form state |
| Next.js App Router | Application pages, metadata, server-rendered content and enquiry API route |
| Server-side validation | Validate contact fields, consent, expected origin, body size and honeypot |
| Neon PostgreSQL | Persist minimal consultation enquiries after configuration |
| Future staff workflow | Authorised enquiry access, follow-up and retention; not included in this version |

Never place the Neon connection string in HTML, browser JavaScript, a public environment variable or a design-token file. The application uses the Neon serverless HTTP driver from server code. A connection, schema migration and explicit activation are still required. Runtime configuration uses `DATABASE_URL`, `SITE_ORIGIN` and `ENQUIRIES_ENABLED`.

The preview does not include a CMS, staff dashboard, email/SMS notifications, patient portal or live booking calendar. Treat those as separate scope, with their own information architecture and access controls.

Before public launch, finalise clinical copy, approved brand assets, clinic details and privacy content. Configure staff response handling and anti-abuse controls, test the live Neon integration, map legacy URLs, set production canonical URLs and a sitemap, and remove preview noindex only on the approved production domain.

## 10. Source and implementation references

This guide was derived from the existing project’s `DESIGN.md`, `app/globals.css`, `app/page.tsx`, `components/site/chrome.tsx`, `components/site/appointment-form.tsx`, `app/[slug]/page.tsx`, `app/appointment/page.tsx` and `lib/content.ts`. It documents the current implementation rather than a newly browsed audit.

Original content references recorded by the project:

- [Existing practice homepage](https://drvybhavderaje.com/)
- [Doctor biography](https://drvybhavderaje.com/aboutus.html)
- [Clinic contact details](https://drvybhavderaje.com/contact-us.html)
- [Craniosynostosis page](https://drvybhavderaje.com/craniosynostosis-surgery-bangalore.html)
- [UnitedHealthcare inspiration](https://www.uhc.com/)

`design-tokens.json` provides the implemented core palette, typography, component dimensions and breakpoints in a machine-readable format. The CSS remains authoritative where component-specific overrides apply.
