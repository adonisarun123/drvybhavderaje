"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, type ConsentChoice } from "@/lib/consent";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-5GZJ539E0C";

/**
 * Google Analytics 4 (gtag.js), loaded ONLY after the visitor accepts analytics in the cookie banner.
 *
 * Google Consent Mode v2 defaults are set to "denied" before gtag runs, and no Google script is
 * fetched at all until consent is "granted" — the strict ("basic") pattern EU/UK regulators accept,
 * rather than the cookieless-ping variant. Declining later flips the consent signals to denied.
 * Rendered only in production so local dev and preview builds don't pollute the property.
 */
export function GoogleAnalytics() {
  const [consent, setConsent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (consent === "denied" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    }
  }, [consent]);

  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID || consent !== "granted") return null;

  return (
    <>
      <Script id="ga4-consent-default" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', wait_for_update: 500 });
          gtag('consent', 'update', { analytics_storage: 'granted' });
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
      <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
    </>
  );
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
