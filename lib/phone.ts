/**
 * Phone normalisation to E.164. Returns null when the input is ambiguous so validation can reject it.
 *
 * `defaultCountry` is the calling code (digits, no "+") the number is read against when it has no
 * leading "+": "91" for the practice's home market, or whatever the visitor chose in the country
 * selector on the enquiry form. For a non-Indian default the national trunk prefix "0" is dropped
 * (UK "07700 900123" with "44" → +447700900123). A number typed with a leading "+" is always taken
 * as already international, whatever the default.
 */
export function normalisePhone(raw: string, defaultCountry = "91"): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (hasPlus) {
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  if (defaultCountry !== "91") {
    if (digits.startsWith("00")) digits = digits.slice(2);
    else {
      if (digits.startsWith("0")) digits = digits.replace(/^0+/, "");
      if (!digits.startsWith(defaultCountry) || digits.length <= defaultCountry.length + 6) digits = `${defaultCountry}${digits}`;
    }
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  // Common Indian formats: 0XXXXXXXXXX (11 digits), 91XXXXXXXXXX (12), XXXXXXXXXX (10)
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith(defaultCountry)) return `+${digits}`;
  if (digits.length === 10) return `+${defaultCountry}${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  if (e164.startsWith("+91") && e164.length === 13) {
    return `+91 ${e164.slice(3, 8)} ${e164.slice(8)}`;
  }
  return e164;
}
