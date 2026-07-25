import { enquiryHref, navigation } from "@/lib/content";
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
            <a aria-label="Browse the collection" href="#shop">
              <SearchIcon className="icon" />
            </a>
            <a
              aria-label="Enquire about a piece by email"
              href={enquiryHref("Thar Textiles product enquiry")}
            >
              <BagIcon className="icon" />
            </a>
          </div>
        </Container>
      </header>
    </>
  );
}
