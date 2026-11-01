"use client";

import { LinkArrow } from "./link-arrow";
import { useMemo, useState } from "react";
import { TextileImage } from "./textile-image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { catalogue } from "@/lib/platform";

export function CatalogueSearch() {
  const [query, setQuery] = useState("");
  const params = useSearchParams();
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const requested = params.get("category");
  const category =
    selectedCategory ??
    (requested && ["Garments", "Bags", "Home textiles"].includes(requested)
      ? requested
      : "All");
  const visible = useMemo(
    () =>
      catalogue.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          `${item.title} ${item.category}`
            .toLowerCase()
            .includes(query.toLowerCase().trim()),
      ),
    [category, query],
  );
  return (
    <>
      <div className="catalogue-tools">
        <label>
          Search the collection
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try bags, garments or wall hanging"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {["All", "Garments", "Bags", "Home textiles"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="catalogue-count" role="status">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"} shown
      </p>
      <div className="platform-products">
        {visible.map((item) => (
          <article className="platform-product" key={item.slug}>
            <Link href={`/shop/${item.slug}/`}>
              <div className="platform-photo">
                <TextileImage
                  src={
                    item.category === "Bags"
                      ? "/images/editorial/bag-framed.jpeg"
                      : item.image.replace(/^.*\/images/, "/images")
                  }
                  alt={item.imageAlt}
                  sizes="(max-width: 767px) calc((100vw - 54px) / 2), (max-width: 1023px) calc((100vw - 116px) / 2), (max-width: 1512px) calc((100vw - 156px) / 4), 339px"
                />
              </div>
              <div className="platform-product__meta">
                <span>{item.category}</span>
                <span>
                  View piece <LinkArrow />
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>Details and availability by enquiry</p>
            </Link>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <p>
          No pieces match that search. Try a category or{" "}
          <Link href="/contact/">contact the team</Link>.
        </p>
      )}
    </>
  );
}
