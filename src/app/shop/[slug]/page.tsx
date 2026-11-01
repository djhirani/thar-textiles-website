import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformShell } from "@/components/platform-shell";
import { Action, Eyebrow, ProductCards } from "@/components/platform-ui";
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
  return (
    <PlatformShell>
      <div className="platform-wrap">
        <nav className="platform-breadcrumb" aria-label="Breadcrumb">
          <Link href="/shop/">Shop & collections</Link>
          <span aria-hidden="true">/</span>
          <span>{item.title}</span>
        </nav>
        <div className="platform-pdp">
          <ProductGallery images={item.gallery} alt={item.imageAlt} />
          <div className="platform-pdp__copy">
            <Eyebrow>{item.category} · Tharparkar, Pakistan</Eyebrow>
            <h1>{item.title}</h1>
            <p className="studio-product-description">{item.description}</p>
            <p>
              Ask about sizing or dimensions, care, current availability and
              delivery to your city or country.
            </p>
            <Action href="#enquiry">Enquire about this piece</Action>
            <p>
              <a
                href={`mailto:${verifiedBusiness.email}?subject=${encodeURIComponent(`Product enquiry: ${item.title} (${item.slug})`)}`}
              >
                Or enquire by email
              </a>
            </p>
            <div className="platform-pdp__facts">
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
      <section className="platform-section platform-section--paper">
        <div className="platform-wrap">
          <div className="platform-heading">
            <Eyebrow>More to explore</Eyebrow>
            <h2>Continue through the collection.</h2>
          </div>
          <ProductCards count={3} excludeSlug={item.slug} />
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
