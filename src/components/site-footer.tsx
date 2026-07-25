import { enquiryHref, verifiedBusiness } from "@/lib/content";
import { BrandLockup } from "./brand-lockup";
import { Container, DecorativeStitch } from "./primitives";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { label: "New pieces", href: "#new" },
      { label: "Garments", href: "#shop" },
      { label: "Bags", href: "#shop" },
      { label: "Home textiles", href: "#shop" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Our craft", href: "#craft" },
      { label: "The women", href: "#women" },
      { label: "Our story", href: "#story" },
      { label: "Impact & research", href: "#impact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", href: `mailto:${verifiedBusiness.email}` },
      { label: "Sizing", href: enquiryHref("Sizing enquiry") },
      {
        label: "Shipping & returns",
        href: enquiryHref("Shipping and returns enquiry"),
      },
      { label: "Care guide", href: enquiryHref("Product care enquiry") },
    ],
  },
  {
    title: "Trade",
    links: [
      { label: "Wholesale", href: enquiryHref("Wholesale enquiry") },
      { label: "Collaborations", href: enquiryHref("Collaboration enquiry") },
      { label: "Exhibitions", href: enquiryHref("Exhibition enquiry") },
      { label: "Press", href: enquiryHref("Press enquiry") },
    ],
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
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
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
