import type { MetadataRoute } from "next";
import { verifiedBusiness } from "@/lib/content";
import { withBasePath } from "@/lib/paths";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: verifiedBusiness.brandName,
    short_name: verifiedBusiness.brandName,
    description: verifiedBusiness.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: withBasePath("/brand/emblem-premium-heritage-216.png"),
        sizes: "216x216",
        type: "image/png",
      },
    ],
  };
}
