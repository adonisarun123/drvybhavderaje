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
| `/` | `app/(public)/page.tsx` | Home: hero, 10 services, craniosynostosis feature, doctor, testimonials, videos, FAQs |
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
| `/hand-plastic-surgeon-bangalore.html` | `[slug]` | ″ |
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

**Still to pull from the old host (needs a download approval):** the 32 patient-information PDFs
(`/images/pdf/<folder>/Patient-information-sheet-*.pdf`) and the about-page photos. The PDF links are
already wired at their legacy paths and render only when the file exists in `/public`
(`components/site/info-sheet.tsx`), so no dead links ship. Drop the files into
`public/images/pdf/…` with the exact legacy folder names (note the legacy misspelling `Craniosynthosis`).

## On-page

- One `<h1>` per page, descriptive titles with "Bangalore" (the spelling with search volume; schema uses
  `addressLocality: Bengaluru` + `alternateName: Bangalore`), meta descriptions ≤ ~165 chars, canonical,
  Open Graph + Twitter, `robots: max-image-preview:large, max-snippet:-1`.
- Service pages: intro → sections (`<h2>`) → procedures (`<h3>` cards) → contact → FAQ (native `<details>`).
- Internal linking: header → sections; every service page → 3 related services; footer lists all 10
  services + about/locations/stories/resources/contact + privacy/terms + social profiles (`rel="me"`).
- Images: doctor photo only (optimised via `next/image`); YouTube loads on click (`youtube-nocookie`,
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

1. Pull PDFs/photos from the old host into `public/` (see above).
2. Set `SITE_ORIGIN`, `PUBLIC_INDEXING=true`, `ENQUIRIES_ENABLED=true` on production.
3. Point DNS; confirm `curl -I https://drvybhavderaje.com/aboutus.html` → 200 and `/about` → 308.
4. Submit `https://drvybhavderaje.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Validate three pages in the Rich Results Test (home, a service page, about).
6. Add Google Business Profile URL to `SITE.social`/`sameAs` once supplied.
