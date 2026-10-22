import Script from "next/script";

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-5GZJ539E0C";

/**
 * Google Analytics 4 (gtag.js). Rendered only on the public site in
 * production so local dev and preview builds don't pollute the property.
 */
export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production" || !GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
