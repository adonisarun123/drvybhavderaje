import type { MetadataRoute } from "next";
import { ABOUT_GALLERY, SERVICE_PAGES, SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { siteOrigin } from "@/lib/seo";

/**
 * All canonical public URLs — the legacy `.html` addresses. `lastModified` is the content review
 * date (not the build time) so crawlers are not told every page changed on every deploy.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const lastModified = new Date(SITE.contentUpdated);
  const doctorImage = `${base}/images/doctor.png`;
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], images?: string[]): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
    images,
  });
  return [
    entry("/", 1, "weekly", [doctorImage]),
    entry(ROUTES.about, 0.9, "monthly", [doctorImage, ...ABOUT_GALLERY.map((g) => `${base}${g.src}`)]),
    ...SERVICE_PAGES.map((p) => entry(p.path, 0.8, "monthly", p.gallery?.map((g) => `${base}${g.src}`))),
    entry(ROUTES.locations, 0.8, "monthly"),
    entry(ROUTES.contact, 0.9, "monthly"),
    entry(ROUTES.testimonials, 0.6, "monthly"),
    entry(ROUTES.resources, 0.6, "monthly"),
    entry(ROUTES.privacy, 0.2, "yearly"),
    entry(ROUTES.terms, 0.2, "yearly"),
  ];
}
