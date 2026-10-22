import type { MetadataRoute } from "next";
import { indexingEnabled, siteOrigin } from "@/lib/seo";

const PRIVATE = ["/admin", "/admin/", "/api/"];

/**
 * Search engines and answer engines are welcome on the public site once PUBLIC_INDEXING=true.
 * AI crawlers are listed explicitly (allow) so that the practice's own content is what those
 * assistants cite; /llms.txt and /llms-full.txt give them a clean summary.
 */
const AI_CRAWLERS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot", "Amazonbot", "CCBot", "meta-externalagent", "YouBot", "cohere-ai"];

export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
    host: siteOrigin(),
  };
}
