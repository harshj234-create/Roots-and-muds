import type { Metadata } from "next";
import { Suspense } from "react";
import { getStore } from "@/lib/store";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = {
  title: "Shop natural skincare",
  description: "Handmade soaps, body moisturizers, body oils and lip balms. Vegan, cruelty-free and paraben-free. Cash on delivery in the UAE.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const store = await getStore();
  return (
    <div className="wrap">
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <h1>Shop</h1>
        <p className="lede">Every product is handmade in small batches with natural ingredients. No parabens, no fake scents.</p>
      </header>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <ShopGrid categories={store.categories} />
      </Suspense>
    </div>
  );
}
