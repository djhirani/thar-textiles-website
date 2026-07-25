import { navigation } from "@/lib/content";
import { BrandLockup } from "./brand-lockup";
import { BagIcon, SearchIcon } from "./icons";
import { MobileMenu } from "./mobile-menu";
import { Container } from "./primitives";

export function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <p>Small-batch pieces embroidered by hand in Tharparkar</p>
      </div>
      <header className="site-header">
        <Container className="header-inner">
          <div className="header-mobile-left">
            <MobileMenu />
          </div>
          <a aria-label="Thar Textiles home" className="brand-logo" href="#top">
            <BrandLockup className="brand-logo__lockup" priority />
            <BrandLockup className="brand-logo__symbol" compact priority />
          </a>
          <nav aria-label="Primary" className="desktop-nav">
            <ul>
              {navigation.map((item) => (
                <li key={item.label}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <a aria-label="Search, coming in a later milestone" href="#shop">
              <SearchIcon className="icon" />
            </a>
            <a
              aria-label="Shopping bag, commerce connection pending"
              href="#shop"
            >
              <BagIcon className="icon" />
              <span className="bag-count">0</span>
            </a>
          </div>
        </Container>
      </header>
    </>
  );
}
