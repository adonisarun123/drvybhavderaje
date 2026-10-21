# SEO migration and redirect map

Inventory of https://drvybhavderaje.com/ taken on 21 Oct 2026 from the live homepage's navigation
(the site has no reachable `sitemap.xml`). Crawl the full site again before switching DNS to catch
any page not linked from the homepage.

| Legacy URL | Action | New URL | Rationale |
| --- | --- | --- | --- |
| `/index.html` | 301 | `/` | Same page |
| `/aboutus.html` | 301 | `/about` | Equivalent biography page |
| `/contact-us.html` | 301 | `/appointment` | Contact/appointment form lives here |
| `/practice-location.html` | 301 | `/locations` | Same clinic directory |
| `/craniosynostosis-surgery-bangalore.html` | 301 | `/craniosynostosis` | Same topic |
| `/cleft-lip-and-palate-treatment-bangalore.html` | 301 | `/cleft-care` | Covered by cleft & craniofacial page |
| `/corrective-jaw-surgery-bangalore.html` | 301 | `/cleft-care` | Listed as a topic on that page |
| `/other-craniofacial-conditions-treatments.html` | 301 | `/cleft-care` | Listed as a topic on that page |
| `/facial-injuries-and-fracture-treatments.html` | 301 | `/reconstructive-surgery` | Listed as a topic on that page |
| `/head-and-neck-cancer-treatment.html` | 301 | `/reconstructive-surgery` | "Reconstruction after cancer treatment" topic |
| `/hand-plastic-surgeon-bangalore.html` | 301 | `/reconstructive-surgery` | "Hand surgery" topic |
| `/face-plastic-surgery-bangalore.html` | 301 | `/cosmetic-surgery` | "Face and facial aesthetics" topic |
| `/breast-plastic-surgeon-bangalore.html` | 301 | `/cosmetic-surgery` | "Breast surgery consultations" topic |
| `/body-plastic-surgeon-bangalore.html` | 301 | `/cosmetic-surgery` | "Body contouring consultations" topic |
| `/privacy-policy.html` | 301 | `/privacy` | Equivalent |
| `/testimonials.html` | **404** | — | Testimonials intentionally excluded pending consent/presentation review; no equivalent page. Decide before launch whether to add one. |
| `/terms-of-use.html` | **404** | — | No equivalent page. Add a terms page if the practice wants one, then map it. |

Nothing is redirected to the homepage. Redirects live in `next.config.ts` (`legacyRedirects`).

**Content-depth note (needs a decision):** the old site had one page per sub-service (e.g. corrective jaw
surgery, hand surgery, breast, body). The redesign consolidates these into four care pages with topic lists.
Ranking for those long-tail queries will weaken unless dedicated pages are added later; the routing
structure supports adding `app/(public)/[slug]` entries in `lib/content.ts` without changing the redirects.

## On-page implementation

- Unique `<title>`/description per page (`lib/seo.ts → pageMetadata`), canonical URLs from `SITE_ORIGIN`, Open Graph + Twitter cards.
- One `<h1>` per page; sections use `<h2>`, cards/topics `<h3>`; semantic landmarks, skip link, breadcrumb nav.
- Server-rendered content (static/ISR for public pages; the appointment page is dynamic because it reads availability).
- `app/sitemap.ts` lists all public routes; `app/robots.ts` disallows everything unless `PUBLIC_INDEXING=true` (and never on Vercel previews), and always disallows `/admin` and `/api`.
- `/admin/*` additionally sends `X-Robots-Tag: noindex, nofollow, noarchive` and `Cache-Control: no-store`; authentication is the actual protection.
- Structured data (JSON-LD), all backed by visible content: `Physician` with `MedicalClinic` locations and address/phone (home, locations), `FAQPage` where FAQs are rendered, `BreadcrumbList`, `MedicalWebPage` for care pages.
- Internal links: care cards ↔ care pages, every page → appointment, locations → appointment with clinic preselected, footer links to all sections.
- AEO: FAQ questions mirror how patients ask ("I'm travelling from another city…", "Is a consultation a commitment to surgery?") and are rendered as native `<details>` plus FAQ schema.

## Not done / needs the practice

- `PUBLIC_INDEXING` stays `false` until the practice approves launch on the production domain.
- Google Business Profile / `sameAs` links and social profiles are not included (not supplied).
- No ratings, review counts, awards or outcome claims are published or marked up.
