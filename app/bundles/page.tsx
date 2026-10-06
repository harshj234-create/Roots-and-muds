import type { Metadata } from "next";
import { getStore } from "@/lib/store";
import { BundleCard } from "@/components/cards";
import { Builder } from "./builder";

export const metadata: Metadata = {
  title: "Bundles and Mix & Match",
  description: "Ready-made skincare bundles and a Mix & Match builder: choose any products and save up to 15%, plus 5% for a complete routine.",
  alternates: { canonical: "/bundles" },
};

export default async function BundlesPage() {
  const store = await getStore();
  const bundles = store.bundles.filter((b) => b.active);
  return (
    <div className="builder-page">
      <div className="wrap">
        <header className="page-head">
          <h1>Bundles</h1>
          <p className="lede">Pick one of our ready-made rituals, or build your own box below and watch the savings add up.</p>
        </header>
        <div className="bundle-grid three">
          {bundles.map((b) => (
            <BundleCard key={b.id} bundle={b} />
          ))}
        </div>
      </div>
      <section id="mix-and-match" className="section" aria-labelledby="mm-title">
        <div className="wrap">
          <Builder />
        </div>
      </section>
    </div>
  );
}
