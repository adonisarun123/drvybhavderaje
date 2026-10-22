"use client";

import { MessageCircle } from "lucide-react";
import { SITE } from "@/lib/content";

/**
 * Floating WhatsApp button, bottom-right on every public page. Opens the practice number with a
 * pre-filled greeting. Hidden on print. Fires a GA event when analytics has been accepted.
 */
export function WhatsAppButton() {
  return (
    <a
      className="whatsapp-fab"
      href={SITE.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with the clinic on WhatsApp, ${SITE.phone}`}
      onClick={() => window.gtag?.("event", "whatsapp_click", { event_category: "contact", event_label: "floating_button" })}
    >
      <MessageCircle size={26} aria-hidden="true" />
      <span>WhatsApp</span>
    </a>
  );
}
