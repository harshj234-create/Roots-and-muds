"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, useStoreData } from "@/components/providers";
import { Price, Tile, soft } from "@/components/ui";
import { bundlesForProduct, type Product } from "@/lib/pricing";

const VIEW_LABELS = ["Box and product", "Front of the box", "Back of the box, with the full label"];

export function ProductDetail({ product }: { product: Product }) {
  const store = useStoreData();
  // Use live catalog values (stock/price may have been changed in admin)
  const p = store.products.find((x) => x.id === product.id) ?? product;
  const { addProduct, addToDraft, addBundle } = useCart();
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const offer = useMemo(() => bundlesForProduct(p.id, store)[0], [p.id, store]);
  const tiers = store.pricing.mixAndMatch.tiers;
  const tint = soft(p.color, 0.5);

  useEffect(() => {
    const el = buyRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="pdp">
      <div>
        <div className="gallery-main">
          <Tile key={img} src={p.images[img]} alt={`${p.name}: ${VIEW_LABELS[img] ?? `view ${img + 1}`}`} tint={tint} priority sizes="(max-width: 900px) 100vw, 55vw" />
        </div>
        {p.images.length > 1 && (
          <div className="thumbs" role="group" aria-label="Product images">
            {p.images.map((src, i) => (
              <button key={src} aria-current={i === img} aria-label={VIEW_LABELS[i] ?? `Image ${i + 1}`} onClick={() => setImg(i)}>
                <Tile src={src} alt="" tint={tint} sizes="78px" />
              </button>
            ))}
          </div>
        )}
        {p.images.length > 2 && (
          <p className="small muted" style={{ marginTop: "0.6rem" }}>
            Tip: the third photo shows the full label from the box.
          </p>
        )}
      </div>

      <div>
        <div className="pdp-tags">
          {p.bestseller && <span className="tag hot">Bestseller</span>}
          {p.vegan ? <span className="tag vegan">100% vegan</span> : p.contains ? <span className="tag">Contains {p.contains}</span> : null}
          <span className="tag">Certified organic</span>
          <span className="tag">Cruelty free</span>
        </div>
        <h1>{p.name}</h1>
        <div className="price-line">
          <Price now={p.price} />
          <span className="size-tag">{p.size}</span>
          {p.benefit && <span className="small muted">· {p.benefit}</span>}
        </div>
        <p className="lede" style={{ fontSize: "1.125rem" }}>
          {p.shortDescription}
        </p>

        {p.inStock ? (
          <>
            <div className="buy-row" ref={buyRef}>
              <div className="stepper" role="group" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                  −
                </button>
                <output aria-live="polite">{qty}</output>
                <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => addProduct(p.id, qty)}>
                Add to cart, AED {p.price * qty}
              </button>
            </div>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => {
                addToDraft(p.id);
                router.push("/bundles#mix-and-match");
              }}
            >
              Add to a Mix &amp; Match bundle
            </button>
            <p className="small muted" style={{ marginTop: "0.6rem" }}>
              Mix any {tiers[0].minItems}+ products and save up to {tiers[tiers.length - 1].percent}%. Pay cash on delivery.
            </p>
          </>
        ) : (
          <p className="form-error" style={{ marginTop: "1.5rem" }}>
            Sold out for now. Message us on WhatsApp and we&apos;ll tell you when it&apos;s back.
          </p>
        )}

        {offer && (
          <div className="offer">
            <p>
              <strong>{offer.bundle.name}</strong>
              {offer.message}.
            </p>
            <div className="row">
              {offer.bundle.items ? (
                <button className="btn btn-clay btn-sm" onClick={() => addBundle(offer.bundle.id)}>
                  Add the bundle, AED {offer.bundle.price}
                </button>
              ) : (
                <Link className="btn btn-clay btn-sm" href={`/bundles#${offer.bundle.slug}`}>
                  Choose your {offer.bundle.name}
                </Link>
              )}
              <span className="save">Save AED {offer.savings}</span>
            </div>
          </div>
        )}

        <div className="facts">
          <details open>
            <summary>The lowdown</summary>
            <div>
              <p>{p.description}</p>
            </div>
          </details>
          <details>
            <summary>Ingredients</summary>
            <div>
              <ul className="ingredients">
                {p.keyIngredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              {p.ingredients && (
                <p className="small">
                  <strong>Full list, as on the box:</strong> {p.ingredients}
                </p>
              )}
              <p className="small muted">
                {p.vegan ? "100% vegan. " : p.contains ? `Contains ${p.contains}, so not vegan. ` : ""}Certified organic, cruelty-free, no parabens and no synthetic fragrance.
                Made in {p.madeIn ?? "India"}. We recommend a patch test before first use.
              </p>
            </div>
          </details>
          <details>
            <summary>How to use</summary>
            <div>
              <p>{p.howToUse}</p>
            </div>
          </details>
          <details>
            <summary>Delivery &amp; payment</summary>
            <div>
              <p>
                Cash on delivery to all 7 emirates. Delivery is AED {store.pricing.delivery.fee}
                {store.pricing.delivery.freeFrom ? `, free from AED ${store.pricing.delivery.freeFrom}` : ""}.{" "}
                <Link href="/delivery-returns">Delivery &amp; returns</Link>
              </p>
            </div>
          </details>
        </div>
      </div>

      {p.inStock && (
        <div className={`sticky-buy${showBar ? " show" : ""}`} aria-hidden={!showBar}>
          <Tile src={p.images[0]} alt="" tint={tint} sizes="48px" />
          <div className="nm">
            <span>{p.name}</span>
            <span className="muted" style={{ fontWeight: 500 }}>
              AED {p.price}
            </span>
          </div>
          <button className="btn btn-primary btn-sm" tabIndex={showBar ? 0 : -1} onClick={() => addProduct(p.id, qty)}>
            Add to cart
          </button>
        </div>
      )}
    </div>
  );
}
