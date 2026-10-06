import Link from "next/link";
import { getStore } from "@/lib/store";
import { site } from "@/lib/site";
import ingredientsFile from "@/data/ingredients.json";
import { BundleCard, ProductCard } from "@/components/cards";
import { Img, Tile } from "@/components/ui";
import { badgeIcon, WhatsAppIcon } from "@/components/icons";
import { Ticker } from "@/components/footer";
import { Collage } from "@/components/home/collage";
import { Quiz } from "@/components/home/quiz";
import { IngredientFlips, RoutineStepper } from "@/components/home/explore";

const COLLAGE = ["kumkumadi-soap", "lip-plump-balm", "coffee-vanilla-moisturizer", "lavender-soap"];
const CAT_LINES: Record<string, string> = {
  soaps: "8 goat-milk bars. Zero harsh stuff.",
  moisturizers: "Glow in a bottle.",
  oils: "Massage-ready blends.",
  "lip-balms": "Soft lips, always.",
};

export default async function Home() {
  const store = await getStore();
  const collage = COLLAGE.map((id) => store.products.find((p) => p.id === id)).filter(Boolean) as typeof store.products;
  const bundles = store.bundles.filter((b) => b.active && b.featured);
  const best = store.products.filter((p) => p.bestseller).slice(0, 4);
  const tiers = [...store.pricing.mixAndMatch.tiers].sort((a, b) => a.minItems - b.minItems);
  const cr = store.pricing.mixAndMatch.completeRoutine;
  const badges = site.badges.slice(0, 4);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="label">Ayurvedic · certified organic</span>
            <h1>
              your skin&apos;s <span className="it">new</span> <span className="hl">soft era</span>
            </h1>
            <p className="lede">
              Ayurvedic soaps, moisturizers, oils and lip balms. No parabens, no fake scents, no stress. <b>Pay cash when it shows up.</b>
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="btn btn-primary">
                Shop the drop →
              </Link>
              <Link href="/bundles#mix-and-match" className="btn btn-ghost">
                Build your box
              </Link>
            </div>
            <ul className="hero-facts" aria-label="Our promises">
              {badges.map((b) => {
                const Icon = badgeIcon[b];
                return (
                  <li key={b}>
                    {Icon && <Icon />}
                    {b}
                  </li>
                );
              })}
            </ul>
          </div>
          {collage.length > 0 && <Collage portrait={site.images.heroBanner} products={collage} />}
        </div>
      </section>

      <Ticker tilt words={["kumkumadi", "sandalwood", "turmeric", "coffee", "lavender", "aloe vera", "mango butter", "saffron"]} />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">Shop by category</span>
              <h2>
                Pick your <span className="it">ritual</span>
              </h2>
            </div>
            <Link href="/shop" className="pill-link">
              All {store.products.length} products →
            </Link>
          </div>
          <div className="cat-grid">
            {store.categories.map((c) => {
              const inCat = store.products.filter((p) => p.category === c.id);
              const hero = inCat.find((p) => p.bestseller) ?? inCat[0];
              return (
                <Link key={c.id} href={`/shop?category=${c.id}`} className="cat-tile">
                  {hero && <Tile src={hero.images[0]} alt="" sizes="(max-width: 900px) 50vw, 300px" />}
                  <div className="txt">
                    <div>
                      <h3>{c.name}</h3>
                      <p>{CAT_LINES[c.id] ?? c.description}</p>
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

      <section className="section" id="quiz" aria-labelledby="quiz-title" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label blush">3 questions · 30 seconds</span>
              <h2 id="quiz-title">
                Not sure where to start? <span className="it">take the skin quiz.</span>
              </h2>
            </div>
          </div>
          <Quiz />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label sand">Bundles</span>
              <h2>
                Better <span className="it">together</span>
              </h2>
              <p>Ready-made rituals that cost less than buying each item. Your wallet says thanks.</p>
            </div>
            <Link href="/bundles" className="pill-link">
              All bundles →
            </Link>
          </div>
          <div className="bundle-grid scroll">
            {bundles.map((b) => (
              <BundleCard key={b.id} bundle={b} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="mm-band">
            <div className="txt">
              <span className="label terra">Mix &amp; Match</span>
              <h2>
                pick any {tiers[0]?.minItems ?? 3}+. <span className="it">pay less</span> on all of them.
              </h2>
              <ul className="tier-cards">
                {tiers.map((t, i) => (
                  <li key={t.minItems}>
                    <small>
                      {t.minItems}
                      {tiers[i + 1] ? `–${tiers[i + 1].minItems - 1}` : "+"} items
                    </small>
                    <b>{t.percent}% off</b>
                  </li>
                ))}
              </ul>
              <p>
                Any soap, cream, oil or balm counts.
                {cr.enabled && ` Add a soap, a moisturizer and an oil for an extra ${cr.percent}% off.`} Our calculator does the maths for you.
              </p>
              <Link href="/bundles#mix-and-match" className="btn">
                Start building →
              </Link>
            </div>
            <div className="photo">
              <Img src={site.images.aboutCrafted} alt="Oil dropping from a glass dropper into an amber bottle" width={736} height={946} sizes="(max-width: 860px) 100vw, 560px" />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">Bestsellers</span>
              <h2>
                Most <span className="it">added to bag</span>
              </h2>
            </div>
            <Link href="/shop" className="pill-link">
              Shop all →
            </Link>
          </div>
          <div className="product-grid four">
            {best.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="ingredients" aria-labelledby="ing-title" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label sand">What&apos;s inside</span>
              <h2 id="ing-title">
                Ingredients, <span className="it">decoded</span>
              </h2>
              <p>Tap a card to flip it. Every ingredient is printed on the box, too.</p>
            </div>
          </div>
          <IngredientFlips ingredients={ingredientsFile.ingredients} />
        </div>
      </section>

      <section className="section" aria-labelledby="routine-title" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label blush">How to use it</span>
              <h2 id="routine-title">
                Your 5-step <span className="it">shower ritual</span>
              </h2>
              <p>Tap through the steps. Each one comes with our picks.</p>
            </div>
          </div>
          <RoutineStepper />
        </div>
      </section>

      <section className="section story" style={{ paddingTop: 0 }}>
        <div className="wrap story-grid">
          <div className="story-art">
            <div className="photo">
              <Img src={site.images.banner2} alt="Woman washing her face with a gentle lather" width={736} height={745} sizes="(max-width: 900px) 90vw, 440px" />
            </div>
            <span className="float-sticker" aria-hidden="true">
              pure care, rooted in nature
            </span>
          </div>
          <div>
            <span className="label">Our story</span>
            <h2>
              Where nature becomes your <span className="it">everyday ritual</span>
            </h2>
            {site.brandStory.slice(0, 2).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <div className="hero-actions">
              <Link href="/about" className="btn btn-primary">
                Read our story
              </Link>
              <a href={site.instagram} target="_blank" rel="noopener" className="btn btn-ghost">
                @rootsandmuds
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-head">
            <div>
              <span className="label">How it works</span>
              <h2>
                No cards. <span className="it">Just cash on delivery.</span>
              </h2>
            </div>
          </div>
          <ol className="steps">
            <li>
              <h3>Fill your bag</h3>
              <p>Single products, a ready-made bundle or your own Mix &amp; Match box.</p>
            </li>
            <li>
              <h3>Place your order</h3>
              <p>Just your name, mobile number and address. We&apos;ll call or WhatsApp you to confirm.</p>
            </li>
            <li>
              <h3>Pay when it arrives</h3>
              <p>
                Cash to the courier, anywhere in the UAE. Delivery is AED {store.pricing.delivery.fee}
                {store.pricing.delivery.freeFrom ? `, free over AED ${store.pricing.delivery.freeFrom}` : ""}.
              </p>
            </li>
          </ol>
          <div className="nudge" style={{ marginTop: "1.75rem" }}>
            <p>Not sure what to pick? Ask us on WhatsApp.</p>
            <a className="btn btn-wa" href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hello Roots and Muds, I have a question.")}`} target="_blank" rel="noopener">
              <WhatsAppIcon width={18} height={18} />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
