"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Tile, soft } from "../ui";
import { AddButton } from "../cards";
import type { Product } from "@/lib/pricing";

/** A deck of product cards: swipe, drag or use the arrows to flick through. */
export function HeroStack({ products }: { products: Product[] }) {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<{ x: number; dx: number } | null>(null);
  const n = products.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);
  const moved = useRef(false);

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    moved.current = false;
    setDrag({ x: e.clientX, dx: 0 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) moved.current = true;
    setDrag({ ...drag, dx });
  };
  const onUp = () => {
    if (!drag) return;
    if (drag.dx < -70) go(1);
    else if (drag.dx > 70) go(-1);
    else if (!moved.current) go(1); // a tap flips to the next card
    setDrag(null);
  };

  const current = products[i];

  return (
    <div
      className="stack"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
    >
      <span className="float-sticker a" aria-hidden="true">
        certified organic ✦
      </span>
      <span className="float-sticker b" aria-hidden="true">
        cash on delivery
      </span>
      <div className="stack-cards">
        {products.map((p, k) => {
          const pos = (k - i + n) % n; // 0 = top card
          if (pos > 3) return null;
          const top = pos === 0;
          const dx = top && drag ? drag.dx : 0;
          const style: React.CSSProperties = {
            ["--tint" as string]: soft(p.color, 0.55),
            zIndex: 10 - pos,
            transform: top
              ? `translateX(${dx}px) rotate(${-2 + dx / 18}deg)`
              : `translate(${pos * -14}px, ${pos * -12}px) rotate(${pos * -4}deg) scale(${1 - pos * 0.05})`,
            transition: drag && top ? "none" : undefined,
            opacity: pos === 3 ? 0 : 1,
          };
          return (
            <div
              key={p.id}
              className="stack-card"
              style={style}
              aria-hidden={!top}
              onPointerDown={top ? onDown : undefined}
              onPointerMove={top ? onMove : undefined}
              onPointerUp={top ? onUp : undefined}
              onPointerCancel={() => setDrag(null)}
            >
              {p.bestseller && <span className="tag">Bestseller</span>}
              <Tile src={p.images[0]} alt={top ? p.name : ""} sizes="(max-width: 960px) 90vw, 440px" priority={k === 0} />
              <div className="info">
                <div>
                  <strong>
                    {top ? (
                      <Link href={`/products/${p.slug}`} style={{ textDecoration: "none" }} tabIndex={top ? 0 : -1}>
                        {p.name}
                      </Link>
                    ) : (
                      p.name
                    )}
                  </strong>
                  <span className="small muted">
                    AED {p.price} · {p.size}
                  </span>
                </div>
                {top && <AddButton product={p} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="stack-nav">
        <button className="icon-btn" onClick={() => go(-1)} aria-label="Previous product">
          ←
        </button>
        <div className="dots" role="group" aria-label="Choose product">
          {products.map((p, k) => (
            <button key={p.id} aria-current={k === i} aria-label={p.name} onClick={() => setI(k)} />
          ))}
        </div>
        <button className="icon-btn" onClick={() => go(1)} aria-label="Next product">
          →
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {current.name}, AED {current.price}
      </p>
    </div>
  );
}
