import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CARE_PATHS, SITE } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="footer-name">
            {SITE.name}
          </Link>
          <p>
            {SITE.tagline}
            <br />
            {SITE.city}
          </p>
          <a href={`tel:${SITE.phoneTel}`}>{SITE.phone}</a>
          <br />
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
        <div>
          <h3>Explore care</h3>
          {CARE_PATHS.map((c) => (
            <Link key={c.href} href={c.href}>
              {c.title}
            </Link>
          ))}
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/about">Meet the doctor</Link>
          <Link href="/patient-resources">Preparing for your visit</Link>
          <Link href="/locations">Find a clinic</Link>
          <Link href="/appointment">
            Request a consultation <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>Information supports, and does not replace, a medical consultation.</span>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
