import localFont from "next/font/local";
import type { Metadata, Viewport } from "next";
import { verifiedBusiness } from "@/lib/content";
import { withBasePath } from "@/lib/paths";
import { directionFor } from "@/lib/i18n";
import "./globals.css";
import "./editorial.css";

// Keep the approved typefaces; preload local files and size-adjust the fallback.
const editorialFont = localFont({
  src: "../../node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2",
  variable: "--font-editorial",
  weight: "100 900",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const readingFont = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-reading",
  weight: "200 800",
  display: "swap",
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(verifiedBusiness.website),
  title: {
    default: `${verifiedBusiness.brandName} | Textile craft from Tharparkar`,
    template: `%s | ${verifiedBusiness.brandName}`,
  },
  description:
    "Explore textile craft from Tharparkar, Sindh, and connect with Thar Textiles about products, wholesale, community work and collaboration.",
  applicationName: verifiedBusiness.brandName,
  authors: [{ name: "Thar Textiles" }],
  alternates: { canonical: "/" },
  keywords: [
    "Thar Textiles",
    "Tharparkar embroidery",
    "handmade textiles",
    "women-led fashion",
    "Sindhi craft",
  ],
  openGraph: {
    title: `${verifiedBusiness.brandName} | Textile craft from Tharparkar`,
    description:
      "Explore textile craft from Tharparkar, Sindh, and connect with Thar Textiles.",
    type: "website",
    url: "/",
    locale: "en_GB",
    siteName: verifiedBusiness.brandName,
    images: [
      {
        url: "/images/site-products/embroidered-shoulder-bag.jpeg",
        width: 1200,
        height: 1600,
        alt: "A colourful hand-embroidered Thar Textiles shoulder bag",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${verifiedBusiness.brandName} | Textile craft from Tharparkar`,
    description:
      "Explore textile craft from Tharparkar, Sindh, and connect with Thar Textiles.",
    images: ["/images/site-products/embroidered-shoulder-bag.jpeg"],
  },
  icons: {
    icon: [
      {
        url: withBasePath("/brand/emblem-premium-heritage-216.png"),
        type: "image/png",
      },
    ],
    apple: [
      {
        url: withBasePath("/brand/emblem-premium-heritage-216.png"),
        type: "image/png",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organisationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: verifiedBusiness.brandName,
    url: verifiedBusiness.website,
    email: verifiedBusiness.email,
    telephone: `+${verifiedBusiness.phoneHref}`,
    description: "Textile craft from Tharparkar, Sindh.",
    logo: `${verifiedBusiness.website}/brand/emblem-premium-heritage-216.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer enquiries",
      email: verifiedBusiness.email,
      telephone: `+${verifiedBusiness.phoneHref}`,
      availableLanguage: ["English"],
    },
  };

  return (
    <html
      lang="en"
      dir={directionFor("en")}
      className={`${editorialFont.variable} ${readingFont.variable}`}
    >
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationSchema).replace(/</g, "\\u003c"),
          }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
