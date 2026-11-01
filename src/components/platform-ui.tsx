import { TextileImage } from "./textile-image";
import Link from "next/link";
import { catalogue } from "@/lib/platform";

export function Photo({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(max-width: 767px) calc(100vw - 40px), (max-width: 1512px) 45vw, 668px",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`platform-photo ${className}`}>
      <TextileImage src={src} alt={alt} sizes={sizes} priority={priority} />
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="platform-eyebrow">{children}</p>;
}

export function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  const className = `platform-action ${secondary ? "platform-action--secondary" : ""}`;
  const content = (
    <>
      {children}
      <span aria-hidden="true">↗</span>
    </>
  );
  return href.startsWith("/") ? (
    <Link className={className} href={href}>
      {content}
    </Link>
  ) : (
    <a className={className} href={href}>
      {content}
    </a>
  );
}

export function ProductCards({
  count,
  editorial = false,
  excludeSlug,
}: {
  count?: number;
  editorial?: boolean;
  excludeSlug?: string;
}) {
  return (
    <div
      className={`platform-products ${count === 3 ? "platform-products--three" : ""}`}
    >
      {catalogue
        .filter((item) => item.slug !== excludeSlug)
        .slice(0, count)
        .map((item) => (
          <article className="platform-product" key={item.slug}>
            <Link href={`/shop/${item.slug}/`}>
              <Photo
                src={
                  editorial && item.category === "Bags"
                    ? "/images/editorial/bag-framed.jpeg"
                    : item.image.replace(/^.*\/images/, "/images")
                }
                alt={item.imageAlt}
                sizes={
                  count === 3
                    ? "(max-width: 767px) calc((100vw - 54px) / 2), (max-width: 1512px) calc((100vw - 136px) / 3), 459px"
                    : "(max-width: 767px) calc((100vw - 54px) / 2), (max-width: 1023px) calc((100vw - 116px) / 2), (max-width: 1512px) calc((100vw - 156px) / 4), 339px"
                }
              />
              <div className="platform-product__meta">
                <span>{item.category}</span>
                <span>View piece ↗</span>
              </div>
              <h3>{item.title}</h3>
              <p>Details and availability by enquiry</p>
            </Link>
          </article>
        ))}
    </div>
  );
}
