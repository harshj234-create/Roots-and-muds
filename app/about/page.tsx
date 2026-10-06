import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Img } from "@/components/ui";
import { badgeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our story",
  description: "Roots and Muds makes handmade, Ayurvedic-inspired skincare in the UAE: vegan, cruelty-free, with no parabens and no fake scents.",
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <div className="wrap">
      <header className="page-head">
        <h1>Skincare we'd give our own families</h1>
      </header>
      <div className="story-grid" style={{ paddingBottom: "var(--section)" }}>
        <div className="prose">
          {site.brandStory.map((p, i) => (
            <p key={i} style={i === 0 ? { fontSize: "1.25rem" } : undefined}>
              {p}
            </p>
          ))}
          <h2>Our promises</h2>
          <ul className="contact-ways" style={{ marginBottom: "2rem" }}>
            {site.badges.map((b) => {
              const Icon = badgeIcon[b];
              return (
                <li key={b} style={{ display: "flex", gap: "0.9rem", alignItems: "center", padding: "1rem 1.25rem" }}>
                  {Icon && <Icon width={28} height={28} style={{ color: "var(--sage-deep)", flex: "none" }} />}
                  <span>{b}</span>
                </li>
              );
            })}
          </ul>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-primary">
              Shop the range
            </Link>
            <Link href="/contact" className="btn btn-ghost">
              Get in touch
            </Link>
          </div>
        </div>
        <div className="story-art" style={{ justifySelf: "center", width: "100%" }}>
          <Img src="/images/hero.svg" alt="Roots and Muds handmade products on a clay stone" sizes="460px" />
        </div>
      </div>
    </div>
  );
}
