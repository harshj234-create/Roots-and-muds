"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart, useStoreData } from "@/components/providers";
import { Img, Price } from "@/components/ui";
import { bundlesForProduct, type Product } from "@/lib/pricing";

export function ProductDetail({ product }: { product: Product }) {
  const store = useStoreData();
  // Use live catalog values (stock/price may have been changed in admin)
  const p = store.products.find((x) => x.id === product.id) ?? product;
  const { addProduct, addToDraft, addBundle } = useCart();
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const offers = useMemo(() => bundlesForProduct(p.id, store).slice(0, 1), [p.id, store]);
  const tiers = store.pricing.mixAndMatch.tiers;

  return (
    <div className="pdp">
      <div>
        <div className="gallery-main">
          <Img src={p.images[img]} alt={`${p.name}${img ? `, view ${img + 1}` : ""}`} priority sizes="(max-width: 900px) 100vw, 55vw" />
        </div>
        {p.images.length > 1 && (
          <div className="thumbs" role="group" aria-label="Product images">
            {p.images.map((src, i) => (
              <button key={src} aria-current={i === img} aria-label={`Show image ${i + 1}`} onClick={() => setImg(i)}>
                <Img src={src} alt="" sizes="76px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1>{p.name}</h1>
        <div className="price-line">
          <Price now={p.price} />
          <span className="size-tag">{p.size}</span>
        </div>
        <p className="lede" style={{ fontSize: "1.125rem" }}>
          {p.shortDescription}
        </p>

        {p.inStock ? (
          <>
            <div className="buy-row">
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
              Add to a Mix & Match bundle
            </button>
            <p className="small muted" style={{ marginTop: "0.6rem" }}>
              Mix any {tiers[0].minItems}+ products and save up to {tiers[tiers.length - 1].percent}%. Pay cash on delivery.
            </p>
          </>
        ) : (
          <p className="form-error" style={{ marginTop: "1.5rem" }}>
            Sold out for now. Message us on WhatsApp and we'll tell you when the next batch is ready.
          </p>
        )}

        {offers.map((o) => (
          <div className="offer" key={o.bundle.id}>
            <p>
              <strong>{o.bundle.name}</strong>
              {o.message}.
            </p>
            <div className="row">
              {o.bundle.items ? (
                <button className="btn btn-primary btn-sm" onClick={() => addBundle(o.bundle.id)}>
                  Add the bundle, AED {o.bundle.price}
                </button>
              ) : (
                <Link className="btn btn-primary btn-sm" href={`/bundles#${o.bundle.slug}`}>
                  Choose your {o.bundle.name}
                </Link>
              )}
              <span className="save">Save AED {o.savings}</span>
            </div>
          </div>
        ))}

        <div className="facts">
          <details open>
            <summary>Description</summary>
            <div>
              <p>{p.description}</p>
            </div>
          </details>
          <details>
            <summary>Key ingredients</summary>
            <div>
              <ul className="ingredients">
                {p.keyIngredients.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <p className="small muted" style={{ marginTop: "0.9rem" }}>
                Vegan, cruelty-free, paraben-free, with no synthetic fragrance. Patch-test first if you have sensitive skin.
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
            <summary>Delivery & payment</summary>
            <div>
              <p>
                Cash on delivery to all 7 emirates. Delivery is AED {store.pricing.delivery.fee}, free from AED {store.pricing.delivery.freeFrom}.{" "}
                <Link href="/delivery-returns">Delivery & returns</Link>
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
