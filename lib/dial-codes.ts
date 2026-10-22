/**
 * Country calling codes offered on the public enquiry form. India first (the practice's home market),
 * then the countries patients most often enquire from; anything else uses "Other" and types the full
 * number with a leading "+". Codes are ITU E.164 country codes.
 */
export interface DialCode {
  /** ISO 3166-1 alpha-2, used as the option value. */
  iso: string;
  name: string;
  /** Digits only, no "+". */
  code: string;
}

export const DIAL_CODES: readonly DialCode[] = [
  { iso: "IN", name: "India", code: "91" },
  { iso: "AE", name: "United Arab Emirates", code: "971" },
  { iso: "SA", name: "Saudi Arabia", code: "966" },
  { iso: "QA", name: "Qatar", code: "974" },
  { iso: "OM", name: "Oman", code: "968" },
  { iso: "KW", name: "Kuwait", code: "965" },
  { iso: "BH", name: "Bahrain", code: "973" },
  { iso: "US", name: "United States", code: "1" },
  { iso: "CA", name: "Canada", code: "1" },
  { iso: "GB", name: "United Kingdom", code: "44" },
  { iso: "IE", name: "Ireland", code: "353" },
  { iso: "AU", name: "Australia", code: "61" },
  { iso: "NZ", name: "New Zealand", code: "64" },
  { iso: "SG", name: "Singapore", code: "65" },
  { iso: "MY", name: "Malaysia", code: "60" },
  { iso: "DE", name: "Germany", code: "49" },
  { iso: "FR", name: "France", code: "33" },
  { iso: "NL", name: "Netherlands", code: "31" },
  { iso: "ZA", name: "South Africa", code: "27" },
  { iso: "NG", name: "Nigeria", code: "234" },
  { iso: "KE", name: "Kenya", code: "254" },
  { iso: "BD", name: "Bangladesh", code: "880" },
  { iso: "LK", name: "Sri Lanka", code: "94" },
  { iso: "NP", name: "Nepal", code: "977" },
  { iso: "MV", name: "Maldives", code: "960" },
] as const;

export const OTHER_COUNTRY = "OTHER";

export function dialCodeFor(iso: string | undefined | null): string | null {
  if (!iso || iso === OTHER_COUNTRY) return null;
  return DIAL_CODES.find((d) => d.iso === iso)?.code ?? null;
}
