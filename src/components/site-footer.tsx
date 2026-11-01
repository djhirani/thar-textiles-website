import { LinkArrow } from "./link-arrow";
import { verifiedBusiness } from "@/lib/content";
import Link from "next/link";
import { BrandLockup } from "./brand-lockup";
import { Container } from "./primitives";

const groups = [
  {
    title: "Explore",
    links: [
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
      { label: "Email", href: `mailto:${verifiedBusiness.email}` },
      { label: "Call", href: `tel:+${verifiedBusiness.phoneHref}` },
    ],
  },
];

export function SiteFooter({ darkAccent = true }: { darkAccent?: boolean }) {
  return (
    <footer
      className={`platform-footer${darkAccent ? " platform-footer--accent" : ""}`}
      id="contact"
    >
      <Container>
        <div className="platform-footer__top">
          <div>
            <BrandLockup className="platform-footer__brand" />
            <p>
              Craft, community and contemporary textiles from Tharparkar, Sindh.
            </p>
          </div>
          <Link className="platform-footer__cta" href="/contact/">
            Start a conversation <LinkArrow />
          </Link>
        </div>
        <div className="platform-footer__grid">
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
            <p>{verifiedBusiness.mithiOutlet}</p>
            <p>{verifiedBusiness.secondOutlet}, Sindh</p>
          </div>
        </div>
        <div className="platform-footer__bottom">
          <span>© {new Date().getFullYear()} Thar Textiles</span>
          <Link href="/privacy/">Privacy notice</Link>
          <span>{verifiedBusiness.headquarters}</span>
        </div>
      </Container>
    </footer>
  );
}
