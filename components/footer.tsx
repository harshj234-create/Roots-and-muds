import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./icons";
import { RaMLogo } from "./logo";

/** Scrolling band of words. `tilt` gives the slanted sage version; otherwise a flat terracotta band. */
export function Ticker({ words, tilt = false }: { words: string[]; tilt?: boolean }) {
  const row = [...words, ...words, ...words];
  const band = (
    <div className={`ticker${tilt ? "" : " terra"}`} aria-hidden="true">
      <div className="track">
        {row.map((w, i) => (
          <span key={i}>{w}</span>
        ))}
      </div>
    </div>
  );
  return tilt ? <div className="ticker-wrap">{band}</div> : band;
}

export function Footer({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <>
      <Ticker words={["soft life", "glow, no filter", "rooted in ayurveda", "skin first", "pay when it arrives"]} />
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <Link href="/" className="logo" aria-label="Roots and Muds home">
                <span className="mark" aria-hidden="true">
                  <RaMLogo />
                </span>
                <span className="word">
                  roots<span className="amp">&amp;</span>muds
                </span>
              </Link>
              <p style={{ maxWidth: "34ch", color: "hsl(36 30% 80%)" }}>{site.tagline}</p>
              <a className="btn btn-sm" href={whatsappLink("Hello Roots and Muds, I have a question.")} target="_blank" rel="noopener">
                <WhatsAppIcon width={18} height={18} />
                Slide into our DMs
              </a>
              <div className="socials" style={{ marginTop: "1rem" }}>
                <a className="icon-btn" href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a className="icon-btn" href={site.tiktok} target="_blank" rel="noopener" aria-label="TikTok">
                  <TikTokIcon />
                </a>
                <a className="icon-btn" href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              </div>
            </div>
            <div>
              <h2>Shop</h2>
              <ul>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/shop?category=${c.id}`}>{c.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2>Play</h2>
              <ul>
                <li>
                  <Link href="/bundles#mix-and-match">Mix &amp; Match</Link>
                </li>
                <li>
                  <Link href="/bundles">Bundles</Link>
                </li>
                <li>
                  <Link href="/#quiz">Skin quiz</Link>
                </li>
                <li>
                  <Link href="/cart">Your bag</Link>
                </li>
              </ul>
            </div>
            <div>
              <h2>Help</h2>
              <ul>
                <li>
                  <Link href="/faq">FAQ</Link>
                </li>
                <li>
                  <Link href="/delivery-returns">Delivery &amp; returns</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/about">Our story</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-base">
            <span>
              © {new Date().getFullYear()} Roots and Muds LLC · {site.phoneDisplay} · {site.email}
            </span>
            <span>Cash on delivery only. No card needed.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
