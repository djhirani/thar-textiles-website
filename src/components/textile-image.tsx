import Image from "next/image";
import { withBasePath } from "@/lib/paths";
import responsiveImages from "@/lib/responsive-images.json";

/** Static responsive sources; no image server is required on GitHub Pages. */
export function TextileImage({
  src,
  alt,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}) {
  const name =
    src
      .split("/")
      .at(-1)
      ?.replace(/(?:-1440)?\.jpe?g$/, "") || "";
  const variants = responsiveImages[name as keyof typeof responsiveImages];
  return (
    <picture>
      {variants && (
        <source
          media="(max-width: 767px)"
          type="image/avif"
          sizes={sizes}
          srcSet={variants
            .filter((image) => image.width <= 768)
            .map((image) => `${withBasePath(image.avif)} ${image.width}w`)
            .join(", ")}
        />
      )}
      {variants && (
        <source
          type="image/avif"
          sizes={sizes}
          srcSet={variants
            .map((image) => `${withBasePath(image.avif)} ${image.width}w`)
            .join(", ")}
        />
      )}
      {variants && (
        <source
          type="image/webp"
          sizes={sizes}
          srcSet={variants
            .map((image) => `${withBasePath(image.src)} ${image.width}w`)
            .join(", ")}
        />
      )}
      <Image
        src={withBasePath(src)}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        unoptimized
      />
    </picture>
  );
}
