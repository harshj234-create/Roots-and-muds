import type { NextConfig } from "next";
import catalog from "./data/products.json";

// Old Shopify product addresses that differ from the new ones
const productRedirects = catalog.products
  .filter((p) => p.legacyHandle && p.legacyHandle !== p.slug)
  .map((p) => ({ source: `/products/${p.legacyHandle}`, destination: `/products/${p.slug}`, permanent: true }));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Product photos currently load from the Shopify CDN (see README: "Saving the photos")
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/s/files/**" },
      { protocol: "https", hostname: "www.rootsandmuds.com", pathname: "/cdn/shop/**" },
    ],
    unoptimized: process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === "1",
  },
  // Old Shopify addresses → new pages, so existing links and Google results keep working.
  async redirects() {
    return [
      ...productRedirects,
      { source: "/collections/:path*", destination: "/shop", permanent: true },
      { source: "/pages/:page(contact|contact-us|contact-information)", destination: "/contact", permanent: true },
      { source: "/pages/:page(faq|faqs)", destination: "/faq", permanent: true },
      { source: "/pages/:page(about|about-us|our-story)", destination: "/about", permanent: true },
      { source: "/policies/:policy(shipping-policy|refund-policy)", destination: "/delivery-returns", permanent: true },
      { source: "/blogs/:path*", destination: "/", permanent: false },
      { source: "/account/:path*", destination: "/", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
