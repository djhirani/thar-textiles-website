"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isCurrentRoute, primaryNavigation } from "@/lib/nav";
import { BrandLockup } from "./brand-lockup";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  const pathname = usePathname();
  // Contact sits on the right as the single call to action.
  const links = primaryNavigation.filter((item) => item.href !== "/contact/");
  return (
    <header className="tt-header">
      <div className="tt-wrap tt-header__inner">
        <Link aria-label="Thar Textiles home" className="tt-brand" href="/">
          <BrandLockup className="tt-brand__lockup" priority />
        </Link>
        <nav aria-label="Primary" className="tt-nav">
          <ul>
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={
                    isCurrentRoute(pathname, item.href) ? "page" : undefined
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          className="tt-header__enquire"
          href="/contact/"
          aria-current={
            isCurrentRoute(pathname, "/contact/") ? "page" : undefined
          }
        >
          Enquire
        </Link>
        <MobileMenu />
      </div>
    </header>
  );
}
