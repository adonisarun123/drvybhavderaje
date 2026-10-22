import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon } from "./social-icons";
import { COSMETIC_SERVICES, CRANIOFACIAL_SERVICES, OTHER_SERVICES, SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid footer-grid-5">
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
          <div className="social" aria-label="Social media">
            <a href={SITE.social.facebook} target="_blank" rel="noopener noreferrer me" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer me" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={SITE.social.linkedin} target="_blank" rel="noopener noreferrer me" aria-label="LinkedIn">
              <LinkedinIcon />
            </a>
            <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer me" aria-label="YouTube">
              <YoutubeIcon />
            </a>
          </div>
        </div>
        <div>
          <h3>Craniofacial surgery</h3>
          {CRANIOFACIAL_SERVICES.map((s) => (
            <Link key={s.slug} href={s.path}>
              {s.shortTitle}
            </Link>
          ))}
        </div>
        <div>
          <h3>Cosmetic surgery</h3>
          {COSMETIC_SERVICES.map((s) => (
            <Link key={s.slug} href={s.path}>
              {s.shortTitle}
            </Link>
          ))}
        </div>
        <div>
          <h3>Also treated</h3>
          {OTHER_SERVICES.map((s) => (
            <Link key={s.slug} href={s.path}>
              {s.shortTitle}
            </Link>
          ))}
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href={ROUTES.about}>Meet Dr Vybhav Deraje</Link>
          <Link href={ROUTES.locations}>Practice locations</Link>
          <Link href={ROUTES.testimonials}>Patient stories</Link>
          <Link href={ROUTES.resources}>Preparing for your visit</Link>
          <Link href={ROUTES.contact}>
            Book an appointment <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>Information on this site supports, and does not replace, a medical consultation.</span>
        <span>
          <Link href={ROUTES.privacy}>Privacy policy</Link> · <Link href={ROUTES.terms}>Terms of use</Link>
        </span>
      </div>
    </footer>
  );
}
