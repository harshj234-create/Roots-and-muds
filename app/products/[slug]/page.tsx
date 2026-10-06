import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore, defaultStore } from "@/lib/store";
import { site } from "@/lib/site";
import { ProductDetail } from "./product-detail";
import { ProductCard } from "@/components/cards";

export const dynamicParams = true;

export function generateStaticParams() {
  return defaultStore.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getStore()).products.find((x) => x.slug === slug);
  if (!p) return { title: "Product not found" };
  return {
    title: `${p.name} (${p.size})`,
    description: `${p.shortDescription} Certified organic and cruelty-free. AED ${p.price}, cash on delivery in the UAE.`,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title: p.name, description: p.shortDescription, images: [p.images[0]] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore();
  const product = store.products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = store.categories.find((c) => c.id === product.category);

  // Frequently bought together: products that share a ready-made bundle, then the same category
  const fromBundles = store.bundles
    .filter((b) => b.active && b.items && b.items.length <= 4 && b.items.some((i) => i.productId === product.id))
    .flatMap((b) => b.items!.map((i) => i.productId));
  const ids = [...new Set([...fromBundles, ...store.products.filter((p) => p.category !== product.category).map((p) => p.id)])]
    .filter((id) => id !== product.id)
    .slice(0, 4);
  const related = ids.map((id) => store.products.find((p) => p.id === id)!).filter(Boolean);

  const base = process.env.SITE_URL || site.domain;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.id,
      image: product.images.map((i) => `${base}${i}`),
      brand: { "@type": "Brand", name: "Roots and Muds" },
      category: category?.name,
      size: product.size,
      offers: {
        "@type": "Offer",
        url: `${base}/products/${product.slug}`,
        priceCurrency: "AED",
        price: product.price,
        availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        acceptedPaymentMethod: "https://schema.org/COD",
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingDestination: { "@type": "DefinedRegion", addressCountry: "AE" },
          shippingRate: { "@type": "MonetaryAmount", value: store.pricing.delivery.fee, currency: "AED" },
        },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Shop", item: `${base}/shop` },
        { "@type": "ListItem", position: 2, name: category?.name, item: `${base}/shop?category=${product.category}` },
        { "@type": "ListItem", position: 3, name: product.name },
      ],
    },
  ];

  return (
    <div className="wrap">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li>
            <Link href="/shop">Shop</Link>
          </li>
          <li>
            <Link href={`/shop?category=${product.category}`}>{category?.name}</Link>
          </li>
          <li aria-current="page">{product.name}</li>
        </ol>
      </nav>
      <ProductDetail product={product} />
      {related.length > 0 && (
        <section aria-labelledby="fbt" style={{ paddingBottom: "2rem" }}>
          <div className="section-head">
            <div>
              <span className="label">pairs well with</span>
              <h2 id="fbt" style={{ fontSize: "var(--step-3)" }}>
                Frequently bought together
              </h2>
            </div>
          </div>
          <div className="product-grid four">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
