import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Old Shopify addresses → new pages, so existing links and Google results keep working.
  async redirects() {
    return [
      { source: "/collections/:path*", destination: "/shop", permanent: true },
      { source: "/pages/:page(contact|contact-us)", destination: "/contact", permanent: true },
      { source: "/pages/:page(faq|faqs)", destination: "/faq", permanent: true },
      { source: "/pages/:page(about|about-us|our-story)", destination: "/about", permanent: true },
      { source: "/policies/:policy(shipping-policy|refund-policy)", destination: "/delivery-returns", permanent: true },
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
