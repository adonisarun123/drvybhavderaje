import type { MetadataRoute } from "next";
import { SERVICE_PAGES } from "@/lib/content";
import { siteOrigin } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteOrigin();
  const now = new Date();
  const paths = ["/", "/about", ...SERVICE_PAGES.map((p) => `/${p.slug}`), "/patient-resources", "/locations", "/appointment", "/privacy"];
  return paths.map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: p === "/" ? "weekly" : "monthly", priority: p === "/" ? 1 : p === "/appointment" ? 0.9 : 0.7 }));
}
