import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { Img } from "@/components/ui";
import { badgeIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Our story",
  description: "Roots and Muds brings the purity of nature into everyday self-care: Ayurvedic, certified organic, cruelty-free skincare with no parabens and no fake scents.",
  alternates: { canonical: "/about" },
};

const IMAGES = site.images as Record<string, string>;

export default function About() {
  return (
    <div className="wrap">
      <header className="page-head">
        <span className="label">our story</span>
        <h1>Pure care, rooted in nature.</h1>
        <p className="lede">{site.brandStory[0]}</p>
      </header>
      <div className="about-rows">
        {site.about.map((row) => (
          <section className="about-row" key={row.title}>
            <div className="photo">
              <Img src={IMAGES[row.image]} alt="" width={736} height={736} sizes="(max-width: 800px) 90vw, 420px" />
            </div>
            <div>
              <h2>{row.title}</h2>
              <p style={{ fontSize: "1.125rem" }}>{row.text}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="section-head">
          <div>
            <span className="label">our promise</span>
            <h2>What we stand for.</h2>
          </div>
        </div>
        <ol className="steps">
          {site.promise.map((p) => (
            <li key={p}>
              <h3>{p}</h3>
            </li>
          ))}
        </ol>
        <ul className="hero-facts" style={{ marginTop: "2rem" }}>
          {site.badges.map((b) => {
            const Icon = badgeIcon[b];
            return (
              <li key={b} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                {Icon && <Icon width={18} height={18} style={{ color: "var(--pink)" }} />}
                {b}
              </li>
            );
          })}
        </ul>
        <div className="hero-actions" style={{ marginTop: "2rem" }}>
          <Link href="/shop" className="btn btn-primary">
            Shop the range
          </Link>
          <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-ghost">
            Join us on Instagram
          </a>
        </div>
      </section>
    </div>
  );
}
