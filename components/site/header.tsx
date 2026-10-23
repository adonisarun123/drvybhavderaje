"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, MapPin, Menu, Phone, X } from "lucide-react";
import { NAV, SITE } from "@/lib/content";
import { ROUTES } from "@/lib/routes";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const navId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open && !menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (menu) {
        setMenu(null);
        return;
      }
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if (menu && navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open, menu]);

  const isCurrent = (href: string) => href === pathname;
  const close = () => {
    setOpen(false);
    setMenu(null);
  };

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
          <nav id={navId} ref={navRef} className={`site-nav${open ? " open" : ""}`} aria-label="Main">
            {NAV.map((item) => {
              if (!item.children?.length) {
                return (
                  <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={close}>
                    {item.label}
                  </Link>
                );
              }
              const expanded = menu === item.label;
              const menuId = `${navId}-${item.label.replace(/\s+/g, "-").toLowerCase()}`;
              const current = item.children.some((c) => isCurrent(c.href));
              return (
                <div
                  key={item.href}
                  className="nav-group"
                  onMouseEnter={() => setMenu(item.label)}
                  onMouseLeave={() => setMenu((m) => (m === item.label ? null : m))}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenu((m) => (m === item.label ? null : m));
                  }}
                >
                  <button type="button" aria-expanded={expanded} aria-controls={menuId} aria-current={current ? "page" : undefined} onClick={() => setMenu(expanded ? null : item.label)}>
                    {item.label} <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  <ul id={menuId} className={`nav-menu${item.children.length > 6 ? " cols-2" : ""}${expanded ? " open" : ""}`}>
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} aria-current={isCurrent(c.href) ? "page" : undefined} onClick={close}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link className="nav-menu-all" href={item.allHref ?? item.href} onClick={close}>
                        All {item.label} <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    </li>
                  </ul>
                </div>
              );
            })}
            <Link className="button small" href={ROUTES.contact} data-analytics-cta="header_book" aria-current={isCurrent(ROUTES.contact) ? "page" : undefined} onClick={() => setOpen(false)}>
              Book an Appointment <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
