export type ProductSource = {
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  note: string;
};

const productRoot = "/images/site-products";

export const products: ProductSource[] = [
  {
    title: "Hand-embroidered kurta",
    category: "Garments",
    image: `${productRoot}/kurta-red.jpeg`,
    imageAlt: "Red hand-embroidered kurta hanging against a pale background",
    note: "Product details and availability to be confirmed.",
  },
  {
    title: "Hand-embroidered kurta",
    category: "Garments",
    image: `${productRoot}/kurta-ochre.jpeg`,
    imageAlt: "Ochre hand-embroidered kurta hanging against a pale background",
    note: "Product details and availability to be confirmed.",
  },
  {
    title: "Embroidered shoulder bag",
    category: "Bags",
    image: `${productRoot}/embroidered-shoulder-bag.jpeg`,
    imageAlt:
      "Rectangular shoulder bag with multicoloured geometric embroidery",
    note: "Product details and availability to be confirmed.",
  },
  {
    title: "Round textile wall hanging",
    category: "Home textiles",
    image: `${productRoot}/round-wall-hanging.jpeg`,
    imageAlt:
      "Round textile wall hanging assembled from colourful embroidered panels",
    note: "Product details and availability to be confirmed.",
  },
];

export const navigation = [
  { label: "New", href: "#new" },
  { label: "Shop", href: "#shop" },
  { label: "Collections", href: "#collection" },
  { label: "Our Craft", href: "#craft" },
  { label: "The Women", href: "#women" },
  { label: "Our Story", href: "#story" },
  { label: "Impact", href: "#impact" },
  { label: "Trade", href: "#trade" },
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
