import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./icons";

export function Footer({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Link href="/" className="logo" style={{ marginBottom: "1rem" }}>
              <LogoMark />
              <span>Roots and Muds</span>
            </Link>
            <p className="muted" style={{ maxWidth: "34ch" }}>
              {site.tagline}
            </p>
            <p>
              <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
              <br />
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener">
                WhatsApp us
              </a>
            </p>
          </div>
          <div>
            <h2>Shop</h2>
            <ul>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop?category=${c.id}`}>{c.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/bundles">Bundles</Link>
              </li>
              <li>
                <Link href="/bundles#mix-and-match">Mix & Match</Link>
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
                <Link href="/delivery-returns">Delivery & returns</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>About</h2>
            <ul>
              <li>
                <Link href="/about">Our story</Link>
              </li>
              {site.instagram && (
                <li>
                  <a href={site.instagram} target="_blank" rel="noopener">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Roots and Muds, UAE. Handmade with care.</span>
          <span>Cash on delivery only. No card details needed.</span>
        </div>
      </div>
    </footer>
  );
}
