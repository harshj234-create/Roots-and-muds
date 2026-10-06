import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartDrawer, Header, Marquee, Toast, WhatsAppFloat } from "@/components/chrome";
import { Footer } from "@/components/footer";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

const bricolage = localFont({ src: "./fonts/Bricolage.woff2", weight: "200 800", variable: "--font-bricolage", display: "swap" });
const figtree = localFont({ src: "./fonts/Figtree.woff2", weight: "300 900", variable: "--font-figtree", display: "swap" });
const mono = localFont({ src: "./fonts/JetBrainsMono.woff2", weight: "500", variable: "--font-mono-jb", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || site.domain),
  title: { default: "Roots and Muds | Ayurvedic skincare, cash on delivery in the UAE", template: "%s | Roots and Muds" },
  description:
    "Certified organic, cruelty-free Ayurvedic skincare: soaps, moisturizers, body oils and lip balms with no parabens and no fake scents. Build a bundle and pay cash on delivery across the UAE.",
  openGraph: { type: "website", siteName: "Roots and Muds", locale: "en_AE", images: [site.images.heroBanner] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#fffaf3", width: "device-width", initialScale: 1 };

// Pages are cached and refreshed when the admin page saves changes.
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();
  const { fee, freeFrom } = store.pricing.delivery;
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Roots and Muds",
    url: site.domain,
    telephone: site.phoneE164,
    email: site.email,
    sameAs: [site.instagram, site.facebook, site.tiktok],
    address: { "@type": "PostalAddress", addressCountry: "AE" },
  };
  const marquee = [
    "pay cash on delivery",
    `free delivery from AED ${freeFrom}`,
    "certified organic",
    "cruelty free",
    "no parabens, no fake scents",
    "ayurvedic recipes",
    `AED ${fee} delivery to all 7 emirates`,
  ];
  return (
    // To add Arabic later: render lang="ar" dir="rtl" for /ar routes (see README). All CSS uses logical properties.
    <html lang={site.locale.lang} dir={site.locale.dir} className={`${bricolage.variable} ${figtree.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Providers store={store}>
          <Marquee items={marquee} />
          <Header />
          <main id="main">{children}</main>
          <Footer categories={store.categories} />
          <WhatsAppFloat number={site.whatsapp} />
          <CartDrawer />
          <Toast />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}
