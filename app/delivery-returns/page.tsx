import type { Metadata } from "next";
import { site, whatsappLink } from "@/lib/site";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description: "Cash on delivery to all 7 emirates. AED 15 delivery, free from AED 150. Our returns policy for handmade skincare.",
  alternates: { canonical: "/delivery-returns" },
};

export default async function Policy() {
  const { pricing } = await getStore();
  // Keep the fee numbers in step with data/pricing.json
  const fix = (s: string) => s.replace(/AED 15\b/g, `AED ${pricing.delivery.fee}`).replace(/AED 150\b/g, `AED ${pricing.delivery.freeFrom}`);
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>Delivery & returns</h1>
      </header>
      <div className="prose">
        <h2 style={{ marginTop: 0 }}>Delivery</h2>
        <ul>
          {site.policies.delivery.map((p, i) => (
            <li key={i}>{fix(p)}</li>
          ))}
        </ul>
        <h2>Returns and exchanges</h2>
        <ul>
          {site.policies.returns.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <p>
          Questions about an order? Call <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a> or{" "}
          <a href={whatsappLink()} target="_blank" rel="noopener">
            message us on WhatsApp
          </a>
          .
        </p>
      </div>
    </div>
  );
}
