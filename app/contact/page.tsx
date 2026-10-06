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
        <span className="label">say hi</span>
        <h1>
          Talk to <span className="it">us</span>
        </h1>
        <p className="lede">Questions about a product, an order or a gift? WhatsApp is the quickest way to reach us.</p>
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
              <p className="muted">For anything that needs a longer reply.</p>
              <a className="btn btn-ghost" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
          )}
          <li>
            <strong>Socials</strong>
            <p className="muted">New drops, tips and behind the scenes.</p>
            <div className="socials">
              <a className="btn btn-ghost btn-sm" href={site.instagram} target="_blank" rel="noopener">
                Instagram
              </a>
              <a className="btn btn-ghost btn-sm" href={site.tiktok} target="_blank" rel="noopener">
                TikTok
              </a>
              <a className="btn btn-ghost btn-sm" href={site.facebook} target="_blank" rel="noopener">
                Facebook
              </a>
            </div>
          </li>
        </ul>
        <div>
          <h2 style={{ fontSize: "var(--step-3)" }}>Send a message</h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
