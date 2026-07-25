import type { MetadataRoute } from "next";
import { verifiedBusiness } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/brand-preview",
        "/final-identity-review",
        "/final-identity-board",
        "/identity-refinement-board",
        "/logo-review-board",
        "/logo-selection",
      ],
    },
    sitemap: `${verifiedBusiness.website}/sitemap.xml`,
    host: verifiedBusiness.website,
  };
}
