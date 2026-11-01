import { products } from "./content";

export const catalogue = products.map((item, index) => ({
  ...item,
  slug: [
    "red-embroidered-kurta",
    "ochre-embroidered-kurta",
    "embroidered-shoulder-bag",
    "round-textile-wall-hanging",
  ][index],
  gallery: [item.image],
}));

export const collectionCards = [
  {
    title: "Garments",
    image: "/images/site-products/kurta-red.jpeg",
    alt: "Red hand-embroidered kurta",
    copy: "Embroidered pieces for contemporary wardrobes.",
    category: "Garments",
  },
  {
    title: "Bags",
    image: "/images/optimized/embroidered-shoulder-bag-1440.jpeg",
    alt: "Multicoloured embroidered shoulder bag",
    copy: "Textile work to carry every day.",
    category: "Bags",
  },
  {
    title: "Home textiles",
    image: "/images/site-products/round-wall-hanging.jpeg",
    alt: "Round wall hanging made with embroidered panels",
    copy: "Pattern and handwork for the home.",
    category: "Home textiles",
  },
];

export const sectionData = {
  artisans: {
    eyebrow: "People & practice",
    title: "Meet the artisans",
    intro:
      "The skill behind each piece deserves to be seen with care and consent.",
    image: "/images/site-products/editorial-round-wall-hanging.jpeg",
    imageAlt: "Close detail of embroidered textile panels",
    sections: [
      {
        title: "Skills shaped by hand",
        body: "Explore garments, bags and home textiles that show the range of embroidery and textile making represented in the collection.",
      },
      {
        title: "Stories, with permission",
        body: "Individual maker profiles will be published when their stories, photographs and preferred names have been reviewed and approved with them.",
      },
      {
        title: "For local makers",
        body: "Artisans and community groups can contact the Thar Textiles team to introduce their work and discuss opportunities.",
      },
    ],
    cta: "Introduce your work",
    subject: "Artisan participation enquiry",
  },
  wholesale: {
    eyebrow: "For buyers & importers",
    title: "Wholesale & export enquiries",
    intro:
      "Begin a conversation about sourcing, samples, custom work and international trade.",
    image: "/images/optimized/embroidered-shoulder-bag-1440.jpeg",
    imageAlt:
      "Embroidered shoulder bag photographed against a light background",
    sections: [
      {
        title: "Explore the collection",
        body: "Browse the existing garment, bag and home textile photographs. Each item is available for discussion; current stock and terms must be confirmed directly.",
      },
      {
        title: "Share your brief",
        body: "Tell us the product category, intended market, approximate quantity, timeframe and any sampling or customization needs. Unknown details can be discussed later.",
      },
      {
        title: "Confirm the details",
        body: "The team can respond with information it has verified, including specifications and feasible next steps. Prices, minimum orders and lead times are not published until confirmed.",
      },
    ],
    cta: "Start a trade enquiry",
    subject: "Wholesale and export enquiry",
  },
  impact: {
    eyebrow: "Community & evidence",
    title: "Partnerships & impact",
    intro:
      "A place for documented community work, thoughtful collaboration and transparent reporting.",
    image: "/images/site-products/editorial-wall-hanging.jpeg",
    imageAlt: "Detail of a rectangular embroidered wall hanging",
    sections: [
      {
        title: "Community initiatives",
        body: "We are preparing an evidence-led portfolio of activities and partnerships. Project pages will appear when scope, dates, contributors and outcomes are confirmed.",
      },
      {
        title: "Responsible reporting",
        body: "Impact figures will be shown only with their period, method and source. This page currently makes no numerical impact claim.",
      },
      {
        title: "Work with us",
        body: "Development organizations, research teams and cultural partners can introduce a project or ask for supporting documentation.",
      },
    ],
    cta: "Discuss a partnership",
    subject: "Development partnership enquiry",
  },
  collaborate: {
    eyebrow: "Design & knowledge",
    title: "Collaborate with us",
    intro:
      "Shared expertise can help craft knowledge meet new design, quality and market needs.",
    image: "/images/site-products/kurta-ochre.jpeg",
    imageAlt: "Ochre embroidered kurta",
    sections: [
      {
        title: "Design",
        body: "Introduce an idea for a collection, product study or material exploration rooted in respectful collaboration.",
      },
      {
        title: "Skills & quality",
        body: "Researchers, trainers and technical specialists can describe relevant experience and propose a focused activity.",
      },
      {
        title: "Markets & communication",
        body: "Share expertise in product presentation, buyer research, documentation or responsible market development.",
      },
    ],
    cta: "Offer your expertise",
    subject: "Expert collaboration enquiry",
  },
  about: {
    eyebrow: "Women-led · Tharparkar, Pakistan",
    title: "About Thar Textiles",
    intro:
      "A women-led textile enterprise based in Mithi, connecting the embroidery of Tharparkar with contemporary wardrobes and homes.",
    image: "/images/editorial/studio-embroidery.jpeg",
    imageAlt:
      "Floral and geometric embroidery detail from an original Thar Textiles kurta",
    sections: [
      {
        title: "Rooted in a place",
        body: "Based in Mithi, Thar Textiles draws on the textile knowledge of Tharparkar, Sindh. Colour, pattern and detailed handwork give the collection its character.",
      },
      {
        title: "Made for everyday life",
        body: "Explore embroidered garments, shoulder bags and textile wall pieces. Each photograph shows a genuine piece from the Thar Textiles product archive.",
      },
      {
        title: "A conversation comes first",
        body: "Whether you are choosing one piece or discussing a collection, tell us what interests you and where you are based. Details, availability and delivery arrangements are confirmed directly.",
      },
    ],
    cta: "Explore the collection",
    subject: "About Thar Textiles enquiry",
  },
} as const;

export type SectionKey = keyof typeof sectionData;
