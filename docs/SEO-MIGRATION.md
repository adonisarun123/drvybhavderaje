# SEO migration: URL strategy, content source and answer-engine layer

Inventory of https://drvybhavderaje.com/ taken on 21 Oct 2026 by crawling every page linked from
the live navigation (the legacy site has no `sitemap.xml`, no `robots.txt`, no canonical tags and no
structured data). 17 pages, 32 patient-information PDFs under `/images/pdf/…`, 11 YouTube videos,
4 social profiles.

## URL strategy — clean URLs are canonical; legacy `.html` URLs 308 to them (since 22 Oct 2026)

Every public page lives at a clean, suffix-less path. Every legacy URL of the old site (the 17 `.html`
pages) is kept alive as a **permanent 308 redirect** to its clean twin, so backlinks, Google Business
Profile links, directory listings and printed material all keep resolving and pass their equity to the
canonical URL. Up to 21 Oct 2026 the `.html` URLs themselves were canonical (served via rewrite); the
flip to clean URLs was made on 22 Oct 2026.

| Legacy URL (308 →) | Canonical URL | Internal route | Content |
| --- | --- | --- | --- |
| `/index.html` | `/` | `app/(public)/page.tsx` | Home: hero, 14 featured procedures (4 craniofacial + 10 cosmetic), "Also treated" links to the 7 other pages, craniosynostosis feature, doctor, testimonials, videos, FAQs |
| `/aboutus.html` | `/aboutus` | `app/(public)/aboutus/` | Full biography, qualifications, memberships, hospitals, 13 publications, 6 presentations |
| `/craniosynostosis-surgery-bangalore.html` | `/craniosynostosis-surgery-bangalore` | `app/(public)/[slug]/` | Full clinical content from the live page + FAQs |
| `/cleft-lip-and-palate-treatment-bangalore.html` | `/cleft-lip-and-palate-treatment-bangalore` | `[slug]` | ″ |
| `/corrective-jaw-surgery-bangalore.html` | `/corrective-jaw-surgery-bangalore` | `[slug]` | ″ |
| `/facial-injuries-and-fracture-treatments.html` | `/facial-injuries-and-fracture-treatments` | `[slug]` | ″ |
| `/head-and-neck-cancer-treatment.html` | `/head-and-neck-cancer-treatment` | `[slug]` | ″ |
| `/other-craniofacial-conditions-treatments.html` | `/other-craniofacial-conditions-treatments` | `[slug]` | ″ |
| `/face-plastic-surgery-bangalore.html` | `/face-plastic-surgery-bangalore` | `[slug]` | ″ |
| `/breast-plastic-surgeon-bangalore.html` | `/breast-plastic-surgeon-bangalore` | `[slug]` | ″ |
| `/body-plastic-surgeon-bangalore.html` | `/body-plastic-surgeon-bangalore` | `[slug]` | ″ |
| `/hand-plastic-surgeon-bangalore.html` | `/hand-plastic-surgeon-bangalore` | `[slug]` | ″ (listed under "Also treated" since 22 Oct 2026) |
| — | `/ear-reconstruction-surgery-bangalore` … (11 procedure pages, see below) | `[slug]` | New 22 Oct 2026, never had a `.html` URL |
| `/practice-location.html` | `/practice-location` | `app/(public)/practice-location/` | 3 clinics (DB-backed) + 6 hospitals |
| `/testimonials.html` | `/testimonials` | `app/(public)/testimonials/` | 10 testimonials + video gallery |
| `/contact-us.html` | `/contact-us` | `app/(public)/contact-us/` | Enquiry form + phone/email/addresses (was `/appointment`) |
| `/privacy-policy.html` | `/privacy-policy` | `app/(public)/privacy-policy/` | Updated policy (practice as operator, form-specific detail) |
| `/terms-of-use.html` | `/terms-of-use` | `app/(public)/terms-of-use/` | Legacy disclaimer, lightly edited |
| — | `/patient-resources` | `app/(public)/patient-resources/` | New page (no legacy equivalent) |

Mechanics (`next.config.ts`, `lib/routes.ts`):

