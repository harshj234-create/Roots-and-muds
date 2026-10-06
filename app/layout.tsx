import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { CartDrawer, Header, Marquee, Toast, WhatsAppFloat } from "@/components/chrome";
import { Footer } from "@/components/footer";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

const clash = localFont({
  src: [
    { path: "./fonts/ClashDisplay-500.woff2", weight: "500" },
    { path: "./fonts/ClashDisplay-600.woff2", weight: "600" },
    { path: "./fonts/ClashDisplay-700.woff2", weight: "700" },
  ],
  variable: "--font-clash",
  display: "swap",
});
const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-400.woff2", weight: "400" },
    { path: "./fonts/Satoshi-500.woff2", weight: "500" },
    { path: "./fonts/Satoshi-700.woff2", weight: "700" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
const instrument = localFont({ src: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic", variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || site.domain),
  title: { default: "Roots and Muds | Ayurvedic skincare, cash on delivery in the UAE", template: "%s | Roots and Muds" },
  description:
    "Certified organic, cruelty-free Ayurvedic skincare: soaps, moisturizers, body oils and lip balms with no parabens and no fake scents. Build a bundle and pay cash on delivery across the UAE.",
  openGraph: { type: "website", siteName: "Roots and Muds", locale: "en_AE", images: [site.images.heroBanner] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#f7efe3", width: "device-width", initialScale: 1 };

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
    `Free delivery over AED ${freeFrom}`,
    "Pay cash on delivery",
    "Certified organic",
    "Cruelty free",
    "No parabens. No fake scents.",
    `AED ${fee} delivery to all 7 emirates`,
  ];
  return (
    // To add Arabic later: render lang="ar" dir="rtl" for /ar routes (see README). All CSS uses logical properties.
    <html lang={site.locale.lang} dir={site.locale.dir} className={`${clash.variable} ${satoshi.variable} ${instrument.variable}`}>
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
