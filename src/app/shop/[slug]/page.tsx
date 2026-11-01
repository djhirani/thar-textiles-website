import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { Crumbs, ProductCard, productPhoto } from "@/components/thar-ui";
import { LinkArrow } from "@/components/link-arrow";
import { ProductGallery } from "@/components/product-gallery";
import { catalogue } from "@/lib/platform";
import { verifiedBusiness } from "@/lib/content";
import Link from "next/link";
import { EnquiryForm } from "@/components/enquiry-form";

export function generateStaticParams() {
  return catalogue.map((item) => ({ slug: item.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = catalogue.find((item) => item.slug === slug);
  return {
    title: item?.title || "Collection piece",
    alternates: { canonical: `/shop/${slug}/` },
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = catalogue.find((item) => item.slug === slug);
  if (!item) notFound();
  const photo = productPhoto(item);
  return (
    <PlatformShell>
      <div className="tt-wrap tt-pdp-wrap">
        <Crumbs
          current={item.title}
          trail={[{ label: "Shop & collections", href: "/shop/" }]}
        />
        <div className="tt-pdp">
          <ProductGallery
            images={[photo.src]}
            alt={item.imageAlt}
            ratio={photo.ratio}
          />
          <div className="tt-pdp__copy">
            <p className="tt-eyebrow">{item.category} · Tharparkar, Pakistan</p>
            <h1 className="tt-title">{item.title}</h1>
            <p className="tt-pdp__description">{item.description}</p>
            <p className="tt-pdp__ask">
              Ask about sizing or dimensions, care, current availability and
              delivery to your city or country.
            </p>
            <div className="tt-actions">
              <a className="tt-button" href="#enquiry">
                Enquire about this piece <LinkArrow />
              </a>
              <a
                className="tt-link"
                href={`mailto:${verifiedBusiness.email}?subject=${encodeURIComponent(`Product enquiry: ${item.title} (${item.slug})`)}`}
              >
                Or enquire by email
              </a>
            </div>
            <div className="tt-facts">
              <h2>Before you order</h2>
              <dl>
                <div>
                  <dt>Category</dt>
                  <dd>{item.category}</dd>
                </div>
                <div>
                  <dt>Current price, dimensions & availability</dt>
                  <dd>By direct enquiry</dd>
                </div>
                <div>
                  <dt>Delivery arrangements</dt>
                  <dd>Confirm with the team</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <section
        className="tt-section tt-section--stone"
        aria-labelledby="more-title"
      >
        <div className="tt-wrap">
          <div className="tt-section-head">
            <div>
              <p className="tt-eyebrow">More to explore</p>
              <h2 id="more-title" className="tt-heading">
                Continue through the collection.
              </h2>
            </div>
            <Link className="tt-link" href="/shop/">
              Shop &amp; collections <LinkArrow />
            </Link>
          </div>
          <div className="tt-grid tt-grid--three">
            {catalogue
              .filter((other) => other.slug !== item.slug)
              .map((other) => (
                <ProductCard
                  key={other.slug}
                  item={other}
                  index={catalogue.indexOf(other)}
                  sizes="(max-width: 767px) calc((100vw - 44px) / 2), (max-width: 1480px) calc((100vw - 144px) / 3), 448px"
                />
              ))}
          </div>
        </div>
      </section>
      <EnquiryForm
        kind="wholesale"
        productSlug={item.slug}
        productTitle={item.title}
      />
    </PlatformShell>
  );
}
