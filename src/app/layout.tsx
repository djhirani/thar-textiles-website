import "@fontsource-variable/fraunces";
import "@fontsource-variable/manrope";
import type { Metadata, Viewport } from "next";
import { verifiedBusiness } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(verifiedBusiness.website),
  title: {
    default: `${verifiedBusiness.brandName} | ${verifiedBusiness.descriptor}`,
    template: `%s | ${verifiedBusiness.brandName}`,
  },
  description: verifiedBusiness.description,
  applicationName: verifiedBusiness.brandName,
  authors: [{ name: "Thar Textiles (Private) Limited" }],
  alternates: { canonical: "/" },
  keywords: [
    "Thar Textiles",
    "Tharparkar embroidery",
    "handmade textiles",
    "women-led fashion",
    "Sindhi craft",
  ],
  openGraph: {
    title: `${verifiedBusiness.brandName} | ${verifiedBusiness.descriptor}`,
    description: verifiedBusiness.description,
    type: "website",
    url: "/",
    locale: "en_GB",
    siteName: verifiedBusiness.brandName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${verifiedBusiness.brandName} | ${verifiedBusiness.descriptor}`,
    description: verifiedBusiness.description,
  },
  icons: {
    icon: [
      { url: "/brand/owner-direction/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand/owner-direction/favicon.svg", type: "image/svg+xml" },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ec",
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
    legalName: verifiedBusiness.legalName,
    url: verifiedBusiness.website,
    email: verifiedBusiness.email,
    description: verifiedBusiness.description,
  };

  return (
    <html lang="en">
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
