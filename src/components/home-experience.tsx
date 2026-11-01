import Link from "next/link";
import { LinkArrow as Arrow } from "./link-arrow";
import { PlatformShell } from "./platform-shell";
import { Media, ProductCard } from "./thar-ui";
import { catalogue, collectionCards } from "@/lib/platform";

/** Genuine archive close-ups, pieced together like a ralli quilt. */
const patchwork = [
  {
    src: "/images/editorial/embroidery-detail.jpeg",
    alt: "A close look at colourful embroidery, mirror details and contrasting panels on a Thar Textiles wall hanging",
    position: "50% 50%",
    sizes:
      "(max-width: 767px) calc((100vw - 38px) * 0.64), (max-width: 1023px) 60vw, 520px",
  },
  {
    src: "/images/editorial/bag-detail.jpeg",
    alt: "Green circular motif and mirror work on the front of an embroidered shoulder bag",
    position: "50% 62%",
    sizes:
      "(max-width: 767px) calc((100vw - 38px) * 0.36), (max-width: 1023px) 34vw, 300px",
  },
  {
    src: "/images/editorial/home-detail.jpeg",
    alt: "Embroidered flower medallions along the border of a wall hanging",
    position: "50% 45%",
    sizes:
      "(max-width: 767px) calc((100vw - 38px) * 0.36), (max-width: 1023px) 34vw, 300px",
  },
];

export function HomeExperience() {
  return (
    <PlatformShell>
      <section className="tt-hero" aria-labelledby="hero-title">
        <div className="tt-wrap tt-hero__grid">
          <div className="tt-hero__copy">
            <p className="tt-eyebrow">Tharparkar, Sindh · Pakistan</p>
            <h1 id="hero-title" className="tt-display">
              From Thar. <em>With character.</em>
            </h1>
            <p className="tt-lede">
              Colour, texture and handwork. Textiles with a place of their own.
            </p>
            <div className="tt-actions">
              <Link className="tt-button" href="/shop/">
                Explore the collection <Arrow />
              </Link>
              <Link className="tt-link" href="/about/">
                Our story <Arrow />
              </Link>
            </div>
          </div>
          <figure className="tt-patchwork">
            <div className="tt-patchwork__tiles">
              {patchwork.map((tile, index) => (
                <Media
                  key={tile.src}
                  src={tile.src}
                  alt={tile.alt}
                  sizes={tile.sizes}
                  position={tile.position}
                  priority={index === 0}
                  className={`tt-patchwork__tile tt-patchwork__tile--${index + 1}`}
                />
              ))}
            </div>
            <figcaption className="tt-caption">
              <span>The beauty is in the detail.</span>
              <span>Embroidery close-ups · Thar Textiles archive</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="tt-section tt-section--tight"
        aria-labelledby="collection-title"
      >
        <div className="tt-wrap">
          <div className="tt-section-head">
            <div>
              <p className="tt-eyebrow">The collection</p>
              <h2 id="collection-title" className="tt-heading">
                A little extraordinary.
              </h2>
            </div>
            <Link className="tt-link" href="/shop/">
              Discover all pieces <Arrow />
            </Link>
          </div>
          <nav className="tt-chips" aria-label="Browse collections">
            {collectionCards.map((item) => (
              <Link
                key={item.category}
                href={`/shop/?category=${encodeURIComponent(item.category)}`}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="tt-grid">
            {catalogue.map((item, index) => (
              <ProductCard key={item.slug} item={item} index={index} />
            ))}
          </div>
          <div className="tt-note">
            <p>
              See something you love? Ask us about the piece, its details and
              availability.
            </p>
            <Link className="tt-link" href="/shop/">
              Discover all pieces <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="tt-section tt-section--stone tt-story"
        aria-labelledby="story-title"
      >
        <div className="tt-wrap tt-story__grid">
          <figure className="tt-story__figure">
            <Media
              src="/images/editorial/peacock-detail.jpeg"
              alt="An embroidered peacock beside a house motif on a Thar Textiles wall hanging"
              sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 80vw, 620px"
              position="45% 55%"
            />
            <figcaption className="tt-caption">
              <span>Wall hanging, detail</span>
              <span>Thar Textiles archive</span>
            </figcaption>
          </figure>
          <div className="tt-story__copy">
            <p className="tt-eyebrow">Our place in the world</p>
            <h2 id="story-title" className="tt-heading">
              Local roots. <em>An open outlook.</em>
            </h2>
            <p>
              A women-led textile enterprise in Mithi, Thar Textiles connects
              the handwork of Tharparkar with people near and far.
            </p>
            <p>
              Discover a piece for yourself. Visit us in Sindh. Or begin a
              conversation about bringing this craft to your collection.
            </p>
            <div className="tt-actions">
              <Link className="tt-link" href="/about/">
                Our story <Arrow />
              </Link>
              <Link className="tt-link" href="/artisans/">
                People &amp; practice <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tt-invite" aria-labelledby="invitation-title">
        <div className="tt-wrap tt-invite__grid">
          <div>
            <p className="tt-eyebrow tt-eyebrow--on-dark">
              For thoughtful connections
            </p>
            <h2 id="invitation-title" className="tt-heading">
              Good things begin <em>with a conversation.</em>
            </h2>
          </div>
          <ul className="tt-invite__links">
            <li>
              <Link href="/wholesale/">
                Wholesale &amp; export <Arrow />
              </Link>
            </li>
            <li>
              <Link href="/impact/">
                Partnerships &amp; impact <Arrow />
              </Link>
            </li>
            <li>
              <Link href="/collaborate/">
                Design &amp; collaboration <Arrow />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </PlatformShell>
  );
}
