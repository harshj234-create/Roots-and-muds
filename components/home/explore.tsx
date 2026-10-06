"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, useStoreData } from "../providers";
import { Tile, soft } from "../ui";
import { AddButton } from "../cards";

export interface Ingredient {
  id: string;
  name: string;
  color: string;
  text: string;
  products: string[];
}

/** Tap an ingredient to see what it does and which products have it. */
export function IngredientExplorer({ ingredients }: { ingredients: Ingredient[] }) {
  const store = useStoreData();
  const [sel, setSel] = useState(ingredients[0].id);
  const ing = ingredients.find((x) => x.id === sel)!;
  const list = ing.products.map((id) => store.products.find((p) => p.id === id)).filter(Boolean);

  return (
    <div className="explorer">
      <div>
        <div className="ing-chips" role="tablist" aria-label="Ingredients">
          {ingredients.map((x) => (
            <button
              key={x.id}
              role="tab"
              id={`ing-${x.id}`}
              aria-selected={sel === x.id}
              aria-controls="ing-panel"
              className="chip"
              onClick={() => setSel(x.id)}
            >
              <span className="dot" style={{ background: x.color }} aria-hidden="true" />
              {x.name}
            </button>
          ))}
        </div>
      </div>
      <div
        id="ing-panel"
        role="tabpanel"
        aria-labelledby={`ing-${ing.id}`}
        className="ing-panel"
        style={{ ["--tint" as string]: soft(ing.color, 0.45) }}
      >
        <span className="mono">
          found in {list.length} {list.length === 1 ? "product" : "products"}
        </span>
        <h3 key={ing.id} style={{ animation: "pop-in .4s var(--ease-pop)" }}>
          {ing.name}
        </h3>
        <p>{ing.text}</p>
        <div className="mini-products" key={`${ing.id}-list`}>
          {list.map((p) => (
            <Link key={p!.id} href={`/products/${p!.slug}`} className="mini">
              <Tile src={p!.images[0]} alt="" tint={soft(p!.color, 0.45)} sizes="132px" />
              <span>
                {p!.name}
                <br />
                <span className="muted" style={{ fontWeight: 500 }}>
                  AED {p!.price}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const KICKER: Record<string, string> = {
  kumkumadi: "Ayurvedic oil",
  saffron: "Kesar",
  sandalwood: "Chandan",
  turmeric: "Haldi",
  rose: "Petals",
  coffee: "Grounds",
  vanilla: "Pod",
  lavender: "Flower",
  aloe: "Gel",
  mango: "Butter",
  "goat-milk": "Milk",
  herbs: "Botanicals",
};

/** Ingredient cards that flip over to show what they do and where to find them. */
export function IngredientFlips({ ingredients }: { ingredients: Ingredient[] }) {
  const store = useStoreData();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="flip-grid">
      {ingredients.map((ing) => {
        const list = ing.products.map((id) => store.products.find((p) => p.id === id)).filter(Boolean);
        const flipped = open === ing.id;
        return (
          <button
            key={ing.id}
            className="flip"
            aria-pressed={flipped}
            aria-label={`${ing.name}: ${flipped ? ing.text : "tap to see what it does"}`}
            onClick={() => setOpen(flipped ? null : ing.id)}
          >
            <span className="flip-inner">
              <span className="flip-face" style={{ ["--tint" as string]: ing.color }}>
                <span className="k">{KICKER[ing.id] ?? "Ingredient"}</span>
                <span className="n">{ing.name}</span>
                <span className="hint">tap to flip →</span>
              </span>
              <span className="flip-face flip-back">
                <span className="k">{ing.name}</span>
                <p>{ing.text}</p>
                <span className="in">In: {list.map((p) => p!.name).join(", ")}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const ROUTINE = [
  { t: "Cleanse", when: "morning + night", cat: "soaps", text: "Lather up with a goat-milk bar on damp skin. Gentle enough for face and body, twice a day.", pick: ["kumkumadi-soap", "aloe-vera-soap", "lavender-soap"] },
  { t: "Smooth", when: "2–3× a week", cat: "soaps", text: "Swap in the Coffee Cream bar. Real robusta coffee buffs away rough, dull bits.", pick: ["coffee-cream-soap"] },
  { t: "Moisturise", when: "straight after your shower", cat: "moisturizers", text: "Massage a body and face cream into slightly damp skin, focusing on elbows, knees and feet.", pick: ["haldi-chandan-moisturizer", "kumkumadi-moisturizer", "coffee-vanilla-moisturizer"] },
  { t: "Oil up", when: "night, or massage day", cat: "oils", text: "Seal it in with a body oil, or treat yourself to a proper massage. Calming oil works on the scalp too.", pick: ["calming-nourishing-oil", "herbal-oil"] },
  { t: "Lips", when: "whenever, honestly", cat: "lip-balms", text: "Morning, before bed and every time the AC wins. Reapply 3–4 times a day for chapped lips.", pick: ["mango-butter-lip-balm", "lip-plump-balm"] },
];

/** A step-by-step shower routine with product picks at each step. */
export function RoutineStepper() {
  const store = useStoreData();
  const [i, setI] = useState(0);
  const s = ROUTINE[i];
  const picks = s.pick.map((id) => store.products.find((p) => p.id === id)).filter((p) => p && p.inStock);
  const { addMany } = useCart();

  return (
    <div>
      <ol className="timeline">
        {ROUTINE.map((r, k) => (
          <li key={r.t}>
            <button aria-current={k === i ? "step" : undefined} onClick={() => setI(k)}>
              <span className="num">{k + 1}</span>
              <span className="t">{r.t}</span>
              <span className="sr-only">{k === i ? "(current step)" : ""}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="step-panel" aria-live="polite">
        <div>
          <span className="when">{s.when}</span>
          <h3>
            {i + 1}. {s.t}
          </h3>
          <p className="muted">{s.text}</p>
          <div className="step-arrows">
            <button className="btn btn-ghost btn-sm" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>
              Previous step
            </button>
            {i < ROUTINE.length - 1 ? (
              <button className="btn btn-primary btn-sm" onClick={() => setI((v) => v + 1)}>
                Next step
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => addMany(ROUTINE.map((r) => store.products.find((p) => p.id === r.pick[0] && p.inStock)?.id).filter(Boolean) as string[])}
              >
                Add the full routine
              </button>
            )}
          </div>
        </div>
        <div className="mini-products" key={s.t}>
          {picks.map((p) => (
            <div key={p!.id} className="mini" style={{ display: "flex", flexDirection: "column" }}>
              <Link href={`/products/${p!.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Tile src={p!.images[0]} alt="" tint={soft(p!.color, 0.45)} sizes="132px" />
                <span>
                  {p!.name}
                  <br />
                  <span className="muted" style={{ fontWeight: 500 }}>
                    AED {p!.price}
                  </span>
                </span>
              </Link>
              <div style={{ padding: "0 0.6rem 0.6rem", marginTop: "auto" }}>
                <AddButton product={p!} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
