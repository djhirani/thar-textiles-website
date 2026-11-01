export type ProductSource = {
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  note: string;
  description: string;
};

import { withBasePath } from "./paths";

const productRoot = withBasePath("/images/site-products");

export function enquiryHref(subject: string) {
  return `mailto:hello@thartextiles.co?subject=${encodeURIComponent(subject)}`;
}

export const products: ProductSource[] = [
  {
    title: "Red embroidered kurta",
    category: "Garments",
    image: `${productRoot}/kurta-red.jpeg`,
    imageAlt: "Red hand-embroidered kurta hanging against a pale background",
    description:
      "A red kurta with a pale embroidered neckline panel and contrasting patterned sleeves.",
    note: "Available by personal enquiry.",
  },
  {
    title: "Ochre embroidered kurta",
    category: "Garments",
    image: `${productRoot}/kurta-ochre.jpeg`,
    imageAlt: "Ochre hand-embroidered kurta hanging against a pale background",
    description:
      "An ochre kurta with a brightly embroidered front panel and long sleeves.",
    note: "Available by personal enquiry.",
  },
  {
    title: "Embroidered shoulder bag",
    category: "Bags",
    image: withBasePath("/images/optimized/embroidered-shoulder-bag-1440.jpeg"),
    imageAlt:
      "Rectangular shoulder bag with multicoloured geometric embroidery",
    description:
      "An embroidered shoulder bag with a circular green centre motif and multicoloured panels.",
    note: "Available by personal enquiry.",
  },
  {
    title: "Round textile wall hanging",
    category: "Home textiles",
    image: `${productRoot}/round-wall-hanging.jpeg`,
    imageAlt:
      "Round textile wall hanging assembled from colourful embroidered panels",
    description:
      "A circular wall piece composed of contrasting embroidered textile panels.",
    note: "Available by personal enquiry.",
  },
];

export const navigation = [
  { label: "Shop", href: "/shop/" },
  { label: "Artisans", href: "/artisans/" },
  { label: "Wholesale", href: "/wholesale/" },
  { label: "Partnerships & impact", href: "/impact/" },
  { label: "Collaborate", href: "/collaborate/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

export const verifiedBusiness = {
  brandName: "Thar Textiles",
  legalName: "Thar Textiles (Private) Limited",
  descriptor: "Handmade Fashion from Tharparkar",
  description:
    "A women-led contemporary fashion and textile brand connecting the handmade embroidery traditions of Tharparkar with modern customers in the UK, Europe, USA, and international markets.",
  website: "https://thartextiles.co",
  websiteDisplay: "thartextiles.co",
  headquarters: "Mithi, Tharparkar District, Sindh, Pakistan",
  mithiOutlet: "Beside Cafe Thar, Bypass Road, Mithi",
  secondOutlet: "Nagarparkar",
  email: "hello@thartextiles.co",
  phoneDisplay: "+92 334 2511485",
  phoneHref: "923342511485",
};
