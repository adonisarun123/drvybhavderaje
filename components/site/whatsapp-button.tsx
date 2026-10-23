"use client";

import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/content";

/**
 * Floating WhatsApp button, bottom-right on every public page. Opens the practice number with a
 * pre-filled greeting. Hidden on print. Clicks are reported as `whatsapp_click` (link_location
 * "whatsapp_fab") by the site-wide tracker in components/site/analytics-events.tsx.
 */
export function WhatsAppButton() {
  return (
    <a
      className="whatsapp-fab"
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with the clinic on WhatsApp, ${SITE.phone}`}
    >
      <MessageCircle size={26} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
