import type { Metadata } from "next";
import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Cash on delivery, delivery fees, bundle discounts, ingredients and more.",
  alternates: { canonical: "/faq" },
};

export default function FAQ() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div className="wrap narrow">
      <header className="page-head">
        <span className="label">faq</span>
        <h1>Questions, answered.</h1>
      </header>
      <div className="faq">
        {site.faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <p style={{ marginTop: "2.5rem" }}>
        Still wondering about something?{" "}
        <a href={whatsappLink("Hello Roots and Muds, I have a question.")} target="_blank" rel="noopener">
          WhatsApp us
        </a>{" "}
        or <Link href="/contact">send a message</Link>.
      </p>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </div>
  );
}
