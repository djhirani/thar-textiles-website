import { LinkArrow } from "@/components/link-arrow";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { Action, Eyebrow, Photo, ProductCards } from "@/components/platform-ui";
import { sectionData, type SectionKey } from "@/lib/platform";
import { verifiedBusiness } from "@/lib/content";
import { CatalogueSearch } from "@/components/catalogue-search";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/enquiry-form";

const allSections = ["shop", ...Object.keys(sectionData), "contact"];
export function generateStaticParams() {
  return allSections.map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const title =
    section === "shop"
      ? "Shop & collections"
      : section === "contact"
        ? "Contact"
        : sectionData[section as SectionKey]?.title;
  return {
    title: title || "Explore",
    description: `Explore ${title || "Thar Textiles"} at Thar Textiles.`,
    alternates: { canonical: `/${section}/` },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!allSections.includes(section)) notFound();
  if (section === "shop")
    return (
      <PlatformShell theme="gallery">
        <section className="platform-page-hero platform-page-hero--shop">
          <div className="platform-wrap">
            <Eyebrow>The collection</Eyebrow>
            <h1>
              Craft to wear. <em>Craft to live with.</em>
            </h1>
            <p>
              Explore embroidered garments, shoulder bags and wall pieces from
              Tharparkar, Pakistan. Tell us the piece, quantity and your city or
              country; the team will confirm details and availability.
            </p>
          </div>
        </section>
        <div className="platform-wrap platform-section">
          <h2 className="sr-only">Collection pieces</h2>
          <Suspense
            fallback={
              <div aria-busy="true">
                <div className="catalogue-tools">
                  <label>
                    Search the collection
                    <input
                      type="search"
                      disabled
                      placeholder="Try bags, garments or wall hanging"
                    />
                  </label>
                  <label>
                    Category
                    <select disabled defaultValue="All">
                      <option>All</option>
                    </select>
                  </label>
                </div>
                <p className="catalogue-count" role="status">
                  Loading collection…
                </p>
                <ProductCards count={4} editorial />
              </div>
            }
          >
            <CatalogueSearch />
          </Suspense>
        </div>
      </PlatformShell>
    );
  if (section === "contact")
    return (
      <PlatformShell>
        <section className="platform-page-hero platform-page-hero--contact">
          <div className="platform-wrap">
            <Eyebrow>Contact & enquiries</Eyebrow>
            <h1>
              Let’s begin a <em>conversation.</em>
            </h1>
            <p>
              For product details, visits, wholesale and collaboration, email or
              call the team. Choose a topic below to find the right place to
              begin.
            </p>
          </div>
        </section>
        <section className="platform-section">
          <div className="platform-wrap platform-contact-grid">
            <div>
              <h2>Reach the team</h2>
              <a href={`mailto:${verifiedBusiness.email}`}>
                {verifiedBusiness.email}
              </a>
              <a href={`tel:+${verifiedBusiness.phoneHref}`}>
                {verifiedBusiness.phoneDisplay}
              </a>
              <p>{verifiedBusiness.mithiOutlet}</p>
              <p>{verifiedBusiness.secondOutlet}, Sindh</p>
            </div>
            <div>
              <h2>What would you like to discuss?</h2>
              {[
                ["A product or collection", "/wholesale/#enquiry"],
                ["Wholesale or export", "/wholesale/#enquiry"],
                ["Community participation", "/artisans/#enquiry"],
                ["A development partnership", "/impact/#enquiry"],
                ["Design or technical expertise", "/collaborate/#enquiry"],
              ].map(([label, href]) => (
                <a key={label} href={href}>
                  {label}
                  <LinkArrow />
                </a>
              ))}
            </div>
          </div>
        </section>
        <EnquiryForm kind="general" />
      </PlatformShell>
    );
  const data = sectionData[section as SectionKey];
  if (!data) notFound();
  return (
    <PlatformShell>
      <section className={`platform-page-hero platform-page-hero--${section}`}>
        <div className="platform-wrap platform-page-hero__grid">
          <div>
            <Eyebrow>{data.eyebrow}</Eyebrow>
            <h1>
              {section === "about" ? (
                <>
                  Handwork,
                  <br />
                  <em>with a sense of place.</em>
                </>
              ) : (
                data.title
              )}
            </h1>
            <p>{data.intro}</p>
            {section === "about" ? (
              <div className="platform-actions">
                <Action href="/shop/">Explore the collection</Action>
                <Action href="#visit" secondary>
                  Visit & enquiries
                </Action>
              </div>
            ) : (
              <Action
                href={
                  section === "wholesale" ||
                  section === "artisans" ||
                  section === "impact" ||
                  section === "collaborate"
                    ? "#enquiry"
                    : section === "about"
                      ? "/shop/"
                      : `mailto:${verifiedBusiness.email}?subject=${encodeURIComponent(data.subject)}`
                }
              >
                {data.cta}
              </Action>
            )}
          </div>
          <figure className="editorial-page-image">
            <Photo src={data.image} alt={data.imageAlt} priority />
            <figcaption>
              {data.imageAlt}
              <span>Thar Textiles archive</span>
            </figcaption>
          </figure>
        </div>
      </section>
      <section className="platform-section platform-section--details">
        <div
          className={`platform-wrap platform-detail-grid platform-detail-grid--${section}`}
        >
          {data.sections.map((item, index) => (
            <article key={item.title}>
              <span>0{index + 1}</span>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>
      {section === "wholesale" && (
        <section className="platform-section platform-section--paper">
          <div className="platform-wrap">
            <div className="platform-heading">
              <Eyebrow>Browse first</Eyebrow>
              <h2>Start with the collection.</h2>
            </div>
            <ProductCards count={3} />
          </div>
        </section>
      )}
      {section === "wholesale" ||
      section === "artisans" ||
      section === "impact" ||
      section === "collaborate" ? (
        <EnquiryForm
          kind={
            section === "wholesale"
              ? "wholesale"
              : section === "artisans"
                ? "artisan"
                : section === "impact"
                  ? "partnership"
                  : "expert"
          }
        />
      ) : section === "about" ? (
        <section
          className="platform-section studio-connections"
          id="visit"
          aria-labelledby="studio-connections-title"
        >
          <div className="platform-wrap">
            <div className="platform-heading">
              <Eyebrow>Near or far</Eyebrow>
              <h2 id="studio-connections-title">
                A place to visit. A team to talk to.
              </h2>
            </div>
            <div className="studio-connections__grid">
              <article>
                <p className="studio-kicker">01 / In Sindh</p>
                <h3>Visit us in Thar.</h3>
                <p>
                  Find Thar Textiles in Mithi and Nagarparkar. Contact the team
                  to confirm opening times before travelling.
                </p>
                <dl className="studio-addresses">
                  <div>
                    <dt>Mithi</dt>
                    <dd>{verifiedBusiness.mithiOutlet}</dd>
                  </div>
                  <div>
                    <dt>Nagarparkar</dt>
                    <dd>Nagarparkar, Sindh</dd>
                  </div>
                </dl>
                <a
                  className="studio-text-link"
                  href={`tel:+${verifiedBusiness.phoneHref}`}
                >
                  Call {verifiedBusiness.phoneDisplay} <LinkArrow />
                </a>
              </article>
              <article>
                <p className="studio-kicker">02 / Across borders</p>
                <h3>Start with your enquiry.</h3>
                <p>
                  For a personal piece or a trade brief, share your product
                  interests, quantity and destination. Ask about sizing, samples
                  and delivery before confirming an order.
                </p>
                <div className="studio-connection-links">
                  <Action href="/contact/" secondary>
                    Personal enquiries
                  </Action>
                  <Action href="/wholesale/" secondary>
                    Wholesale & export
                  </Action>
                </div>
                <a
                  className="studio-text-link"
                  href={`mailto:${verifiedBusiness.email}`}
                >
                  {verifiedBusiness.email} <LinkArrow />
                </a>
              </article>
            </div>
          </div>
        </section>
      ) : (
        <section className="platform-contact-strip">
          <div className="platform-wrap">
            <Eyebrow>Next step</Eyebrow>
            <h2>Share your idea with the team.</h2>
            <p>
              Contact us directly. No account or online checkout is required.
            </p>
            <Action href="/contact/">See contact options</Action>
          </div>
        </section>
      )}
    </PlatformShell>
  );
}
