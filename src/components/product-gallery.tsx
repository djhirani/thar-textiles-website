"use client";
import { useState } from "react";
import { TextileImage } from "./textile-image";

/** Shows each photograph whole, at its own proportions. */
export function ProductGallery({
  images,
  alt,
  ratio = "3 / 4",
}: {
  images: string[];
  alt: string;
  ratio?: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="tt-gallery">
      <div className="tt-media tt-gallery__main" style={{ aspectRatio: ratio }}>
        <TextileImage
          src={images[active].replace(/^.*\/images/, "/images")}
          alt={alt}
          sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1480px) 50vw, 640px"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="tt-gallery__thumbs" aria-label="Product photographs">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              className="tt-media"
              aria-label={`Show photograph ${index + 1}`}
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <TextileImage
                src={src.replace(/^.*\/images/, "/images")}
                alt=""
                sizes="88px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
