import Link from "next/link";
import { site } from "@/lib/site";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "./icons";

export function Footer({ categories }: { categories: { id: string; name: string }[] }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="footer-big" aria-hidden="true">
          {site.heroTitle}
        </p>
        <div className="footer-grid">
          <div>
            <p style={{ maxWidth: "34ch", color: "#e8ddd5" }}>{site.tagline}</p>
            <p>
              <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>
              <br />
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <div className="socials">
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
            <h2>shop</h2>
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
                <Link href="/bundles#mix-and-match">Mix &amp; Match</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>help</h2>
            <ul>
              <li>
                <Link href="/faq">FAQ</Link>
              </li>
              <li>
                <Link href="/delivery-returns">Delivery &amp; returns</Link>
              </li>
              <li>
                <Link href="/contact">Contact us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>about</h2>
            <ul>
              <li>
                <Link href="/about">Our story</Link>
              </li>
              <li>
                <Link href="/#quiz">Skin quiz</Link>
              </li>
              <li>
                <Link href="/#ingredients">Ingredients</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-base">
          <span>© {new Date().getFullYear()} Roots and Muds LLC. Certified organic, made in India.</span>
          <span>Cash on delivery only. No card needed.</span>
        </div>
      </div>
    </footer>
  );
}
