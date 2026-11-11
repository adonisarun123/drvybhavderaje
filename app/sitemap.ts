import type { MetadataRoute } from "next";
import { ABOUT_GALLERY, contentModified, isPendingReview, SERVICE_PAGES } from "@/lib/content";
import { ROUTES } from "@/lib/routes";
import { CRANIO_TYPES, cranioTypePath } from "@/lib/cranio-types";
import { SUB_PROCEDURES, subProcedurePath } from "@/lib/sub-procedures";
import { DOCTOR_PHOTO, imageUrl } from "@/lib/images";
import { siteOrigin } from "@/lib/seo";

/**
 * All canonical public URLs — clean paths only; the legacy `.html` addresses are 308 redirects and
 * must never appear here. `lastModified` is the date each page's content last changed
 * (lib/content.ts → contentModified), not the build time and not the medical review date.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const doctorImage = imageUrl(DOCTOR_PHOTO);
  const entry = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], images?: string[], isServicePage = false): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified: new Date(contentModified(path, isServicePage)),
    changeFrequency,
    priority,
    images,
  });
  return [
    entry("/", 1, "weekly", [doctorImage]),
    entry(ROUTES.about, 0.9, "monthly", [doctorImage, ...ABOUT_GALLERY.map((g) => (g.src.startsWith("/talks/") ? `${base}${g.src}` : imageUrl(g.src)))]),
    ...SERVICE_PAGES.filter((p) => !isPendingReview(p.slug)).map((p) => entry(p.path, 0.8, "monthly", p.gallery?.map((g) => imageUrl(g.src)), true)),
    ...CRANIO_TYPES.map((t) => entry(cranioTypePath(t.slug), 0.7, "monthly")),
    ...SUB_PROCEDURES.map((p) => entry(subProcedurePath(p), 0.7, "monthly")),
    entry(ROUTES.procedures, 0.9, "monthly"),
    entry(ROUTES.locations, 0.8, "monthly"),
    entry(ROUTES.contact, 0.9, "monthly"),
    entry(ROUTES.testimonials, 0.6, "monthly"),
    entry(ROUTES.resources, 0.6, "monthly"),
    entry(ROUTES.privacy, 0.2, "yearly"),
    entry(ROUTES.terms, 0.2, "yearly"),
  ];
}
