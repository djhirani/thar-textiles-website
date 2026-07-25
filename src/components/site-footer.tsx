import { verifiedBusiness } from "@/lib/content";
import { BrandLockup } from "./brand-lockup";
import { Container, DecorativeStitch } from "./primitives";

const footerGroups = [
  {
    title: "Shop",
    links: ["New pieces", "Garments", "Bags", "Home textiles"],
  },
  {
    title: "Discover",
    links: ["Our craft", "The women", "Our story", "Impact & research"],
  },
  {
    title: "Help",
    links: ["Contact", "Sizing", "Shipping & returns", "Care guide"],
  },
  {
    title: "Trade",
    links: ["Wholesale", "Collaborations", "Exhibitions", "Press"],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <Container>
        <div className="footer-lead">
          <BrandLockup className="footer-mark" inverse />
          <p className="footer-statement">
            Craft with a point of view.
            <br />
            Made in Tharparkar.
          </p>
          <DecorativeStitch />
        </div>
        <div className="footer-grid">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#top">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <address>
            <h2>Visit & contact</h2>
            <p>{verifiedBusiness.mithiOutlet}</p>
            <p>{verifiedBusiness.secondOutlet} outlet</p>
            <a href={`tel:+${verifiedBusiness.phoneHref}`}>
              {verifiedBusiness.phoneDisplay}
            </a>
            <a href={`mailto:${verifiedBusiness.email}`}>
              {verifiedBusiness.email}
            </a>
            <a href={verifiedBusiness.website}>
              {verifiedBusiness.websiteDisplay}
            </a>
          </address>
        </div>
        <div className="footer-bottom">
          <p>© 2026 {verifiedBusiness.legalName}</p>
          <p>{verifiedBusiness.headquarters}</p>
          <p>Women Crafting Change</p>
        </div>
      </Container>
    </footer>
  );
}
