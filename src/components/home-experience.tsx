import Link from "next/link";
import { LinkArrow as Arrow } from "./link-arrow";
import { PlatformShell } from "./platform-shell";
import { TextileImage } from "./textile-image";
import { catalogue, collectionCards } from "@/lib/platform";
import styles from "./home-experience.module.css";

export function HomeExperience() {
  return (
    <PlatformShell theme="gallery" darkAccent="craft">
      <div className={styles.home}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <p className={styles.eyebrow}>Tharparkar, Sindh · Pakistan</p>
          <div className={styles.heroIntro}>
            <h1 id="hero-title">
              From Thar.
              <br />
              <span>With character.</span>
            </h1>
            <div className={styles.heroCopy}>
              <p>
                Colour, texture and handwork.
                <br />
                Textiles with a place of their own.
              </p>
              <Link className={styles.primaryLink} href="/shop/">
                Explore the collection <Arrow />
              </Link>
            </div>
          </div>
          <figure className={styles.heroFigure}>
            <div className={styles.heroImage}>
              <TextileImage
                src="/images/editorial/embroidery-detail.jpeg"
                alt="A close look at colourful embroidery, mirror details and contrasting panels on a Thar Textiles wall hanging"
                sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1512px) calc(100vw - 96px), 1416px"
                priority
              />
            </div>
            <figcaption>
              <span>The beauty is in the detail.</span>
              <span>Embroidery close-up · Thar Textiles archive</span>
            </figcaption>
          </figure>
        </section>

        <section
          className={styles.collection}
          aria-labelledby="collection-title"
        >
          <div className={styles.sectionTop}>
            <div>
              <p className={styles.eyebrow}>The collection</p>
              <h2 id="collection-title">A little extraordinary.</h2>
            </div>
            <Link className={styles.textLink} href="/shop/">
              Discover all pieces <Arrow />
            </Link>
          </div>
          <nav className={styles.categories} aria-label="Browse collections">
            {collectionCards.map((item) => (
              <Link
                key={item.category}
                href={`/shop/?category=${encodeURIComponent(item.category)}`}
              >
                {item.title}
                <Arrow />
              </Link>
            ))}
          </nav>
          <div className={styles.products}>
            {catalogue.map((item, index) => (
              <article className={styles.product} key={item.slug}>
                <Link href={`/shop/${item.slug}/`}>
                  <div
                    className={`${styles.productImage} ${item.category === "Home textiles" ? styles.roundImage : ""}`}
                  >
                    <TextileImage
                      src={
                        item.category === "Bags"
                          ? "/images/editorial/bag-framed.jpeg"
                          : item.image.replace(/^.*\/images/, "/images")
                      }
                      alt={item.imageAlt}
                      sizes="(max-width: 767px) calc((100vw - 54px) / 2), (max-width: 1023px) calc((100vw - 116px) / 2), (max-width: 1512px) calc((100vw - 156px) / 4), 339px"
                    />
                    <span className={styles.productNumber} aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>
                  <div className={styles.productMeta}>
                    <span>{item.category}</span>
                    <Arrow />
                  </div>
                  <h3>{item.title}</h3>
                </Link>
              </article>
            ))}
          </div>
          <p className={styles.collectionNote}>
            See something you love? Ask us about the piece, its details and
            availability.
          </p>
        </section>

        <section className={styles.story} aria-labelledby="story-title">
          <div className={styles.storyImage}>
            <TextileImage
              src="/images/editorial/studio-embroidery.jpeg"
              alt="Floral and geometric embroidery in a close-up of an original Thar Textiles garment"
              sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1512px) 43vw, 620px"
            />
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>Our place in the world</p>
            <h2 id="story-title">
              Local roots.
              <br />
              An open outlook.
            </h2>
            <p>
              A women-led textile enterprise in Mithi, Thar Textiles connects
              the handwork of Tharparkar with people near and far.
            </p>
            <p>
              Discover a piece for yourself. Visit us in Sindh. Or begin a
              conversation about bringing this craft to your collection.
            </p>
            <div className={styles.storyLinks}>
              <Link className={styles.textLink} href="/about/">
                Our story <Arrow />
              </Link>
              <Link className={styles.textLink} href="/artisans/">
                People &amp; practice <Arrow />
              </Link>
            </div>
          </div>
        </section>

        <section
          className={styles.invitation}
          aria-labelledby="invitation-title"
        >
          <div>
            <p className={styles.eyebrow}>For thoughtful connections</p>
            <h2 id="invitation-title">
              Good things begin
              <br />
              with a conversation.
            </h2>
          </div>
          <div className={styles.invitationLinks}>
            <Link href="/wholesale/">
              Wholesale &amp; export <Arrow />
            </Link>
            <Link href="/impact/">
              Partnerships &amp; impact <Arrow />
            </Link>
            <Link href="/collaborate/">
              Design &amp; collaboration <Arrow />
            </Link>
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
