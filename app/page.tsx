import Link from "next/link";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";
import ingredientsFile from "@/data/ingredients.json";
import { BundleCard, ProductCard } from "@/components/cards";
import { Img, Tile } from "@/components/ui";
import { badgeIcon, WhatsAppIcon } from "@/components/icons";
import { HeroStack } from "@/components/home/hero-stack";
import { Quiz } from "@/components/home/quiz";
import { IngredientExplorer, RoutineStepper } from "@/components/home/explore";
import { Reels, VideoBand } from "@/components/videos";
import { getClips } from "@/lib/media";

const HERO_PICKS = ["kumkumadi-moisturizer", "saffron-sandal-soap", "lip-plump-balm", "coffee-cream-soap", "calming-nourishing-oil", "aloe-vera-soap"];

export default async function Home() {
  const store = await getStore();
  const stack = HERO_PICKS.map((id) => store.products.find((p) => p.id === id)).filter((p) => p && p.inStock) as typeof store.products;
  const bundles = store.bundles.filter((b) => b.active && b.featured);
  const best = store.products.filter((p) => p.bestseller).slice(0, 4);
  const tiers = store.pricing.mixAndMatch.tiers;
  const top = tiers[tiers.length - 1];
  const cr = store.pricing.mixAndMatch.completeRoutine;
  const clips = getClips();

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="sticker">🌿 Ayurveda, but make it daily</span>
            <h1>
              Feel fresh.
              <br />
              Look <span className="hl">radiant.</span>
            </h1>
            <p className="lede">
              {site.tagline} {site.supportingLine}
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary">
                Shop now
              </Link>
              <Link href="/bundles#mix-and-match" className="btn btn-ghost">
                Build your bundle
              </Link>
            </div>
            <ul className="hero-facts">
              <li>💸 Pay cash on delivery</li>
              <li>🚚 Free delivery from AED {store.pricing.delivery.freeFrom}</li>
              <li>🎁 Bundles from AED {Math.min(...store.bundles.filter((b) => b.active).map((b) => b.price))}</li>
            </ul>
          </div>
          {stack.length > 0 && <HeroStack products={stack} />}
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

      {clips.band && (
        <VideoBand clip={clips.band}>
          <span className="label">rooted in ayurveda</span>
          <h2>Real ingredients. Slow rituals.</h2>
          <p>Saffron, sandalwood, turmeric and herbs, infused slowly into every bar, cream and oil. Certified organic, cruelty-free, and nothing fake.</p>
          <div className="hero-actions">
            <Link href="/#ingredients" className="btn btn-primary">
              See what&apos;s inside
            </Link>
            <Link href="/about" className="btn btn-ghost">
              Our story
            </Link>
          </div>
        </VideoBand>
      )}

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">the lineup</span>
              <h2>Shop by category</h2>
            </div>
            <Link href="/shop">See all {store.products.length} products</Link>
          </div>
          <div className="cat-grid">
            {store.categories.map((c) => {
              const inCat = store.products.filter((p) => p.category === c.id);
              const hero = inCat.find((p) => p.bestseller) ?? inCat[0];
              return (
                <Link key={c.id} href={`/shop?category=${c.id}`} className="cat-tile" style={{ ["--tint" as string]: c.color }}>
                  {hero && <Tile src={hero.images[0]} alt="" sizes="(max-width: 900px) 50vw, 300px" />}
                  <div className="txt">
                    <div>
                      <h3>{c.name}</h3>
                      <p>
                        {inCat.length} products, from AED {Math.min(...inCat.map((p) => p.price))}
                      </p>
                    </div>
                    <span className="arrow-dot" aria-hidden="true">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section quiz-band" id="quiz" aria-labelledby="quiz-title">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">30-second skin quiz</span>
              <h2 id="quiz-title">Find your ritual in three taps.</h2>
              <p>Tell us about your skin and we'll build a soap, moisturizer and oil routine, with the bundle discount already worked out.</p>
            </div>
          </div>
          <Quiz />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">fan faves</span>
              <h2>Bestsellers</h2>
            </div>
            <Link href="/shop">Shop all</Link>
          </div>
          <div className="product-grid four">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {clips.reels.length > 0 && (
        <section className="section" aria-labelledby="reels-title" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <div>
                <span className="label">watch &amp; glow</span>
                <h2 id="reels-title">Little rituals, on loop.</h2>
                <p>A peek at the lather, the textures and the ingredients. Swipe through, and tap any clip to pause.</p>
              </div>
              <a href={site.instagram} target="_blank" rel="noopener">
                More on Instagram
              </a>
            </div>
            <Reels clips={clips.reels} />
          </div>
        </section>
      )}

      <section className="section" id="ingredients" aria-labelledby="ing-title" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">what's inside</span>
              <h2 id="ing-title">Tap an ingredient.</h2>
              <p>Every ingredient is listed on the box. Here's what the hero ones do, and where to find them.</p>
            </div>
          </div>
          <IngredientExplorer ingredients={ingredientsFile.ingredients} />
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-2)", borderBlock: "var(--border)" }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">save more</span>
              <h2>Bundle up, save more.</h2>
              <p>Ready-made rituals for less than buying each item separately.</p>
            </div>
            <Link href="/bundles">See all bundles</Link>
          </div>
          <div className="bundle-grid scroll">
            {bundles.map((b) => (
              <BundleCard key={b.id} bundle={b} />
            ))}
          </div>
          <div
            className="nudge"
            style={{ marginTop: "1.5rem", background: "var(--lime)", border: "var(--border)", boxShadow: "var(--shadow)", padding: "1.25rem 1.5rem" }}
          >
            <p>
              <strong style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "-0.03em", display: "block" }}>
                Rather pick your own?
              </strong>
              <span style={{ fontWeight: 500 }}>
                Mix any {tiers[0].minItems}+ products and save up to {top.percent}%{cr.enabled && `, plus an extra ${cr.percent}% for a soap + moisturizer + oil combo`}.
              </span>
            </p>
            <Link href="/bundles#mix-and-match" className="btn btn-ghost">
              Build your bundle
            </Link>
          </div>
        </div>
      </section>

      <section className="section routine-band" aria-labelledby="routine-title" style={{ borderTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">how to use it</span>
              <h2 id="routine-title">Your 5-step shower ritual.</h2>
              <p>Tap through the steps. Each one comes with our picks.</p>
            </div>
          </div>
          <RoutineStepper />
        </div>
      </section>

      <section className="section story">
        <div className="wrap story-grid">
          <div className="story-art">
            <div className="photo">
              <Img src={site.images.heroBanner} alt="Woman applying moisturizer to her face" width={736} height={1104} sizes="(max-width: 900px) 90vw, 460px" />
            </div>
            <span className="float-sticker" aria-hidden="true">
              pure care, rooted in nature
            </span>
          </div>
          <div>
            <span className="label">our story</span>
            <h2>Where nature becomes your everyday ritual.</h2>
            {site.brandStory.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="hero-actions">
              <Link href="/about" className="btn btn-primary">
                Read our story
              </Link>
              <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-ghost">
                Follow @rootsandmuds
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">cash on delivery</span>
              <h2>How ordering works.</h2>
              <p>No card. No account. You pay when it arrives.</p>
            </div>
          </div>
          <ol className="steps">
            <li>
              <h3>Fill your cart</h3>
              <p>Single products, a ready-made bundle or your own Mix &amp; Match box.</p>
            </li>
            <li>
              <h3>Place your order</h3>
              <p>Just your name, mobile number and address. We'll call or WhatsApp you to confirm.</p>
            </li>
            <li>
              <h3>Pay cash on delivery</h3>
              <p>Pay the courier when it arrives, anywhere in the UAE. Free delivery from AED {store.pricing.delivery.freeFrom}.</p>
            </li>
          </ol>
          <div className="nudge" style={{ marginTop: "2rem" }}>
            <p>Not sure what to pick? Ask us on WhatsApp.</p>
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
