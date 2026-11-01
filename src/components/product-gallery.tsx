"use client";
import { useState } from "react";
import { TextileImage } from "./textile-image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <TextileImage
          src={images[active].replace(/^.*\/images/, "/images")}
          alt={alt}
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1512px) 46vw, 696px"
          priority
        />
      </div>
      {images.length > 1 && (
        <div
          className="product-gallery__thumbs"
          aria-label="Product photographs"
        >
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
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
