import type { MetadataRoute } from "next";
import { verifiedBusiness } from "@/lib/content";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: verifiedBusiness.brandName,
    short_name: verifiedBusiness.brandName,
    description: verifiedBusiness.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#f7f3ec",
    icons: [
      {
        src: "/brand/owner-direction/favicon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
