"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { classifyLink, track } from "@/lib/analytics";

/**
 * Site-wide GA4 event capture, mounted once in the public layout.
 *
 *  - page_view on every client-side navigation (gtag's config call only reports the first load).
 *  - One delegated click listener classifies every link on the site — tel:, mailto:, WhatsApp, PDF
 *    downloads, outbound links and marked CTAs — so new pages and server components are tracked
 *    without per-link handlers. Uses the capture phase so it runs before navigation.
 *
 * Everything is a no-op until the visitor accepts analytics (see lib/analytics.ts).
 */
export function AnalyticsEvents() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    track("page_view", { page_location: window.location.href, page_path: pathname, page_title: document.title });
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
      const target = e.target as Element | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const ev = classifyLink(a, window.location.hostname);
      if (ev) track(ev.name, { ...ev.params, page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, []);

  return null;
}
