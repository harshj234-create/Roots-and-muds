"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useCart, useStoreData } from "@/components/providers";
import { Price, Tile, soft } from "@/components/ui";
import { Totals } from "@/components/order-summary";
import { RaMLogo } from "@/components/logo";
import { cartSuggestion, priceCart, productMap, tierProgressMessage } from "@/lib/pricing";

export function CartView() {
  const store = useStoreData();
  const { lines, ready, setQty, remove, editBox, addProduct } = useCart();
  const router = useRouter();
  const products = useMemo(() => productMap(store), [store]);
  const c = useMemo(() => priceCart(lines, store), [lines, store]);
  const suggestion = useMemo(() => cartSuggestion(lines, store), [lines, store]);
  const looseCount = lines.filter((l) => l.type === "product").reduce((s, l) => s + l.qty, 0);
  const tierMsg = looseCount > 0 && c.bundleSavings === 0 ? tierProgressMessage(looseCount, store.pricing) : null;

  if (!ready) return <div style={{ minHeight: "50vh" }} aria-busy="true" />;

  if (!lines.length) {
    return (
      <div className="empty">
        <div className="pebble-mark" aria-hidden="true">
          <RaMLogo />
        </div>
        <h2>Your bag is empty</h2>
        <p className="muted">Start with a single favourite, or build a bundle and save up to {store.pricing.mixAndMatch.tiers.at(-1)?.percent}%.</p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link href="/shop" className="btn btn-primary">
            Shop products
          </Link>
          <Link href="/bundles" className="btn btn-ghost">
            See bundles
          </Link>
        </div>
      </div>
    );
  }

  const thumbFor = (key: string) => {
    const l = lines.find((x) => x.key === key)!;
    if (l.type === "product") return products.get(l.productId);
    if (l.type === "bundle") {
      const b = store.bundles.find((x) => x.id === l.bundleId);
      const id = b?.items?.[0]?.productId ?? l.choices?.[0];
      return id ? products.get(id) : undefined;
    }
    return l.items[0] ? products.get(l.items[0].productId) : undefined;
  };

  return (
    <div className="cart-layout">
      <div>
        <ul className="cart-lines">
          {c.lines.map((pl) => {
            const line = lines.find((l) => l.key === pl.key)!;
            const thumb = thumbFor(pl.key);
            const href = line.type === "product" ? `/products/${products.get(line.productId)?.slug}` : line.type === "bundle" ? `/bundles#${line.bundleId}` : undefined;
            return (
              <li className="cart-line" key={pl.key}>
                <div className="thumb">{thumb && <Tile src={thumb.images[0]} alt="" tint={soft(thumb.color)} sizes="88px" />}</div>
                <div>
                  <h3>{href ? <Link href={href}>{pl.title}</Link> : pl.title}</h3>
                  {line.type === "product" && <p className="contents">{products.get(line.productId)?.size}</p>}
                  {pl.contents && line.type !== "product" && (
                    <p className="contents">{pl.contents.map((x) => `${x.qty > 1 ? `${x.qty} × ` : ""}${x.name}`).join(", ")}</p>
                  )}
                  {pl.giftBox && (
                    <p className="contents">
                      Gift box{pl.giftNote ? `, note: “${pl.giftNote}”` : ""}
                    </p>
                  )}
                  {line.type === "box" && pl.offers && pl.offers.length > 0 && (
                    <p className="contents" style={{ color: "var(--sage-deep)" }}>
                      {pl.offers.map((o) => (o.kind === "bundle" ? `${o.label} price` : o.label)).join(" + ")}
                    </p>
                  )}
                  {pl.problem && <p className="problem">{pl.problem}. Please remove it to continue.</p>}
                  <div className="line-foot">
                    {line.type === "box" ? (
                      <span className="small muted">1 box</span>
                    ) : (
                      <div className="stepper" role="group" aria-label={`${pl.title} quantity`}>
                        <button onClick={() => setQty(pl.key, pl.qty - 1)} disabled={pl.qty <= 1} aria-label="Decrease quantity">
                          −
                        </button>
                        <span aria-live="polite">{pl.qty}</span>
                        <button onClick={() => setQty(pl.key, pl.qty + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                    )}
                    <Price was={pl.type === "product" ? undefined : pl.lineOriginal} now={pl.lineTotal} />
                  </div>
                  <div className="actions" style={{ marginTop: "0.5rem" }}>
                    {line.type === "box" && (
                      <button
                        className="link-btn"
                        onClick={() => {
                          editBox(pl.key);
                          router.push("/bundles#mix-and-match");
                        }}
                      >
                        Edit box
                      </button>
                    )}
                    <button className="link-btn" onClick={() => remove(pl.key)}>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {c.bundleSavings > 0 && (
          <div className="applied" role="status">
            <strong>Bundle savings applied: AED {c.bundleSavings}</strong>
            <ul>
              {c.looseOffers.map((o, i) => (
                <li key={i}>
                  {o.kind === "bundle" ? `${o.label}${o.times && o.times > 1 ? ` × ${o.times}` : ""}` : o.label}: save AED {o.savings}
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestion && (
          <div className="nudge">
            <p>{suggestion.message}.</p>
            <button
              className="btn btn-clay btn-sm"
              onClick={() => suggestion.missing.forEach((m) => addProduct(m.id))}
            >
              Add {suggestion.missing.length === 1 ? "it" : "them"}
            </button>
          </div>
        )}
        {!suggestion && tierMsg && (
          <div className="nudge">
            <p>{tierMsg} on your loose items.</p>
            <Link href="/shop" className="btn btn-quiet btn-sm">
              Keep shopping
            </Link>
          </div>
        )}
      </div>

      <aside className="summary" aria-label="Order summary">
        <h2>Summary</h2>
        <Totals c={c} />
        {c.freeDeliveryGap > 0 && (
          <p className="progress">Add AED {c.freeDeliveryGap} more for free delivery.</p>
        )}
        {c.problems.length > 0 && <p className="form-error">Remove sold-out items to continue.</p>}
        <Link
          href="/checkout"
          className="btn btn-primary btn-block"
          aria-disabled={c.problems.length > 0}
          onClick={(e) => c.problems.length > 0 && e.preventDefault()}
        >
          Continue to checkout
        </Link>
        <p className="small muted" style={{ marginTop: "0.9rem", marginBottom: 0 }}>
          You pay in cash when your order arrives. No card needed.
        </p>
      </aside>
    </div>
  );
}
