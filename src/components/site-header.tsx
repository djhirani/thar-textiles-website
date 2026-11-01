"use client";

import { LinkArrow } from "./link-arrow";

import { navigation } from "@/lib/content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLockup } from "./brand-lockup";
import { MobileMenu } from "./mobile-menu";
import { Container } from "./primitives";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <>
      <header className="site-header">
        <Container className="header-inner">
          <div className="header-mobile-left">
            <MobileMenu />
          </div>
          <Link aria-label="Thar Textiles home" className="brand-logo" href="/">
            <BrandLockup className="brand-logo__lockup" priority />
            <BrandLockup className="brand-logo__symbol" compact priority />
          </Link>
          <nav aria-label="Primary" className="desktop-nav">
            <ul>
              {navigation.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={
                      pathname?.startsWith(item.href) ? "page" : undefined
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <Link className="header-contact" href="/contact/">
              Enquire <LinkArrow />
            </Link>
          </div>
        </Container>
      </header>
    </>
  );
}
