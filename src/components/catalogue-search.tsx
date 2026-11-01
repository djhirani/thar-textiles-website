"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { catalogue } from "@/lib/platform";
import { SearchIcon } from "./icons";
import { ProductCard } from "./thar-ui";

export const catalogueCategories = ["All", "Garments", "Bags", "Home textiles"];

export function CatalogueTools({
  query = "",
  category = "All",
  onQuery,
  onCategory,
  disabled = false,
}: {
  query?: string;
  category?: string;
  onQuery?: (value: string) => void;
  onCategory?: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="tt-filters">
      <div
        className="tt-filters__chips"
        role="group"
        aria-label="Filter by category"
      >
        {catalogueCategories.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            disabled={disabled}
            onClick={() => onCategory?.(value)}
          >
            {value}
            <span className="tt-filters__count">
              {value === "All"
                ? catalogue.length
                : catalogue.filter((item) => item.category === value).length}
            </span>
          </button>
        ))}
      </div>
      <label className="tt-search">
        <span className="sr-only">Search the collection</span>
        <SearchIcon className="tt-icon" />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(event) => onQuery?.(event.target.value)}
          placeholder="Search the collection"
        />
      </label>
    </div>
  );
}

export function CatalogueSearch() {
  const [query, setQuery] = useState("");
  const params = useSearchParams();
  const [selectedCategory, setCategory] = useState<string | null>(null);
  const requested = params.get("category");
  const category =
    selectedCategory ??
    (requested && catalogueCategories.includes(requested) ? requested : "All");
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
      <CatalogueTools
        query={query}
        category={category}
        onQuery={setQuery}
        onCategory={setCategory}
      />
      <p className="tt-count" role="status">
        {visible.length} {visible.length === 1 ? "piece" : "pieces"} shown
      </p>
      <div className="tt-grid">
        {visible.map((item) => (
          <ProductCard
            key={item.slug}
            item={item}
            index={catalogue.indexOf(item)}
            priority
          />
        ))}
      </div>
      {visible.length === 0 && (
        <p className="tt-empty">
          No pieces match that search. Try a category or{" "}
          <Link href="/contact/">contact the team</Link>.
        </p>
      )}
    </>
  );
}
