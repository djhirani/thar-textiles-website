import { LinkArrow } from "./link-arrow";
import { verifiedBusiness } from "@/lib/content";
import Link from "next/link";
import { BrandLockup } from "./brand-lockup";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "Shop & collections", href: "/shop/" },
      { label: "Meet the artisans", href: "/artisans/" },
      { label: "About Thar Textiles", href: "/about/" },
    ],
  },
  {
    title: "Work together",
    links: [
      { label: "Wholesale & export", href: "/wholesale/" },
      { label: "Partnerships & impact", href: "/impact/" },
      { label: "Collaborate with us", href: "/collaborate/" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", href: "/contact/" },
      {
        label: verifiedBusiness.email,
        href: `mailto:${verifiedBusiness.email}`,
      },
      {
        label: verifiedBusiness.phoneDisplay,
        href: `tel:+${verifiedBusiness.phoneHref}`,
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="tt-footer" id="contact">
      <div className="tt-wrap">
        <div className="tt-footer__top">
          <div className="tt-footer__intro">
            <BrandLockup className="tt-brand__lockup tt-footer__brand" />
            <p>
              Craft, community and contemporary textiles from Tharparkar, Sindh.
            </p>
          </div>
          <Link className="tt-link" href="/contact/">
            Start a conversation <LinkArrow />
          </Link>
        </div>
        <div className="tt-footer__grid">
          {groups.map((group) => (
            <div key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link href={link.href}>{link.label}</Link>
                    ) : (
                      <a href={link.href}>{link.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h2>Visit</h2>
            <address>
              <span>{verifiedBusiness.mithiOutlet}</span>
              <span>{verifiedBusiness.secondOutlet}, Sindh</span>
            </address>
          </div>
        </div>
        <div className="tt-footer__bottom">
          <span>© {new Date().getFullYear()} Thar Textiles</span>
          <Link href="/privacy/">Privacy notice</Link>
          <span>{verifiedBusiness.headquarters}</span>
        </div>
      </div>
    </footer>
  );
}
