"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ProductCard } from "@/components/cards";
import { useStoreData } from "@/components/providers";
import type { Category } from "@/lib/pricing";

const SORTS = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name: A to Z",
} as const;

export function ShopGrid({ categories }: { categories: Category[] }) {
  const store = useStoreData();
  const params = useSearchParams();
  const router = useRouter();
  const cat = params.get("category") ?? "all";
  const sort = (params.get("sort") ?? "featured") as keyof typeof SORTS;

  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params.toString());
    if ((k === "category" && v === "all") || (k === "sort" && v === "featured")) p.delete(k);
    else p.set(k, v);
    const q = p.toString();
    router.replace(q ? `/shop?${q}` : "/shop", { scroll: false });
  };

  const list = useMemo(() => {
    let l = store.products.filter((p) => cat === "all" || p.category === cat);
    if (sort === "featured") {
      l = [...l].sort((a, b) => Number(b.inStock) - Number(a.inStock) || Number(!!b.bestseller) - Number(!!a.bestseller));
    } else if (sort === "price-asc") l = [...l].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") l = [...l].sort((a, b) => b.price - a.price);
    else l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [store, cat, sort]);

  const current = categories.find((c) => c.id === cat);

  return (
    <>
      <div className="toolbar">
        <div className="tabs" role="group" aria-label="Filter by category">
          <button className="tab" aria-pressed={cat === "all"} onClick={() => set("category", "all")}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} className="tab" aria-pressed={cat === c.id} onClick={() => set("category", c.id)}>
              {c.shortName}
            </button>
          ))}
        </div>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => set("sort", e.target.value)}>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted small" aria-live="polite" style={{ marginTop: "-1rem" }}>
        {list.length} {list.length === 1 ? "product" : "products"}
        {current ? ` in ${current.name}` : ""}
      </p>
      <div className="product-grid four">
        {list.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </>
  );
}
