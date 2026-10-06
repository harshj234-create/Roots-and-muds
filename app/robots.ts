import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.SITE_URL || site.domain;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/cart", "/checkout", "/order"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
