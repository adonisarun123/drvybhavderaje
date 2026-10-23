import { describe, expect, it } from "vitest";
import { buildClinicAlert, buildPatientAck, clinicLabel } from "@/lib/notifications/enquiry-emails";

const base = {
  reference: "ENQ-2026-0042",
  name: "Asha <Rao>",
  phoneRaw: "98450 00000",
  phoneE164: "+919845000000",
  email: "asha@example.com",
  clinicName: "Aesthetica Veda Whitefield",
  clinicPreference: null,
  preferredStartAt: new Date("2026-10-26T04:30:00Z"), // 10:00 IST
  createdAt: new Date("2026-10-23T02:30:00Z"),
  adminUrl: "https://www.drvybhavderaje.com/admin/enquiries/abc",
  siteName: "Dr Vybhav Deraje",
  clinicPhone: "+91 95355 81616",
};

describe("enquiry emails", () => {
  it("clinic alert carries reference, contact details, clinic, IST time and admin link", () => {
    const m = buildClinicAlert(base);
    expect(m.subject).toContain("ENQ-2026-0042");
    expect(m.text).toContain("+919845000000");
    expect(m.text).toContain("Aesthetica Veda Whitefield");
    expect(m.text).toContain("10:00 am IST");
    expect(m.text).toContain(base.adminUrl);
    expect(m.html).toContain("&lt;Rao&gt;"); // escaped
  });
  it("patient acknowledgement says it is not a confirmed appointment and gives the reference", () => {
    const m = buildPatientAck(base);
    expect(m.subject).toContain("ENQ-2026-0042");
    expect(m.text).toContain("not a confirmed appointment");
    expect(m.text).toContain("+91 95355 81616");
    expect(m.text).not.toContain("admin/");
  });
  it("labels clinic preferences and missing clinics", () => {
    expect(clinicLabel({ clinicName: null, clinicPreference: "video_consultation" })).toMatch(/Video consultation/);
    expect(clinicLabel({ clinicName: null, clinicPreference: null })).toBe("Not specified");
  });
});
