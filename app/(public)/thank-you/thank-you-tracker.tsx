"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { consumeFreshEnquiry } from "@/lib/enquiries/thank-you";

/** Reports the thank-you view once per saved enquiry; reloads, back-navigation and direct hits send nothing. */
export function ThankYouTracker({ reference, clinic, duplicate }: { reference: string | null; clinic: string | null; duplicate: boolean }) {
  useEffect(() => {
    if (!reference || !consumeFreshEnquiry(reference)) return;
    track("thank_you_view", { form_id: "consultation_enquiry", reference, clinic: clinic ?? undefined, duplicate });
  }, [reference, clinic, duplicate]);
  return null;
}