- **Redirect 308** (permanent, query string preserved): `/<stem>.html → /<stem>` for all 17 legacy pages
  (`lib/routes.ts → LEGACY_HTML_REDIRECTS`). 308 is treated by Google and Bing exactly like a 301.
- **Redirect 308**: paths from the earlier redesign build — `/about`, `/appointment` (`?clinic=` deep
  links still work), `/locations`, `/privacy`, `/terms`, `/craniosynostosis`, `/cleft-care`,
  `/cosmetic-surgery`, `/reconstructive-surgery` — and `/index.html`, `/index`, `/home` → clean URL.
  **Every redirect is one hop**; nothing goes via a `.html` URL.
- **No rewrites.** The URL in the address bar is the canonical URL.
- Every `<link rel="canonical">`, OG `url`, sitemap entry, breadcrumb, `Physician.availableService`,
  `llms.txt` entry and internal link uses the clean URL via `ROUTES` / `servicePath()`. Never hard-code a
  path in JSX. The sitemap lists clean URLs only — never a `.html` URL.
- Verified with `curl` against `next start`: all 17 legacy `.html` URLs → 308 to the clean URL, every clean
  URL → 200 with a self-referencing canonical, every retired path → 308 (one hop), unknown paths → 404.

Why 308 rather than keeping `.html` as canonical? Clean URLs are the long-term address of the site; the
cost is one redirect hop per legacy URL and a short ranking wobble (typically 2–4 weeks) while Google
re-crawls and consolidates signals. Do **not** flip back: a second migration causes a second wobble.

### Post-launch SEO watch (after the clean-URL deploy)

1. Resubmit `https://drvybhavderaje.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools
   (same host, so GSC "Change of address" is **not** needed).
2. In GSC → Pages, expect the 17 legacy URLs to move to "Page with redirect" over 2–4 weeks; the clean
   URLs should appear as indexed. Use URL Inspection → Request indexing on the home, about and the three
   craniofacial legacy pages to speed it up.
3. Update the website link in Google Business Profile, Practo/Justdial/Lybrate and social bios to the clean
   URL where it currently points at a `.html` page (optional — redirects cover it, but a direct link is
   cleaner).
4. Keep the `.html` redirects **permanently**. Never remove them.

## Content source

All copy comes from the live site (crawled 21 Oct 2026) and is the doctor's own clinical writing,
edited for clarity and consistency only — no new clinical claims. `lib/content.ts` is the single source
for pages, schema, sitemap and `llms.txt`.

**Legacy assets (22 Oct 2026):** the 34 patient-information PDFs stay in `public/images/pdf/<folder>/…`
(legacy folder spelling `Craniosynthosis` kept on purpose). The 95 legacy images were moved to **ImageKit**
(`@imagekit/next`; media-library folder `/drvybhavderaje`, same tree as the old `/images/` — `custom/`,
`slider2/`, root logos and `doctor.png`). Endpoint: `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`
(`https://ik.imagekit.io/meddeskos/drvybhavderaje`, see `lib/image-config.ts`). Every legacy
`/images/…` image URL 308-redirects to its ImageKit URL (`next.config.ts → imageRedirects`); ImageKit
replaced square brackets in two file names with `_`, which the redirect map accounts for. One legacy image
(`images/landing-page/testimonial_img.jpg`) 404s on the old host too. Photos are used on the about page
(12-photo gallery), the craniosynostosis page (5), the locations page (clinic photos + hospital images)
and the affiliation logos on home/about; the PDFs render via `components/site/info-sheet.tsx` and are
indexed on `/patient-resources`.

## On-page

- One `<h1>` per page, descriptive titles with "Bangalore" (the spelling with search volume; schema uses
  `addressLocality: Bengaluru` + `alternateName: Bangalore`), meta descriptions ≤ ~165 chars, canonical,
  Open Graph + Twitter, `robots: max-image-preview:large, max-snippet:-1`.
- Service pages: intro → sections (`<h2>`) → procedures (`<h3>` cards) → contact → FAQ (native `<details>`).
- Internal linking: header → sections; every service page → 3 related services; footer lists all 10
  services + about/locations/stories/resources/contact + privacy/terms + social profiles (`rel="me"`).
