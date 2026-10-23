"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, resetConsent, writeConsent } from "@/lib/consent";
import { ROUTES } from "@/lib/routes";
import { track } from "@/lib/analytics";

/**
 * Analytics consent banner. Shown until the visitor makes a choice; "Accept" loads Google Analytics,
 * "Decline" keeps the site cookie-free (apart from the one cookie that remembers this choice).
 * Not a modal: the page stays usable and nothing is blocked while the banner is open.
 */
export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(readConsent() === null);
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  if (!open) return null;

  return (
    <aside className="cookie-banner" role="region" aria-label="Cookie choices">
      <p>
        We use Google Analytics to understand how the site is used. It sets cookies and sends usage data to Google only if you accept. The enquiry form and the rest of the site work either way. See our{" "}
        <Link href={ROUTES.privacy}>privacy policy</Link>.
      </p>
      <div className="cookie-actions">
        <button type="button" className="button" onClick={() => writeConsent("granted")}>
          Accept analytics
        </button>
        <button type="button" className="button outline" onClick={() => writeConsent("denied")}>
          Decline
        </button>
      </div>
    </aside>
  );
}

/** Footer link that re-opens the banner so a visitor can change their mind. */
export function CookieSettingsLink() {
  return (
    <button
      type="button"
      className="link-button"
      onClick={() => {
        track("consent_update", { action: "reopen_banner" });
        resetConsent();
      }}
    >
      Cookie settings
    </button>
  );
}
