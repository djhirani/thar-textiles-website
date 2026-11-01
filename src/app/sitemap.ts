import type { MetadataRoute } from "next";
import { verifiedBusiness } from "@/lib/content";
import { catalogue, sectionData } from "@/lib/platform";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "shop",
    ...Object.keys(sectionData),
    "contact",
    ...catalogue.map((item) => `shop/${item.slug}`),
  ];
  return routes.map((route) => ({
    url: `${verifiedBusiness.website}/${route ? `${route}/` : ""}`,
    changeFrequency: "monthly",
    priority: route ? 0.6 : 1,
  }));
}