- Images: served by ImageKit (`<Image>` from `@imagekit/next`, responsive `srcset`, auto format/quality); YouTube loads on click (`youtube-nocookie`,
  static thumbnail) — no third-party JS on page view.

## Structured data (JSON-LD, all backed by visible content)

- `WebSite`, `Physician`+`Person` (`@id …/#physician`: credentials, alumniOf, memberOf with URLs,
  hospitalAffiliation ×6, availableService ×10, knowsAbout, sameAs ×4, location = clinics),
  `MedicalBusiness` (`#practice`, Aesthetica Veda, contactPoint, departments).
- Per page: `BreadcrumbList`; `MedicalWebPage` / `AboutPage` / `ContactPage` / `CollectionPage` with
  `author`/`reviewedBy` = physician and `dateModified`; `FAQPage` where FAQs render.
- Service pages additionally emit `MedicalCondition` and `MedicalProcedure` entities.
- Deliberately **not** emitted: `Review`/`AggregateRating` (self-serving reviews are disallowed by
  Google), `VideoObject` (no titles/durations available), awards or outcome claims.

## Answer-engine (AEO / GEO)

- `/llms.txt` (llmstxt.org format) and `/llms-full.txt` (full page text) generated from `lib/content.ts`.
- `robots.txt` explicitly allows the main AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
  Google-Extended, Applebot-Extended, Bingbot, Amazonbot, CCBot, meta-externalagent …) on the public
  site and blocks `/admin` and `/api` for everyone.
- FAQs are phrased as patients ask ("At what age is cleft lip repaired?", "What is WALANT hand surgery?")
  and answered in 1–3 sentences from the page's own content.
- `sitemap.xml`: all 18 canonical URLs with `lastmod` = content review date (`SITE.contentUpdated`),
  not build time; image entries for the doctor photo.

## Switches

- `PUBLIC_INDEXING=true` on the production Vercel project is what turns on indexing; previews and
  anything else stay `noindex` + `Disallow: /`.
- `SITE_ORIGIN=https://drvybhavderaje.com` must be set for canonicals, sitemap and schema URLs.

## Launch checklist

1. ~~Pull PDFs/photos from the old host~~ — done.
2. Set `SITE_ORIGIN`, `PUBLIC_INDEXING=true`, `ENQUIRIES_ENABLED=true`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` on production.
3. Point DNS; confirm `curl -I https://drvybhavderaje.com/aboutus` → 200, `/aboutus.html` → 308 → `/aboutus`, `/about` → 308 → `/aboutus`.
4. Submit `https://drvybhavderaje.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Validate three pages in the Rich Results Test (home, a service page, about).
6. Add Google Business Profile URL to `SITE.social`/`sameAs` once supplied.

## Service restructure — 22 Oct 2026

The doctor asked the site to lead with 14 named procedures: craniosynostosis, cleft lip & palate, orthognathic (jaw) surgery, ear reconstruction; rhinoplasty, blepharoplasty, otoplasty, chin augmentation, facelift, tummy tuck, breast augmentation, breast reduction, gynaecomastia and liposuction.

- Three of the 14 are existing legacy pages (craniosynostosis, cleft, corrective jaw → retitled "Orthognathic (jaw correction) surgery"; URL unchanged).
- Eleven are new pages at clean paths (`lib/routes.ts → NEW_SERVICE_SLUGS`); they never had a `.html` URL. Content lives in `lib/procedures.ts`.
- The seven other legacy pages (facial injuries, head & neck cancer, other craniofacial conditions, hand surgery, and the face / breast / body hub pages) **stay live at their clean URLs** (the old `.html` URL 308s there) so backlinks and rankings are preserved. They are out of the header menu and listed on the homepage under "Also treated" and in the footer. Hub pages list their procedure pages at the top; procedure pages link back to their hub.
- Header, homepage, footer, sitemap, `llms.txt` and the Physician schema (`availableService`, `knowsAbout`) all derive from `lib/routes.ts` order constants — nothing is hard-coded in JSX.
