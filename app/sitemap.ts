import type { MetadataRoute } from "next";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || site.domain;
  const { products } = await getStore();
  const pages = ["", "/shop", "/bundles", "/about", "/faq", "/contact", "/delivery-returns"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
