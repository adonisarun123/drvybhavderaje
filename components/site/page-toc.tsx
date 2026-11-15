"use client";

import { useEffect, useState } from "react";

/** "On This Page" menu for the side column; marks the section currently in view. */
export function PageToc({ items }: { items: { label: string; id: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = items.map((t) => document.getElementById(t.id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = items.find((t) => visible.has(t.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-15% 0px -60% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="side-card toc" aria-label="On This Page">
      <p className="eyebrow">On This Page</p>
      {items.map((t) => (
        <a key={t.id} href={`#${t.id}`} aria-current={active === t.id ? "location" : undefined}>
          {t.label}
        </a>
      ))}
    </nav>
  );
}
