import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header, Toast, WhatsAppFloat } from "@/components/chrome";
import { Footer } from "@/components/footer";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";

const youngSerif = localFont({ src: "./fonts/YoungSerif.woff2", weight: "400", variable: "--font-young-serif", display: "swap" });
const figtree = localFont({ src: "./fonts/Figtree.woff2", weight: "300 900", variable: "--font-figtree", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || site.domain),
  title: { default: "Roots and Muds | Handmade natural skincare in the UAE", template: "%s | Roots and Muds" },
  description:
    "Handmade, Ayurvedic-inspired skincare made in the UAE. Vegan, cruelty-free, paraben-free soaps, moisturizers, body oils and lip balms. Cash on delivery across all 7 emirates.",
  openGraph: { type: "website", siteName: "Roots and Muds", locale: "en_AE" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#f7f5ef", width: "device-width", initialScale: 1 };

// Pages are cached and refreshed when the admin page saves changes.
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Roots and Muds",
    url: site.domain,
    telephone: site.phoneE164,
    address: { "@type": "PostalAddress", addressCountry: "AE" },
  };
  return (
    // To add Arabic later: render lang="ar" dir="rtl" for /ar routes (see README). All CSS uses logical properties.
    <html lang={site.locale.lang} dir={site.locale.dir} className={`${youngSerif.variable} ${figtree.variable}`}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Providers store={store}>
          <Header freeFrom={store.pricing.delivery.freeFrom} deliveryFee={store.pricing.delivery.fee} />
          <main id="main">{children}</main>
          <Footer categories={store.categories} />
          <WhatsAppFloat number={site.whatsapp} />
          <Toast />
        </Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </body>
    </html>
  );
}
