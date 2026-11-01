import Link from "next/link";
import { LinkArrow as Arrow } from "./link-arrow";
import { EnquiryForm } from "./enquiry-form";
import { PlatformShell } from "./platform-shell";
import { Figure, Media, PageHead, ProductCard } from "./thar-ui";
import { catalogue, sectionData } from "@/lib/platform";
import { verifiedBusiness } from "@/lib/content";

const split =
  "(max-width: 767px) calc(100vw - 32px), (max-width: 1023px) 60vw, 560px";

function EnquireAction({ children }: { children: React.ReactNode }) {
  return (
    <div className="tt-actions">
      <a className="tt-button" href="#enquiry">
        {children} <Arrow />
      </a>
    </div>
  );
}

/** Numbered principles in large copper numerals. */
function Ledger({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <ol className="tt-ledger">
      {items.map((item, index) => (
        <li key={item.title}>
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </li>
      ))}
    </ol>
  );
}

/** Title-and-text rows separated by running stitches. */
function RuledList({
  items,
}: {
  items: readonly { title: string; body: string }[];
}) {
  return (
    <div className="tt-ruled">
      {items.map((item) => (
        <article key={item.title}>
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function AboutPage() {
  const data = sectionData.about;
  return (
    <PlatformShell>
      <PageHead
        id="about-title"
        variant="split"
        crumb="About"
        eyebrow={data.eyebrow}
        title={
          <>
            Handwork, <em>with a sense of place.</em>
          </>
        }
        intro={data.intro}
        figure={
          <figure className="tt-about-figure">
            <Media
              src="/images/site-products/hero-kurta.jpeg"
              alt="An original Thar Textiles kurta with floral and geometric embroidery"
              sizes={split}
              position="50% 30%"
              priority
              className="tt-about-figure__main"
            />
            <Media
              src={data.image}
              alt={data.imageAlt}
              sizes="(max-width: 767px) 38vw, 220px"
              className="tt-about-figure__inset"
            />
            <figcaption className="tt-caption">
              <span>Embroidered kurta, with detail</span>
              <span>Thar Textiles archive</span>
            </figcaption>
          </figure>
        }
      >
        <div className="tt-actions">
          <Link className="tt-button" href="/shop/">
            Explore the collection <Arrow />
          </Link>
          <a className="tt-link" href="#visit">
            Visit &amp; enquiries <Arrow />
          </a>
        </div>
      </PageHead>

      <section className="tt-section" aria-label="Our approach">
        <div className="tt-wrap">
          <Ledger items={data.sections} />
        </div>
      </section>

      <section
        className="tt-section tt-section--stone"
        id="visit"
        aria-labelledby="visit-title"
      >
        <div className="tt-wrap">
          <p className="tt-eyebrow">Near or far</p>
          <h2 id="visit-title" className="tt-heading">
            A place to visit. <em>A team to talk to.</em>
          </h2>
          <div className="tt-visit">
            <article>
              <p className="tt-kicker">01 / In Sindh</p>
              <h3>Visit us in Thar.</h3>
              <p>
                Find Thar Textiles in Mithi and Nagarparkar. Contact the team to
                confirm opening times before travelling.
              </p>
              <dl className="tt-addresses">
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
                className="tt-link"
                href={`tel:+${verifiedBusiness.phoneHref}`}
              >
                Call {verifiedBusiness.phoneDisplay} <Arrow />
              </a>
            </article>
            <article>
              <p className="tt-kicker">02 / Across borders</p>
              <h3>Start with your enquiry.</h3>
              <p>
                For a personal piece or a trade brief, share your product
                interests, quantity and destination. Ask about sizing, samples
                and delivery before confirming an order.
              </p>
              <div className="tt-actions">
                <Link className="tt-button tt-button--quiet" href="/contact/">
                  Personal enquiries <Arrow />
                </Link>
                <Link className="tt-button tt-button--quiet" href="/wholesale/">
                  Wholesale &amp; export <Arrow />
                </Link>
              </div>
              <a className="tt-link" href={`mailto:${verifiedBusiness.email}`}>
                {verifiedBusiness.email} <Arrow />
              </a>
            </article>
          </div>
        </div>
      </section>
    </PlatformShell>
  );
}

const craftDetails = [
  {
    src: "/images/editorial/garment-detail.jpeg",
    alt: "Embroidered neckline panel of the red kurta",
    label: "Kurta neckline",
  },
  {
    src: "/images/editorial/bag-detail.jpeg",
    alt: "Green circular motif and mirror work on an embroidered shoulder bag",
    label: "Shoulder bag front",
  },
  {
    src: "/images/editorial/home-detail.jpeg",
    alt: "Embroidered flower medallions along the border of a wall hanging",
    label: "Wall hanging border",
  },
  {
    src: "/images/editorial/studio-embroidery.jpeg",
    alt: "Floral and geometric embroidery on the yoke of a kurta",
    label: "Kurta yoke",
  },
];

export function ArtisansPage() {
  const data = sectionData.artisans;
  const [skills, ...notes] = data.sections;
  return (
    <PlatformShell>
      <PageHead
        id="artisans-title"
        variant="split"
        crumb="Artisans"
        eyebrow={data.eyebrow}
        title={data.title}
        intro={data.intro}
        figure={
          <Figure
            src={data.image}
            alt={data.imageAlt}
            caption="Round wall hanging, detail"
            sizes={split}
            className="tt-figure--square"
            priority
          />
        }
      >
        <EnquireAction>{data.cta}</EnquireAction>
      </PageHead>

      <section
        className="tt-section tt-section--stone"
        aria-labelledby="skills-title"
      >
        <div className="tt-wrap">
          <div className="tt-section-head tt-section-head--stack">
            <h2 id="skills-title" className="tt-heading tt-heading--small">
              {skills.title}
            </h2>
            <p>{skills.body}</p>
          </div>
          <ul className="tt-details">
            {craftDetails.map((detail) => (
              <li key={detail.src}>
                <Media
                  src={detail.src}
                  alt={detail.alt}
                  sizes="(max-width: 767px) calc((100vw - 44px) / 2), (max-width: 1480px) calc((100vw - 136px) / 4), 336px"
                />
                <span>{detail.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="tt-section" aria-label="Stories and participation">
        <div className="tt-wrap">
          <RuledList items={notes} />
        </div>
      </section>
      <EnquiryForm kind="artisan" />
    </PlatformShell>
  );
}

export function WholesalePage() {
  const data = sectionData.wholesale;
  return (
    <PlatformShell>
      <PageHead
        id="wholesale-title"
        variant="split"
        crumb="Wholesale"
        eyebrow={data.eyebrow}
        title={data.title}
        intro={data.intro}
        figure={
          <Figure
            src={data.image}
            alt={data.imageAlt}
            caption="Embroidered shoulder bag"
            sizes={split}
            position="50% 62%"
            className="tt-figure--compact"
            priority
          />
        }
      >
        <EnquireAction>{data.cta}</EnquireAction>
      </PageHead>

      <section
        className="tt-section tt-section--stone"
        aria-label="How a trade enquiry works"
      >
        <div className="tt-wrap">
          <ol className="tt-steps">
            {data.sections.map((item, index) => (
              <li key={item.title}>
                <span className="tt-steps__mark" aria-hidden="true">
                  {index + 1}
                </span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tt-section" aria-labelledby="browse-title">
        <div className="tt-wrap">
          <div className="tt-section-head">
            <div>
              <p className="tt-eyebrow">Browse first</p>
              <h2 id="browse-title" className="tt-heading">
                Start with the collection.
              </h2>
            </div>
            <Link className="tt-link" href="/shop/">
              Shop &amp; collections <Arrow />
            </Link>
          </div>
          <div className="tt-grid">
            {catalogue.map((item, index) => (
              <ProductCard key={item.slug} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
      <EnquiryForm kind="wholesale" />
    </PlatformShell>
  );
}

export function ImpactPage() {
  const data = sectionData.impact;
  return (
    <PlatformShell>
      <PageHead
        id="impact-title"
        variant="split"
        crumb="Partnerships & impact"
        eyebrow={data.eyebrow}
        title={data.title}
        intro={data.intro}
        figure={
          <figure className="tt-mount">
            <div className="tt-mount__frame">
              <Media
                src={data.image}
                alt={data.imageAlt}
                sizes="(max-width: 767px) 70vw, 420px"
                className="tt-mount__image"
                priority
              />
            </div>
            <figcaption className="tt-caption">
              <span>Rectangular wall hanging</span>
              <span>Thar Textiles archive</span>
            </figcaption>
          </figure>
        }
      >
        <EnquireAction>{data.cta}</EnquireAction>
      </PageHead>

      <section className="tt-section tt-section--stone" aria-label="Approach">
        <div className="tt-wrap">
          <RuledList items={data.sections} />
        </div>
      </section>
      <EnquiryForm kind="partnership" />
    </PlatformShell>
  );
}

export function CollaboratePage() {
  const data = sectionData.collaborate;
  return (
    <PlatformShell>
      <PageHead
        id="collaborate-title"
        variant="split"
        crumb="Collaborate"
        eyebrow={data.eyebrow}
        title={data.title}
        intro={data.intro}
        figure={
          <Figure
            src={data.image}
            alt={data.imageAlt}
            caption="Ochre kurta, embroidered yoke"
            sizes={split}
            position="50% 18%"
            className="tt-figure--landscape"
            priority
          />
        }
      >
        <EnquireAction>{data.cta}</EnquireAction>
      </PageHead>

      <section
        className="tt-section tt-section--stone"
        aria-label="Areas of collaboration"
      >
        <div className="tt-wrap">
          <div className="tt-tiles">
            {data.sections.map((item, index) => (
              <article key={item.title}>
                <p className="tt-kicker">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <EnquiryForm kind="expert" />
    </PlatformShell>
  );
}

const contactTopics = [
  ["A product or collection", "/wholesale/#enquiry"],
  ["Wholesale or export", "/wholesale/#enquiry"],
  ["Community participation", "/artisans/#enquiry"],
  ["A development partnership", "/impact/#enquiry"],
  ["Design or technical expertise", "/collaborate/#enquiry"],
];

export function ContactPage() {
  return (
    <PlatformShell>
      <PageHead
        id="contact-title"
        crumb="Contact"
        eyebrow="Contact & enquiries"
        title={
          <>
            Let’s begin a <em>conversation.</em>
          </>
        }
        intro="For product details, visits, wholesale and collaboration, email or call the team. Choose a topic below to find the right place to begin."
      />
      <section className="tt-section tt-section--flush" aria-label="Contact">
        <div className="tt-wrap tt-contact">
          <div className="tt-contact__reach">
            <h2>Reach the team</h2>
            <a
              className="tt-contact__primary"
              href={`mailto:${verifiedBusiness.email}`}
            >
              {verifiedBusiness.email}
            </a>
            <a
              className="tt-contact__primary"
              href={`tel:+${verifiedBusiness.phoneHref}`}
            >
              {verifiedBusiness.phoneDisplay}
            </a>
            <address>
              <span>{verifiedBusiness.mithiOutlet}</span>
              <span>{verifiedBusiness.secondOutlet}, Sindh</span>
            </address>
          </div>
          <div>
            <h2>What would you like to discuss?</h2>
            <ul className="tt-topics">
              {contactTopics.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>
                    {label}
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <EnquiryForm kind="general" />
    </PlatformShell>
  );
}
