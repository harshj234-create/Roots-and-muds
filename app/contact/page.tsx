import type { Metadata } from "next";
import { site, whatsappLink } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Call or WhatsApp Roots and Muds on ${site.phoneDisplay}, or send us a message.`,
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>Talk to us</h1>
        <p className="lede">Questions about a product, an order or a gift? WhatsApp is quickest. We usually reply within a few hours.</p>
      </header>
      <div className="contact-grid" style={{ paddingBottom: "2rem" }}>
        <ul className="contact-ways">
          <li>
            <strong>WhatsApp</strong>
            <p className="muted">Chat with us directly.</p>
            <a className="btn btn-wa" href={whatsappLink("Hello Roots and Muds, I have a question.")} target="_blank" rel="noopener">
              Message {site.phoneDisplay}
            </a>
          </li>
          <li>
            <strong>Phone</strong>
            <p className="muted">Call us during the day.</p>
            <a className="btn btn-ghost" href={`tel:${site.phoneE164}`}>
              Call {site.phoneDisplay}
            </a>
          </li>
          {site.email && (
            <li>
              <strong>Email</strong>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </li>
          )}
        </ul>
        <div>
          <h2 style={{ fontSize: "var(--step-3)" }}>Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
