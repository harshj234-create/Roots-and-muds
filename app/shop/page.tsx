import type { Metadata } from "next";
import { Suspense } from "react";
import { getStore } from "@/lib/store";
import { ShopGrid } from "./shop-grid";

export const metadata: Metadata = {
  title: "Shop natural skincare",
  description: "Ayurvedic soaps, body moisturizers, body oils and lip balms. Certified organic, cruelty-free and paraben-free. Cash on delivery in the UAE.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const store = await getStore();
  return (
    <div className="wrap">
      <header className="page-head" style={{ paddingBottom: 0 }}>
        <span className="label">all {store.products.length} products</span>
        <h1>Shop the lineup.</h1>
        <p className="lede">Ayurvedic recipes, certified organic, with no parabens and no fake scents.</p>
      </header>
      <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
        <ShopGrid categories={store.categories} />
      </Suspense>
    </div>
  );
}
