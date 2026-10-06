"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, useStoreData } from "./providers";
import { Price, Tile, soft } from "./ui";
import { bundleAvailable, bundleOriginal, productMap, type Bundle, type Product } from "@/lib/pricing";

export function AddButton({ product }: { product: Product }) {
  const { addProduct } = useCart();
  const [done, setDone] = useState(false);
  return (
    <button
      className={`add-round${done ? " done" : ""}`}
      onClick={() => {
        addProduct(product.id);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      disabled={!product.inStock}
      aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is sold out`}
    >
      {done ? "✓" : "+"}
    </button>
  );
}

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <article className="card">
      <Link href={`/products/${product.slug}`} className="card-img" tabIndex={-1} aria-hidden="true">
        <Tile
          src={product.images[0]}
          hoverSrc={product.images[1]}
          alt=""
          tint={soft(product.color)}
          priority={priority}
          sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 300px"
        />
      </Link>
      <div className="card-tags">
        {!product.inStock && <span className="tag out">Sold out</span>}
        {product.inStock && product.bestseller && <span className="tag hot">Bestseller</span>}
        {product.vegan && <span className="tag vegan">Vegan</span>}
      </div>
      <h3>
        <Link href={`/products/${product.slug}`}>{product.name}</Link>
      </h3>
      <p className="desc">{product.shortDescription}</p>
      <div className="card-foot">
        <span>
          <Price now={product.price} /> <span className="size-tag">· {product.size}</span>
        </span>
        <AddButton product={product} />
      </div>
    </article>
  );
}

export function BundleCard({ bundle }: { bundle: Bundle }) {
  const store = useStoreData();
  const products = useMemo(() => productMap(store), [store]);
  const { addBundle } = useCart();
  const [choices, setChoices] = useState<string[]>(() =>
    (bundle.slots ?? []).map((s) => store.products.find((p) => p.category === s.category && p.inStock)?.id ?? ""),
  );
  const available = bundleAvailable(bundle, products);
  const original = bundleOriginal(bundle, products, bundle.slots ? choices : undefined);
  const savings = original - bundle.price;
  const fixed = (bundle.items ?? []).map((it) => ({ p: products.get(it.productId)!, qty: it.qty })).filter((x) => x.p);
  const pics = bundle.items ? fixed.map((x) => x.p) : choices.map((id) => products.get(id)!).filter(Boolean);

  return (
    <article className="bundle" id={bundle.slug}>
      <div className="cluster" aria-hidden="true">
        {pics.slice(0, 4).map((p, i) => (
          <Tile key={`${p.id}-${i}`} src={p.images[0]} alt="" tint={soft(p.color, 0.5)} sizes="92px" />
        ))}
        {pics.length > 4 && <span className="more">+{pics.length - 4}</span>}
      </div>
      <h3>{bundle.name}</h3>
      <p className="muted" style={{ margin: 0 }}>
        {bundle.description}
      </p>

      {bundle.items ? (
        fixed.length <= 4 ? (
          <ul className="items">
            {fixed.map(({ p, qty }) => (
              <li key={p.id}>
                <span>
                  {qty > 1 ? `${qty} × ` : ""}
                  <Link href={`/products/${p.slug}`}>{p.name}</Link>
                </span>
                <span>AED {p.price * qty}</span>
              </li>
            ))}
          </ul>
        ) : (
          <details style={{ margin: "0.75rem 0 1.1rem" }}>
            <summary style={{ cursor: "pointer", fontWeight: 600 }}>See all {fixed.length} products</summary>
            <ul className="items" style={{ margin: "0.5rem 0 0" }}>
              {fixed.map(({ p }) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span>AED {p.price}</span>
                </li>
              ))}
            </ul>
          </details>
        )
      ) : (
        <div className="slot-select" style={{ marginTop: "1rem" }}>
          {bundle.slots!.map((slot, i) => (
            <label key={i}>
              {slot.label}
              <select value={choices[i]} onChange={(e) => setChoices((c) => c.map((x, j) => (j === i ? e.target.value : x)))}>
                {store.products
                  .filter((p) => p.category === slot.category)
                  .map((p) => (
                    <option key={p.id} value={p.id} disabled={!p.inStock}>
                      {p.name} (AED {p.price}){p.inStock ? "" : " – sold out"}
                    </option>
                  ))}
              </select>
            </label>
          ))}
        </div>
      )}

      <div className="bundle-price">
        <Price was={original} now={bundle.price} />
        {savings > 0 && <span className="save">Save AED {savings}</span>}
      </div>
      <button className="btn btn-primary btn-block" disabled={!available} onClick={() => addBundle(bundle.id, bundle.slots ? choices : undefined)}>
        {available ? "Add bundle to cart" : "Currently unavailable"}
      </button>
    </article>
  );
}
