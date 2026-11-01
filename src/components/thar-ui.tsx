import Link from "next/link";
import { LinkArrow } from "./link-arrow";
import { TextileImage } from "./textile-image";
import { catalogue } from "@/lib/platform";

type CatalogueItem = (typeof catalogue)[number];

/**
 * Card framing for each catalogue photograph. Every card shares one 4:5
 * frame; the focal point keeps garments whole and trims distracting floor
 * and wall where the original photographs allow it.
 */
const framing: Record<
  string,
  { src?: string; position: string; zoom?: number; ratio: string }
> = {
  "red-embroidered-kurta": { position: "50% 30%", ratio: "3 / 4" },
  "ochre-embroidered-kurta": {
    position: "50% 0%",
    zoom: 1.12,
    ratio: "3 / 4",
  },
  "embroidered-shoulder-bag": {
    src: "/images/site-products/embroidered-shoulder-bag.jpeg",
    position: "50% 60%",
    ratio: "3 / 4",
  },
  "round-textile-wall-hanging": { position: "50% 50%", ratio: "1238 / 1280" },
};

/** The whole, uncropped photograph and its natural proportions. */
export function productPhoto(item: CatalogueItem) {
  const frame = framing[item.slug];
  return {
    src: frame?.src ?? item.image.replace(/^.*\/images/, "/images"),
    ratio: frame?.ratio ?? "3 / 4",
  };
}

export function Media({
  src,
  alt,
  sizes,
  priority = false,
  position,
  zoom,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  position?: string;
  zoom?: number;
  className?: string;
}) {
  return (
    <div
      className={`tt-media ${className}`}
      style={
        {
          "--tt-focus": position,
          "--tt-zoom": zoom,
        } as React.CSSProperties
      }
    >
      <TextileImage src={src} alt={alt} sizes={sizes} priority={priority} />
    </div>
  );
}

export function ProductCard({
  item,
  index,
  priority = false,
  sizes = "(max-width: 767px) calc((100vw - 44px) / 2), (max-width: 1480px) calc((100vw - 136px) / 4), 336px",
}: {
  item: CatalogueItem;
  index: number;
  priority?: boolean;
  sizes?: string;
}) {
  const frame = framing[item.slug];
  return (
    <article className="tt-card">
      <Link href={`/shop/${item.slug}/`}>
        <Media
          src={frame?.src ?? item.image.replace(/^.*\/images/, "/images")}
          alt={item.imageAlt}
          sizes={sizes}
          priority={priority}
          position={frame?.position}
          zoom={frame?.zoom}
          className="tt-card__media"
        />
        <div className="tt-card__body">
          <p className="tt-card__meta">
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.category}
          </p>
          <h3>{item.title}</h3>
          <p className="tt-card__note">
            Details and availability by enquiry
            <LinkArrow />
          </p>
        </div>
      </Link>
    </article>
  );
}

export function Crumbs({
  current,
  trail = [],
}: {
  current: string;
  trail?: { label: string; href: string }[];
}) {
  return (
    <nav className="tt-crumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {trail.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
        <li aria-current="page">{current}</li>
      </ol>
    </nav>
  );
}

/** Inner-page opening: breadcrumb, title block and an optional figure. */
export function PageHead({
  crumb,
  eyebrow,
  title,
  intro,
  children,
  figure,
  variant = "plain",
  id,
}: {
  crumb: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
  figure?: React.ReactNode;
  variant?: "plain" | "split";
  id: string;
}) {
  return (
    <section
      className={`tt-page-head tt-page-head--${variant}`}
      aria-labelledby={id}
    >
      <div className="tt-wrap">
        <Crumbs current={crumb} />
        <div className="tt-page-head__grid">
          <div className="tt-page-head__copy">
            <p className="tt-eyebrow">{eyebrow}</p>
            <h1 id={id} className="tt-title">
              {title}
            </h1>
            {intro && <p className="tt-page-head__intro">{intro}</p>}
            {children}
          </div>
          {figure}
        </div>
      </div>
    </section>
  );
}

export function Figure({
  src,
  alt,
  caption,
  sizes,
  position,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  caption: string;
  sizes: string;
  position?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`tt-figure ${className}`}>
      <Media
        src={src}
        alt={alt}
        sizes={sizes}
        position={position}
        priority={priority}
      />
      <figcaption className="tt-caption">
        <span>{caption}</span>
        <span>Thar Textiles archive</span>
      </figcaption>
    </figure>
  );
}
