import { LinkArrow } from "@/components/link-arrow";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { catalogue, sectionData, type SectionKey } from "@/lib/platform";
import { verifiedBusiness } from "@/lib/content";
import { CatalogueSearch, CatalogueTools } from "@/components/catalogue-search";
import { Crumbs, ProductCard } from "@/components/thar-ui";
import Link from "next/link";
import { Suspense } from "react";
import {
  AboutPage,
  ArtisansPage,
  CollaboratePage,
  ContactPage,
  ImpactPage,
  WholesalePage,
} from "@/components/section-pages";

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
      <PlatformShell>
        <section className="tt-page-head" aria-labelledby="shop-title">
          <div className="tt-wrap">
            <Crumbs current="Shop & collections" />
            <div className="tt-page-head__grid">
              <div>
                <p className="tt-eyebrow">The collection</p>
                <h1 id="shop-title" className="tt-title">
                  Craft to wear. <em>Craft to live with.</em>
                </h1>
              </div>
              <p className="tt-page-head__intro">
                Explore embroidered garments, shoulder bags and wall pieces from
                Tharparkar, Pakistan. Tell us the piece, quantity and your city
                or country; the team will confirm details and availability.
              </p>
            </div>
          </div>
        </section>
        <section className="tt-catalogue" aria-labelledby="pieces-title">
          <div className="tt-wrap">
            <h2 id="pieces-title" className="sr-only">
              Collection pieces
            </h2>
            <Suspense
              fallback={
                <div aria-busy="true">
                  <CatalogueTools disabled />
                  <p className="tt-count" role="status">
                    Loading collection…
                  </p>
                  <div className="tt-grid">
                    {catalogue.map((item, index) => (
                      <ProductCard
                        key={item.slug}
                        item={item}
                        index={index}
                        priority
                      />
                    ))}
                  </div>
                </div>
              }
            >
              <CatalogueSearch />
            </Suspense>
          </div>
        </section>
        <section className="tt-enquire-strip" aria-labelledby="ask-title">
          <div className="tt-wrap tt-enquire-strip__grid">
            <div>
              <h2 id="ask-title" className="tt-heading tt-heading--small">
                See something you love?
              </h2>
              <p>
                Ask us about the piece, its details and availability. Contact us
                directly. No account or online checkout is required.
              </p>
            </div>
            <div className="tt-enquire-strip__links">
              <a
                className="tt-button"
                href={`mailto:${verifiedBusiness.email}?subject=${encodeURIComponent("Product enquiry")}`}
              >
                Email {verifiedBusiness.email}
              </a>
              <a
                className="tt-button tt-button--quiet"
                href={`tel:+${verifiedBusiness.phoneHref}`}
              >
                Call {verifiedBusiness.phoneDisplay}
              </a>
              <Link className="tt-link" href="/contact/">
                See contact options <LinkArrow />
              </Link>
            </div>
          </div>
        </section>
      </PlatformShell>
    );
  const Page = {
    about: AboutPage,
    artisans: ArtisansPage,
    wholesale: WholesalePage,
    impact: ImpactPage,
    collaborate: CollaboratePage,
    contact: ContactPage,
  }[section];
  if (!Page) notFound();
  return <Page />;
}
