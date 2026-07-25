import type { MetadataRoute } from "next";
import { verifiedBusiness } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: verifiedBusiness.website,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
