"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  {
    href: "/",
    label: "Home",
    icon: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  },
  {
    href: "/journey",
    label: "Journey",
    icon: (
      <>
        <path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.4" />
      </>
    ),
  },
  {
    href: "/services",
    label: "Services",
    icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  },
  {
    href: "/community",
    label: "Community",
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" />
        <circle cx="17.5" cy="9" r="2.3" />
        <path d="M15.3 14.4c2.6.5 4.7 2.5 4.7 5.6" />
      </>
    ),
  },
];

export function PillNav() {
  const pathname = usePathname();
  return (
    <nav className="pillnav" id="pillnav" aria-label="Sections">
      {LINKS.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {l.icon}
            </svg>
            <span>{l.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
