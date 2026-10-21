import type { MetadataRoute } from "next";
import { indexingEnabled, siteOrigin } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/"] }],
    sitemap: `${siteOrigin()}/sitemap.xml`,
    host: siteOrigin(),
  };
}
