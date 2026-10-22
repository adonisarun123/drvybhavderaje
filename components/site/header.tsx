"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, MapPin, Menu, Phone, X } from "lucide-react";
import { NAV, SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isCurrent = (href: string) => href === pathname || `${pathname}.html` === href;

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="utility">
        <div className="container">
          <span>{SITE.utilityLine}</span>
          <div>
            <Link href={ROUTES.locations}>
              <MapPin size={13} aria-hidden="true" /> {SITE.city}
            </Link>
            <a href={`tel:${SITE.phoneTel}`}>
              <Phone size={13} aria-hidden="true" /> {SITE.phone}
            </a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container nav">
          <Link href="/" className="wordmark" aria-label="Dr Vybhav Deraje home">
            <span className="monogram" aria-hidden="true">
              v<span>d</span>
              <i />
            </span>
            <span>
              <strong>{SITE.name}</strong>
              <small>{SITE.tagline.toUpperCase()}</small>
            </span>
          </Link>
          <button
            ref={buttonRef}
            className="menu-toggle"
            type="button"
            aria-expanded={open}
            aria-controls={navId}
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
          </button>
          <nav id={navId} className={`site-nav${open ? " open" : ""}`} aria-label="Main">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link className="button small" href={ROUTES.contact} aria-current={isCurrent(ROUTES.contact) ? "page" : undefined} onClick={() => setOpen(false)}>
              Book an appointment <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
