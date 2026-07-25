import Image from "next/image";
import { products, verifiedBusiness } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  ButtonLink,
  Container,
  DecorativeStitch,
  SectionHeading,
  TextLink,
} from "@/components/primitives";

const heroBag = withBasePath(
  "/images/site-products/embroidered-shoulder-bag.jpeg",
);
const heroKurta = withBasePath("/images/site-products/hero-kurta.jpeg");
const roundTextile = withBasePath(
  "/images/site-products/editorial-round-wall-hanging.jpeg",
);
const wallTextile = withBasePath(
  "/images/site-products/editorial-wall-hanging.jpeg",
);

const moods = [
  {
    index: "01",
    title: "Everyday statement",
    copy: "Colour and handwork that transform the simplest wardrobe.",
    image: products[0].image,
  },
  {
    index: "02",
    title: "Modern occasion",
    copy: "Expressive pieces for gatherings, celebrations and evenings.",
    image: products[1].image,
  },
  {
    index: "03",
    title: "Carry the craft",
    copy: "Textile bags with pattern, character and a strong point of view.",
    image: products[2].image,
  },
  {
    index: "04",
    title: "Home from Thar",
    copy: "Embroidered forms that bring rhythm and colour into a room.",
    image: products[3].image,
  },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <SiteHeader />
      <main id="main">
        <section aria-labelledby="hero-title" className="hero">
          <Container className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Women Crafting Change</p>
              <h1 id="hero-title">
                Handmade in Thar.
                <br />
                <em>Worn everywhere.</em>
              </h1>
              <p className="hero-intro">
                Modern garments and textile pieces shaped by the craft
                traditions of Tharparkar—made with character and designed to
                travel.
              </p>
              <div className="hero-actions">
                <ButtonLink href="#shop">Explore the pieces</ButtonLink>
                <TextLink href="#women">Meet the women</TextLink>
              </div>
              <p className="asset-note">
                Product-source imagery. Campaign photography in development.
              </p>
            </div>
            <div className="hero-visual">
              <div className="hero-frame hero-frame--main">
                <Image
                  alt="Rectangular shoulder bag with dense multicoloured geometric embroidery"
                  fill
                  loading="eager"
                  priority
                  sizes="(max-width: 767px) 88vw, (max-width: 1199px) 52vw, 43vw"
                  src={heroBag}
                />
              </div>
              <div className="hero-frame hero-frame--small">
                <Image
                  alt="Green hand-embroidered kurta hanging against a pale background"
                  fill
                  sizes="(max-width: 767px) 38vw, 18vw"
                  src={heroKurta}
                />
              </div>
              <div aria-hidden="true" className="hero-orbit">
                <span>Tharparkar · Sindh · Pakistan</span>
              </div>
              <DecorativeStitch />
            </div>
          </Container>
        </section>

        <section className="collection section" id="collection">
          <Container>
            <div className="collection-grid">
              <div className="collection-image collection-image--portrait">
                <Image
                  alt="Red and indigo hand-embroidered kurta"
                  fill
                  sizes="(max-width: 767px) 88vw, 38vw"
                  src={products[0].image}
                />
                <span className="image-index">01 / 02</span>
              </div>
              <div className="collection-copy">
                <p className="eyebrow">The first edit</p>
                <h2>
                  Desert light,
                  <br />
                  <em>modern heirlooms.</em>
                </h2>
                <p>
                  An introduction to colour, embroidery and textile form from
                  Tharparkar. This first edit brings together garments, bags and
                  objects selected from the available product archive.
                </p>
                <TextLink href="#shop">Discover the edit</TextLink>
              </div>
              <div className="collection-image collection-image--square">
                <Image
                  alt="Round textile wall hanging assembled from colourful embroidered panels"
                  fill
                  sizes="(max-width: 767px) 70vw, 28vw"
                  src={roundTextile}
                />
              </div>
            </div>
          </Container>
        </section>

        <section className="moods section" id="new">
          <Container>
            <SectionHeading
              copy="Begin with how you want to wear or live with the work."
              eyebrow="Find your piece"
              title="Shop by mood"
            />
            <div className="mood-grid">
              {moods.map((mood) => (
                <article className="mood-card" key={mood.title}>
                  <a href="#shop">
                    <div className="mood-image">
                      <Image
                        alt=""
                        fill
                        sizes="(max-width: 639px) 88vw, (max-width: 1023px) 44vw, 22vw"
                        src={mood.image}
                      />
                    </div>
                    <div className="mood-meta">
                      <span>{mood.index}</span>
                      <h3>{mood.title}</h3>
                    </div>
                    <p>{mood.copy}</p>
                  </a>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="manifesto section">
          <Container>
            <p aria-hidden="true" className="manifesto-number">
              03
            </p>
            <p className="manifesto-copy">
              Not mass-made.
              <br />
              Not anonymous.
              <br />
              <em>Every stitch has a maker.</em>
            </p>
            <DecorativeStitch />
          </Container>
        </section>

        <section className="products section" id="shop">
          <Container>
            <div className="section-heading-row">
              <SectionHeading
                eyebrow="Selected from the archive"
                title="Pieces with presence"
              />
              <TextLink href="#contact">Ask about availability</TextLink>
            </div>
            <div className="product-grid">
              {products.map((product, index) => (
                <article
                  className="product-card"
                  key={`${product.image}-${index}`}
                >
                  <a href="#contact">
                    <div className="product-image">
                      <Image
                        alt={product.imageAlt}
                        fill
                        sizes="(max-width: 639px) 44vw, (max-width: 1023px) 30vw, 22vw"
                        src={product.image}
                      />
                      <span className="product-state">Archive preview</span>
                    </div>
                    <div className="product-info">
                      <div>
                        <p>{product.category}</p>
                        <h3>{product.title}</h3>
                      </div>
                      <span aria-hidden="true">↗</span>
                    </div>
                    <p className="product-note">{product.note}</p>
                  </a>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="craft section" id="craft">
          <Container className="craft-grid">
            <div className="craft-image">
              <Image
                alt="Close view of colourful embroidered and mirror-work textile panels"
                fill
                sizes="(max-width: 767px) 100vw, 58vw"
                src={roundTextile}
              />
              <div className="craft-lens" aria-hidden="true">
                <span />
              </div>
            </div>
            <div className="craft-copy">
              <p className="eyebrow">The character is in the hand</p>
              <h2>Look closer.</h2>
              <p className="craft-lead">A machine repeats. A hand responds.</p>
              <p>
                Hand embroidery, mirror work, ralli and appliqué belong to the
                living textile traditions represented by Thar Textiles. Small
                variations reveal human attention—not uniform production.
              </p>
              <TextLink href="#story">Explore the craft</TextLink>
            </div>
          </Container>
        </section>

        <section className="styling section">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="A modern point of view"
              title="Made in the desert. Styled for the city."
              copy="The styling campaign is the next essential shoot. These compositions establish the intended rhythm without pretending product-source photographs are final editorial assets."
            />
            <div className="styling-grid">
              <article className="style-frame style-frame--one">
                <Image
                  alt="Green embroidered kurta shown as a product-source photograph"
                  fill
                  sizes="(max-width: 767px) 82vw, 31vw"
                  src={heroKurta}
                />
                <span>01 — Everyday colour</span>
              </article>
              <article className="style-frame style-frame--two">
                <Image
                  alt="Red embroidered kurta shown as a product-source photograph"
                  fill
                  sizes="(max-width: 767px) 60vw, 25vw"
                  src={products[0].image}
                />
                <span>02 — An expressive layer</span>
              </article>
              <aside className="styling-note">
                <p>Photography brief</p>
                <p>
                  Pair one embroidered piece with denim, tailoring and quiet
                  neutrals. Show movement, scale and ease.
                </p>
              </aside>
            </div>
          </Container>
        </section>

        <section className="women section" id="women">
          <Container className="women-grid">
            <div className="women-copy">
              <p className="eyebrow">Women-founded. Women-led.</p>
              <h2>
                The women
                <br />
                <em>behind the work.</em>
              </h2>
              <p className="women-lead">
                Thar Textiles was founded by three women from Tharparkar and is
                led by CEO Ms. Lachhmi.
              </p>
              <p>
                The company connects the region’s textile knowledge with fair,
                serious markets. Individual profiles will appear only with
                verified details and explicit consent.
              </p>
              <TextLink href="#story">Read our story</TextLink>
            </div>
            <div className="women-placeholder">
              <div aria-hidden="true" className="portrait-motif">
                <span />
                <span />
                <span />
              </div>
              <p>Founder and artisan portrait commission</p>
              <span>Required for final publication</span>
            </div>
          </Container>
        </section>

        <section className="process section">
          <Container>
            <SectionHeading
              eyebrow="From hand to wardrobe"
              title="A piece takes shape"
            />
            <ol className="process-list">
              {[
                [
                  "01",
                  "Design & colour",
                  "A direction begins with use, form and colour.",
                ],
                [
                  "02",
                  "Fabric preparation",
                  "The textile becomes a surface for skilled work.",
                ],
                [
                  "03",
                  "Hand embroidery",
                  "Pattern develops through attentive, human making.",
                ],
                [
                  "04",
                  "Finish & quality",
                  "Construction and finishing prepare the piece for use.",
                ],
                [
                  "05",
                  "Style & deliver",
                  "The work enters a modern wardrobe or home.",
                ],
              ].map(([number, title, copy]) => (
                <li key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        <section className="product-story section">
          <Container className="product-story-grid">
            <div className="product-story-image">
              <Image
                alt="Rectangular embroidered wall hanging with a peacock motif"
                fill
                sizes="(max-width: 767px) 88vw, 42vw"
                src={wallTextile}
              />
            </div>
            <div className="product-story-copy">
              <p className="eyebrow">One piece, many gestures</p>
              <h2>A textile that asks you to pause.</h2>
              <p>
                Dense embroidery, appliqué and a figurative peacock composition
                create an object with presence from a distance and character up
                close.
              </p>
              <dl>
                <div>
                  <dt>Object</dt>
                  <dd>Rectangular textile wall hanging</dd>
                </div>
                <div>
                  <dt>Origin</dt>
                  <dd>Tharparkar, Sindh, Pakistan</dd>
                </div>
                <div>
                  <dt>Maker</dt>
                  <dd>Attribution pending verification and consent</dd>
                </div>
              </dl>
              <TextLink href="#contact">Enquire about the piece</TextLink>
            </div>
          </Container>
        </section>

        <section className="place section" id="story">
          <Container className="place-grid">
            <div className="place-title">
              <p className="eyebrow">Place shapes the work</p>
              <h2>Tharparkar</h2>
            </div>
            <div
              className="place-landscape"
              role="img"
              aria-label="Abstract interpretation of the Tharparkar desert awaiting commissioned landscape photography"
            >
              <span className="sun" />
              <span className="dune dune--one" />
              <span className="dune dune--two" />
              <p>Landscape photography commission pending</p>
            </div>
            <div className="place-copy">
              <p className="place-lead">
                Not a decorative backdrop. The origin of the colour, rhythm,
                geometry and textile knowledge behind the work.
              </p>
              <p>
                Thar Textiles is headquartered in Mithi, in Tharparkar District,
                Sindh, Pakistan, with outlets in Mithi and Nagarparkar.
              </p>
              <TextLink href="#contact">Visit and contact</TextLink>
            </div>
          </Container>
        </section>

        <section className="real-trade section">
          <Container className="real-trade-grid">
            <p className="eyebrow">Real trade, not charity</p>
            <h2>
              Buy it because it is exceptional.
              <br />
              <em>Know its maker because she matters.</em>
            </h2>
            <p>
              Thar Textiles exists to build serious markets for excellent work:
              stronger design, fair value, better visibility and women at the
              centre of production.
            </p>
          </Container>
        </section>

        <section className="impact section" id="impact">
          <Container>
            <div className="impact-grid">
              <div>
                <p className="eyebrow">Impact & research</p>
                <h2>Craft, climate and a wider textile future.</h2>
              </div>
              <div className="impact-copy">
                <p>
                  Alongside its craft work, Thar Textiles develops evidence and
                  policy engagement around energy and carbon in Sindh’s textile
                  value chain.
                </p>
                <TextLink href="#contact">Explore the verified work</TextLink>
              </div>
              <div className="impact-facts">
                <article>
                  <span>01</span>
                  <h3>Women-led</h3>
                  <p>Founded by three women from Tharparkar.</p>
                </article>
                <article>
                  <span>02</span>
                  <h3>Handmade</h3>
                  <p>Embroidery, mirror work, ralli and appliqué.</p>
                </article>
                <article>
                  <span>03</span>
                  <h3>Evidence-led</h3>
                  <p>Public claims must match documented facts.</p>
                </article>
              </div>
            </div>
          </Container>
        </section>

        <section className="trade section" id="trade">
          <Container className="trade-grid">
            <div>
              <p className="eyebrow">For boutiques, designers and partners</p>
              <h2>Original craft for modern retail.</h2>
            </div>
            <p>
              Wholesale, capsule collaborations, cultural partnerships and
              exhibitions are available by enquiry. International fulfilment is
              in development and no capacity is implied.
            </p>
            <ButtonLink href={`mailto:${verifiedBusiness.email}`} tone="light">
              Start a conversation
            </ButtonLink>
          </Container>
        </section>

        <section className="journal section" id="journal">
          <Container>
            <SectionHeading
              eyebrow="Journal preview"
              title="Ways of wearing. Ways of making."
            />
            <div className="journal-grid">
              {[
                [
                  "Style",
                  "How to style an embroidered piece without losing yourself in it",
                ],
                ["Craft", "What the hand leaves behind"],
                ["Place", "From Tharparkar to a modern wardrobe"],
              ].map(([category, title], index) => (
                <article key={title}>
                  <a href="#contact">
                    <span className="journal-index">0{index + 1}</span>
                    <p className="eyebrow">{category}</p>
                    <h3>{title}</h3>
                    <p className="draft-label">Editorial commissioning brief</p>
                  </a>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section className="newsletter section">
          <Container className="newsletter-grid">
            <div>
              <p className="eyebrow">Letters from Thar</p>
              <h2>New pieces, maker stories and limited drops.</h2>
            </div>
            <form action="#" className="newsletter-form">
              <label htmlFor="email">Email address</label>
              <div>
                <input
                  autoComplete="email"
                  id="email"
                  name="email"
                  placeholder="Email address"
                  type="email"
                />
                <button type="submit">Join the list</button>
              </div>
              <p>
                Preview only—submission is not connected until privacy wording
                and an approved provider are supplied.
              </p>
            </form>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
