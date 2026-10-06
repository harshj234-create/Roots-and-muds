"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Img } from "../ui";
import type { Product } from "@/lib/pricing";

const SPOTS = [
  { x: 2, y: 4, r: -10, w: 36 },
  { x: 60, y: 0, r: 8, w: 33 },
  { x: 66, y: 44, r: -6, w: 28 },
  { x: 0, y: 58, r: 7, w: 34 },
];

/** Product boxes floating over a portrait. Drag them around; tap one to open it. */
export function Collage({ portrait, products }: { portrait: string; products: Product[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => SPOTS.slice(0, products.length).map((s) => ({ x: s.x, y: s.y })));
  const [dragging, setDragging] = useState<number | null>(null);
  const start = useRef({ px: 0, py: 0, x: 0, y: 0, moved: false });

  const onDown = (i: number) => (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, x: pos[i].x, y: pos[i].y, moved: false };
    setDragging(i);
  };
  const onMove = (i: number) => (e: React.PointerEvent) => {
    if (dragging !== i || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const dx = ((e.clientX - start.current.px) / r.width) * 100;
    const dy = ((e.clientY - start.current.py) / r.height) * 100;
    if (Math.abs(dx) + Math.abs(dy) > 1) start.current.moved = true;
    const w = SPOTS[i].w;
    setPos((p) => p.map((q, k) => (k === i ? { x: Math.max(-4, Math.min(100 - w + 4, start.current.x + dx)), y: Math.max(-4, Math.min(70, start.current.y + dy)) } : q)));
  };
  const onUp = () => setDragging(null);

  return (
    <div className="collage" ref={box}>
      <div className="portrait">
        <Img src={portrait} alt="Woman with cream on her face, smiling at the camera" width={736} height={1104} priority sizes="(max-width: 960px) 80vw, 460px" />
      </div>
      {products.map((p, i) => (
        <Link
          key={p.id}
          href={`/products/${p.slug}`}
          className={`float${dragging === i ? " dragging" : ""}`}
          style={{ left: `${pos[i].x}%`, top: `${pos[i].y}%`, width: `${SPOTS[i].w}%`, rotate: `${SPOTS[i].r}deg` }}
          onPointerDown={onDown(i)}
          onPointerMove={onMove(i)}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={(e) => start.current.moved && e.preventDefault()}
          draggable={false}
          aria-label={`${p.name}, AED ${p.price}`}
        >
          <Img src={p.images[1] ?? p.images[0]} alt="" sizes="200px" priority />
        </Link>
      ))}
      <span className="hint">✌︎ psst, drag us around</span>
    </div>
  );
}
