"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, useStoreData } from "../providers";
import { Tile, soft } from "../ui";
import { priceGroup, type Product } from "@/lib/pricing";

type Opt = { id: string; emo: string; label: string; sub: string };
const STEPS: { key: "skin" | "goal" | "scent"; q: string; opts: Opt[] }[] = [
  {
    key: "skin",
    q: "How's your skin, honestly?",
    opts: [
      { id: "dry", emo: "🌵", label: "Dry", sub: "Feels tight or flaky" },
      { id: "sensitive", emo: "🌸", label: "Sensitive", sub: "Reacts to everything" },
      { id: "normal", emo: "🌿", label: "Balanced", sub: "Pretty chill most days" },
      { id: "oily", emo: "✨", label: "Oily", sub: "Shiny by lunchtime" },
    ],
  },
  {
    key: "goal",
    q: "What do you want most?",
    opts: [
      { id: "glow", emo: "🌟", label: "Glow", sub: "Bright, radiant skin" },
      { id: "hydrate", emo: "💧", label: "Hydration", sub: "Soft and plump" },
      { id: "gentle", emo: "🫧", label: "Gentle care", sub: "No drama, no sting" },
      { id: "exfoliate", emo: "☕", label: "Smooth skin", sub: "Buff away the rough bits" },
      { id: "calm", emo: "🌙", label: "Calm vibes", sub: "Wind down after a long day" },
    ],
  },
  {
    key: "scent",
    q: "Pick a scent vibe.",
    opts: [
      { id: "warm", emo: "🔥", label: "Warm & golden", sub: "Saffron, sandalwood, turmeric" },
      { id: "cozy", emo: "🧁", label: "Cozy", sub: "Coffee and vanilla" },
      { id: "fresh", emo: "🍃", label: "Fresh & green", sub: "Aloe, herbs, tea tree" },
      { id: "floral", emo: "💐", label: "Floral", sub: "Lavender, dahlia, rose" },
      { id: "any", emo: "🎲", label: "Surprise me", sub: "I'm open to anything" },
    ],
  },
];

const ROUTINE = ["soaps", "moisturizers", "oils"];

function pick(products: Product[], category: string, a: Record<string, string>) {
  const score = (p: Product) =>
    (p.skinTypes?.includes(a.skin) ? 3 : 0) + (p.goals?.includes(a.goal) ? 4 : 0) + (a.scent !== "any" && p.scent === a.scent ? 2 : 0) + (p.bestseller ? 0.5 : 0);
  return products
    .filter((p) => p.category === category && p.inStock)
    .sort((x, y) => score(y) - score(x))[0];
}

function why(p: Product, a: Record<string, string>) {
  const r: string[] = [];
  if (p.skinTypes?.includes(a.skin)) r.push(`${STEPS[0].opts.find((o) => o.id === a.skin)?.label.toLowerCase()} skin`);
  if (p.goals?.includes(a.goal)) r.push(STEPS[1].opts.find((o) => o.id === a.goal)!.label.toLowerCase());
  if (a.scent !== "any" && p.scent === a.scent) r.push(`${STEPS[2].opts.find((o) => o.id === a.scent)!.label.toLowerCase()} scent`);
  return r.length ? `Good for ${r.join(", ")}` : "Completes your routine";
}

export function Quiz() {
  const store = useStoreData();
  const { addMany } = useCart();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Record<string, string>>({});
  const [lip, setLip] = useState(true);
  const done = step >= STEPS.length;

  const ritual = useMemo(() => {
    if (!done) return [];
    const items = ROUTINE.map((c) => pick(store.products, c, a)).filter(Boolean) as Product[];
    if (lip) {
      const balm = store.products.find((p) => p.id === (a.goal === "glow" ? "lip-plump-balm" : "mango-butter-lip-balm") && p.inStock) ?? pick(store.products, "lip-balms", a);
      if (balm) items.push(balm);
    }
    return items;
  }, [done, a, lip, store.products]);

  const price = useMemo(() => {
    const counts: Record<string, number> = {};
    ritual.forEach((p) => (counts[p.id] = (counts[p.id] ?? 0) + 1));
    return priceGroup(counts, store);
  }, [ritual, store]);

  const choose = (key: string, id: string) => {
    setA((x) => ({ ...x, [key]: id }));
    setTimeout(() => setStep((s) => s + 1), 220);
  };

  return (
    <div className="quiz">
      <div className="quiz-top">
        <span className="mono">{done ? "your ritual" : `step ${step + 1} of ${STEPS.length}`}</span>
        <div className="quiz-bar" aria-hidden="true">
          <span style={{ width: `${(Math.min(step, STEPS.length) / STEPS.length) * 100}%` }} />
        </div>
        {(step > 0 || done) && (
          <button className="link-btn small" onClick={() => (done ? (setStep(0), setA({})) : setStep((s) => s - 1))}>
            {done ? "Start over" : "Back"}
          </button>
        )}
      </div>
      <div className="quiz-body" aria-live="polite">
        {!done ? (
          <>
            <h3 id="quiz-q">{STEPS[step].q}</h3>
            <div className="quiz-options" role="radiogroup" aria-labelledby="quiz-q">
              {STEPS[step].opts.map((o) => (
                <button
                  key={o.id}
                  className="quiz-opt"
                  role="radio"
                  aria-checked={a[STEPS[step].key] === o.id}
                  onClick={() => choose(STEPS[step].key, o.id)}
                >
                  <span className="emo" aria-hidden="true">
                    {o.emo}
                  </span>
                  <span>
                    {o.label}
                    <small>{o.sub}</small>
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="ritual">
            <div>
              <h3>Your ritual is ready ✨</h3>
              <div className="ritual-items">
                {ritual.map((p) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="ritual-item">
                    <Tile src={p.images[0]} alt="" tint={soft(p.color, 0.5)} sizes="180px" />
                    <div>
                      <b>{p.name}</b>
                      <span className="small muted">{why(p, a)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="summary" style={{ boxShadow: "none" }}>
              <dl>
                <dt>{ritual.length} products</dt>
                <dd>AED {price.original}</dd>
                {price.savings > 0 && (
                  <>
                    <dt>{price.offers.map((o) => (o.kind === "bundle" ? o.label : "Bundle discount")).join(" + ")}</dt>
                    <dd className="saved">−AED {price.savings}</dd>
                  </>
                )}
                <dt className="total-row">Your price</dt>
                <dd className="total-row">AED {price.final}</dd>
              </dl>
              <label className="check" style={{ marginBottom: "1rem" }}>
                <input type="checkbox" checked={lip} onChange={(e) => setLip(e.target.checked)} />
                <span>Add a lip balm too</span>
              </label>
              <button className="btn btn-primary btn-block" onClick={() => addMany(ritual.map((p) => p.id))}>
                Add my ritual, AED {price.final}
              </button>
              <p className="small muted" style={{ margin: "0.75rem 0 0" }}>
                The bundle saving is applied automatically in your cart.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
