"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, useStoreData } from "./providers";
import { CartIcon, CloseIcon, MenuIcon, WhatsAppIcon } from "./icons";
import { RaMLogo } from "./logo";
import { Price, Tile, soft } from "./ui";
import { cartSuggestion, priceCart, productMap } from "@/lib/pricing";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/bundles", label: "Bundles" },
  { href: "/bundles#mix-and-match", label: "Mix & Match" },
  { href: "/#quiz", label: "Quiz" },
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
];

export function Marquee({ items }: { items: string[] }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const row = [...items, ...items];
  return (
    <div className="marquee" role="note" aria-label={items.join(". ")}>
      <div className="track" aria-hidden="true">
        {row.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const path = usePathname();
  const { count, ready, setDrawerOpen, bump } = useCart();
  const [open, setOpen] = useState(false);
  const [bumping, setBumping] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!bump) return;
    setBumping(true);
    const t = setTimeout(() => setBumping(false), 500);
    return () => clearTimeout(t);
  }, [bump]);
  if (path.startsWith("/admin")) return null;
  const onCartPage = path === "/cart" || path === "/checkout";

  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link href="/" className="logo" aria-label="Roots and Muds home">
          <span className="mark" aria-hidden="true">
            <RaMLogo />
          </span>
          <span className="word">
            roots<span className="amp">&amp;</span>muds
          </span>
        </Link>
        <nav className="nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={!n.href.includes("#") && path.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        {onCartPage ? (
          <Link href="/cart" className="cart-link" aria-label={`Cart, ${ready ? count : 0} items`}>
            <CartIcon />
            <span className="cart-label">Bag</span>
            <span className="cart-count" aria-hidden="true">
              {ready ? count : 0}
            </span>
          </Link>
        ) : (
          <button className="cart-link" onClick={() => setDrawerOpen(true)} aria-label={`Open bag, ${ready ? count : 0} items`} aria-haspopup="dialog">
            <CartIcon />
            <span className="cart-label">Bag</span>
            <span className={`cart-count${bumping ? " bump" : ""}`} aria-hidden="true">
              {ready ? count : 0}
            </span>
          </button>
        )}
        <button
          className="icon-btn menu-btn"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="wrap mobile-nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/faq">FAQ</Link>
        </nav>
      )}
    </header>
  );
}

export function CartDrawer() {
  const store = useStoreData();
  const { lines, drawerOpen, setDrawerOpen, setQty, remove, addMany } = useCart();
  const path = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const products = useMemo(() => productMap(store), [store]);
  const c = useMemo(() => priceCart(lines, store), [lines, store]);
  const suggestion = useMemo(() => cartSuggestion(lines, store), [lines, store]);

  useEffect(() => setDrawerOpen(false), [path, setDrawerOpen]);
  const hidden = path === "/cart" || path === "/checkout";
  useEffect(() => {
    if (!drawerOpen || hidden) return;
    lastFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lastFocus.current?.focus?.();
    };
  }, [drawerOpen, setDrawerOpen, hidden]);

  if (!drawerOpen || path === "/cart" || path === "/checkout") return null;
  const free = store.pricing.delivery.freeFrom;
  const pct = Math.min(100, Math.round((c.merchandiseTotal / free) * 100));

  const thumb = (key: string) => {
    const l = lines.find((x) => x.key === key)!;
    const id = l.type === "product" ? l.productId : l.type === "bundle" ? (store.bundles.find((b) => b.id === l.bundleId)?.items?.[0]?.productId ?? l.choices?.[0]) : l.items[0]?.productId;
    return id ? products.get(id) : undefined;
  };

  return (
    <div className="drawer-wrap">
      <button className="scrim" aria-label="Close bag" tabIndex={-1} onClick={() => setDrawerOpen(false)} />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <header>
          <h2 id="drawer-title">Your bag</h2>
          <button ref={closeRef} className="icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Close bag">
            <CloseIcon />
          </button>
        </header>
        <div className="body">
          {!lines.length ? (
            <div className="empty" style={{ paddingBlock: "2.5rem" }}>
              <div className="pebble-mark" aria-hidden="true">
                <RaMLogo />
              </div>
              <p>
                <strong>Nothing here yet.</strong>
              </p>
              <Link href="/shop" className="btn btn-primary" onClick={() => setDrawerOpen(false)}>
                Start shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="free-bar">
                <p>{c.freeDeliveryGap > 0 ? `AED ${c.freeDeliveryGap} away from free delivery` : "You've unlocked free delivery 🎉"}</p>
                <div className="meter" aria-hidden="true">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
              {c.lines.map((pl) => {
                const p = thumb(pl.key);
                const line = lines.find((l) => l.key === pl.key)!;
                return (
                  <div className="d-line" key={pl.key}>
                    {p ? <Tile src={p.images[0]} alt="" tint={soft(p.color)} sizes="64px" /> : <span />}
                    <div>
                      <b>{pl.title}</b>
                      {pl.contents && pl.type !== "product" && <span className="small muted">{pl.contents.reduce((s, x) => s + x.qty, 0)} items</span>}
                      {pl.problem && <span className="problem" style={{ display: "block" }}>{pl.problem}</span>}
                      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: "0.35rem" }}>
                        {line.type !== "box" && (
                          <div className="stepper" role="group" aria-label={`${pl.title} quantity`}>
                            <button onClick={() => (pl.qty <= 1 ? remove(pl.key) : setQty(pl.key, pl.qty - 1))} aria-label={pl.qty <= 1 ? `Remove ${pl.title}` : "Decrease quantity"}>
                              −
                            </button>
                            <span>{pl.qty}</span>
                            <button onClick={() => setQty(pl.key, pl.qty + 1)} aria-label="Increase quantity">
                              +
                            </button>
                          </div>
                        )}
                        {line.type === "box" && (
                          <button className="link-btn small" onClick={() => remove(pl.key)}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <Price was={pl.type === "product" ? undefined : pl.lineOriginal} now={pl.lineTotal} />
                  </div>
                );
              })}
              {c.bundleSavings > 0 && (
                <div className="applied" role="status">
                  <strong>Bundle savings applied: AED {c.bundleSavings}</strong>
                  <span className="small">{c.looseOffers.map((o) => o.label).join(" + ")}</span>
                </div>
              )}
              {suggestion && (
                <div className="nudge">
                  <p>{suggestion.message}.</p>
                  <button className="btn btn-clay btn-sm" onClick={() => addMany(suggestion.missing.map((m) => m.id))}>
                    Add {suggestion.missing.length === 1 ? "it" : "them"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {lines.length > 0 && (
          <footer>
            {c.totalSavings > 0 && (
              <div className="small" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>You're saving</span>
                <strong style={{ color: "var(--pink-ink)" }}>AED {c.totalSavings}</strong>
              </div>
            )}
            <div className="small" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery</span>
              <span>{c.deliveryFee ? `AED ${c.deliveryFee}` : "Free"}</span>
            </div>
            <div className="total">
              <span>Total</span>
              <span>AED {c.total}</span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-block" aria-disabled={c.problems.length > 0} onClick={(e) => c.problems.length > 0 && e.preventDefault()}>
              Checkout, pay cash on delivery
            </Link>
            <Link href="/cart" className="btn btn-ghost btn-block btn-sm">
              View full bag
            </Link>
          </footer>
        )}
      </div>
    </div>
  );
}

export function WhatsAppFloat({ number }: { number: string }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <a
      className="wa-float"
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Roots and Muds, I have a question.")}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}

export function Toast() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast}</span>
    </div>
  );
}
