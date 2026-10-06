import Link from "next/link";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";
import { BundleCard, ProductCard } from "@/components/cards";
import { Img } from "@/components/ui";
import { badgeIcon, CashIcon, WhatsAppIcon } from "@/components/icons";

export default async function Home() {
  const store = await getStore();
  const featured = store.bundles.filter((b) => b.active && b.featured).slice(0, 4);
  const best = store.products.filter((p) => p.bestseller).slice(0, 4);
  const tiers = store.pricing.mixAndMatch.tiers;
  const topTier = tiers[tiers.length - 1];

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>{site.tagline}</h1>
            <p className="lede">{site.supportingLine}</p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary">
                Shop now
              </Link>
              <Link href="/bundles#mix-and-match" className="btn btn-ghost">
                Build your bundle
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <Img src="/images/hero.svg" alt="Handmade Roots and Muds soap, moisturizer and body oil on a clay stone" priority sizes="(max-width: 900px) 380px, 560px" />
            <p className="hero-note">
              <CashIcon />
              Pay cash when it arrives
            </p>
          </div>
        </div>
      </section>

      <section className="badges" aria-label="Our promises">
        <ul className="wrap">
          {site.badges.map((b) => {
            const Icon = badgeIcon[b];
            return (
              <li key={b}>
                {Icon && <Icon />}
                {b}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Shop by category</h2>
            <Link href="/shop">See all {store.products.length} products</Link>
          </div>
          <div className="cat-grid">
            {store.categories.map((c) => {
              const first = store.products.find((p) => p.category === c.id);
              const count = store.products.filter((p) => p.category === c.id).length;
              return (
                <Link key={c.id} href={`/shop?category=${c.id}`} className="cat-tile">
                  <div className="img">{first && <Img src={first.images[0]} alt="" sizes="(max-width: 900px) 50vw, 25vw" />}</div>
                  <h3>{c.name}</h3>
                  <p>
                    {count} products, from AED {Math.min(...store.products.filter((p) => p.category === c.id).map((p) => p.price))}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>Ready-made bundles</h2>
              <p>Rituals we've put together, for less than buying each item.</p>
            </div>
            <Link href="/bundles">See all bundles</Link>
          </div>
          <div className="bundle-grid">
            {featured.map((b) => (
              <BundleCard key={b.id} bundle={b} />
            ))}
          </div>
          <div className="nudge" style={{ marginTop: "2rem", background: "var(--white)" }}>
            <p>
              <strong style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "1.25rem" }}>Prefer to choose your own?</strong>
              <br />
              <span className="muted">
                Pick any {tiers[0].minItems} or more products and save up to {topTier.percent}%
                {store.pricing.mixAndMatch.completeRoutine.enabled && `, plus ${store.pricing.mixAndMatch.completeRoutine.percent}% more for a complete routine`}.
              </span>
            </p>
            <Link href="/bundles#mix-and-match" className="btn btn-clay">
              Build your bundle
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <h2>Bestsellers</h2>
            <Link href="/shop">Shop all</Link>
          </div>
          <div className="product-grid four">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section story">
        <div className="wrap story-grid">
          <div className="story-art">
            <Img src={store.products[0].images[1]} alt="Kumkumadi Soap, our signature handmade bar" sizes="460px" />
          </div>
          <div>
            <h2>Made by hand, the slow way</h2>
            {site.brandStory.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <Link href="/about" className="btn btn-ghost" style={{ marginTop: "0.5rem" }}>
              Read our story
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <h2>How ordering works</h2>
              <p>No card, no account. You pay when your order arrives.</p>
            </div>
          </div>
          <ol className="steps">
            <li>
              <h3>Choose your products</h3>
              <p>Add single products, a ready-made bundle or your own Mix & Match box to your cart.</p>
            </li>
            <li>
              <h3>Place your order</h3>
              <p>Enter your name, mobile number and address. We'll call or WhatsApp you to confirm.</p>
            </li>
            <li>
              <h3>Pay cash on delivery</h3>
              <p>
                Pay the courier in cash when your order arrives, anywhere in the UAE. Delivery is free from AED {store.pricing.delivery.freeFrom}.
              </p>
            </li>
          </ol>
          <div className="nudge" style={{ marginTop: "3rem" }}>
            <p>Questions before you order? We're happy to help you choose.</p>
            <a className="btn btn-wa" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello Roots and Muds, I have a question.")}`} target="_blank" rel="noopener">
              <WhatsAppIcon width={20} height={20} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
