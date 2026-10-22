# SEO migration: URL strategy, content source and answer-engine layer

Inventory of https://drvybhavderaje.com/ taken on 21 Oct 2026 by crawling every page linked from
the live navigation (the legacy site has no `sitemap.xml`, no `robots.txt`, no canonical tags and no
structured data). 17 pages, 32 patient-information PDFs under `/images/pdf/…`, 11 YouTube videos,
4 social profiles.

## URL strategy — legacy URLs are the canonical URLs

Every legacy URL keeps serving a **200 at the same address**. Nothing that is linked from outside
(backlinks, Google Business Profile, directories, printed material) changes or hops through a redirect.

| Public canonical URL | Internal route | Content |
| --- | --- | --- |
| `/` | `app/(public)/page.tsx` | Home: hero, 14 featured procedures (4 craniofacial + 10 cosmetic), "Also treated" links to the 7 other pages, craniosynostosis feature, doctor, testimonials, videos, FAQs |
| `/aboutus.html` | `app/(public)/aboutus/` | Full biography, qualifications, memberships, hospitals, 13 publications, 6 presentations |
| `/craniosynostosis-surgery-bangalore.html` | `app/(public)/[slug]/` | Full clinical content from the live page + FAQs |
| `/cleft-lip-and-palate-treatment-bangalore.html` | `[slug]` | ″ |
| `/corrective-jaw-surgery-bangalore.html` | `[slug]` | ″ |
| `/facial-injuries-and-fracture-treatments.html` | `[slug]` | ″ |
| `/head-and-neck-cancer-treatment.html` | `[slug]` | ″ |
| `/other-craniofacial-conditions-treatments.html` | `[slug]` | ″ |
| `/face-plastic-surgery-bangalore.html` | `[slug]` | ″ |
| `/breast-plastic-surgeon-bangalore.html` | `[slug]` | ″ |
| `/body-plastic-surgeon-bangalore.html` | `[slug]` | ″ |
| `/hand-plastic-surgeon-bangalore.html` | `[slug]` | ″ (listed under "Also treated" since 22 Oct 2026) |
| `/ear-reconstruction-surgery-bangalore` | `[slug]` | **New 22 Oct 2026** — no legacy URL, clean path. Draft content; doctor review required |
| `/rhinoplasty-surgery-bangalore` | `[slug]` | New 22 Oct 2026 — expands the face hub paragraph |
| `/blepharoplasty-eyelid-surgery-bangalore` | `[slug]` | ″ |
| `/otoplasty-ear-correction-bangalore` | `[slug]` | ″ |
| `/chin-augmentation-surgery-bangalore` | `[slug]` | ″ |
| `/facelift-surgery-bangalore` | `[slug]` | ″ |
| `/tummy-tuck-abdominoplasty-bangalore` | `[slug]` | New 22 Oct 2026 — expands the body hub paragraph |
| `/breast-augmentation-surgery-bangalore` | `[slug]` | New 22 Oct 2026 — expands the breast hub paragraph |
| `/breast-reduction-surgery-bangalore` | `[slug]` | ″ |
| `/gynecomastia-surgery-bangalore` | `[slug]` | ″ (URL uses the US spelling patients search for; body copy uses "gynaecomastia") |
| `/liposuction-surgery-bangalore` | `[slug]` | New 22 Oct 2026 — expands the body hub paragraph |
| `/practice-location.html` | `app/(public)/practice-location/` | 3 clinics (DB-backed) + 6 hospitals |
| `/testimonials.html` | `app/(public)/testimonials/` | 10 testimonials + video gallery |
| `/contact-us.html` | `app/(public)/contact-us/` | Enquiry form + phone/email/addresses (was `/appointment`) |
| `/privacy-policy.html` | `app/(public)/privacy-policy/` | Updated policy (practice as operator, form-specific detail) |
| `/terms-of-use.html` | `app/(public)/terms-of-use/` | Legacy disclaimer, lightly edited |
| `/patient-resources` | `app/(public)/patient-resources/` | New page (no legacy equivalent) |

Mechanics (`next.config.ts`, `lib/routes.ts`):

- **Rewrite** (`beforeFiles`): `/<stem>.html → /<stem>`; the browser URL is unchanged.
- **Redirect 308** (permanent): `/<stem> → /<stem>.html`, so the suffix-less internal path is never indexed.
- **Redirect 308**: paths from the earlier redesign build — `/about`, `/appointment` (query string preserved,
  so `?clinic=` deep links still work), `/locations`, `/privacy`, `/craniosynostosis`, `/cleft-care`,
  `/cosmetic-surgery`, `/reconstructive-surgery` — and `/index.html`, `/index`, `/home` → canonical URL.
- Every `<link rel="canonical">`, sitemap entry, breadcrumb and internal link uses the `.html` URL via
  `ROUTES` / `servicePath()`. Never hard-code a path in JSX.
- Verified with `curl` against `next start`: all 17 legacy URLs → 200, every retired path → 308 to its
  canonical, unknown paths → 404, `/admin` → login.

Why not 301 the legacy URLs to clean URLs? A 301 passes most equity but not all, costs a hop, and the
client asked for the backlink profile to be left untouched. Same-URL is the zero-risk option.

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
3. Point DNS; confirm `curl -I https://drvybhavderaje.com/aboutus.html` → 200 and `/about` → 308.
4. Submit `https://drvybhavderaje.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Validate three pages in the Rich Results Test (home, a service page, about).
6. Add Google Business Profile URL to `SITE.social`/`sameAs` once supplied.

## Service restructure — 22 Oct 2026

The doctor asked the site to lead with 14 named procedures: craniosynostosis, cleft lip & palate, orthognathic (jaw) surgery, ear reconstruction; rhinoplasty, blepharoplasty, otoplasty, chin augmentation, facelift, tummy tuck, breast augmentation, breast reduction, gynaecomastia and liposuction.

- Three of the 14 are existing legacy pages (craniosynostosis, cleft, corrective jaw → retitled "Orthognathic (jaw correction) surgery"; URL unchanged).
- Eleven are new pages at clean paths (no `.html`, no rewrite/redirect — `lib/routes.ts → NEW_SERVICE_SLUGS`). Content lives in `lib/procedures.ts`.
- The seven other legacy pages (facial injuries, head & neck cancer, other craniofacial conditions, hand surgery, and the face / breast / body hub pages) **stay live at their canonical `.html` URLs** so backlinks and rankings are preserved. They are out of the header menu and listed on the homepage under "Also treated" and in the footer. Hub pages list their procedure pages at the top; procedure pages link back to their hub.
- Header, homepage, footer, sitemap, `llms.txt` and the Physician schema (`availableService`, `knowsAbout`) all derive from `lib/routes.ts` order constants — nothing is hard-coded in JSX.
