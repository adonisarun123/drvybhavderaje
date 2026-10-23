/** Title Case for short UI labels built at runtime (doctor's review, 23 Oct 2026). Minor words stay lower case. */
const MINOR = new Set("a an the and or nor but of for in on at to by with vs via per as from into after before over under up out off than".split(" "));

export function titleCase(s: string): string {
  let first = true;
  return s.replace(/[A-Za-z][A-Za-z’'.-]*/g, (w, idx: number) => {
    const before = s.slice(0, idx);
    const startOfPhrase = first || /[—–:(·|]\s*$/.test(before);
    first = false;
    const isLast = !/[A-Za-z]/.test(s.slice(idx + w.length));
    if (/[A-Z]/.test(w.slice(1).split("-")[0] ?? "")) return w;
    if (!startOfPhrase && !isLast && MINOR.has(w.toLowerCase())) return w;
    return w
      .split("-")
      .map((p, i) => (p && (i === 0 || !MINOR.has(p)) ? p[0]!.toUpperCase() + p.slice(1) : p))
      .join("-");
  });
}
