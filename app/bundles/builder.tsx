"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart, useStoreData } from "@/components/providers";
import { Tile, soft } from "@/components/ui";
import { countItems, priceGroup, tierFor, tierProgressMessage, type Counts } from "@/lib/pricing";

export function Builder() {
  const store = useStoreData();
  const { draft, setDraft, saveBox, ready } = useCart();
  const [tab, setTab] = useState("all");
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = document.getElementById("mix-and-match");
    if (!el || !("IntersectionObserver" in window)) return setInView(true);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px -30% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cfg = store.pricing;
  const tiers = [...cfg.mixAndMatch.tiers].sort((a, b) => a.minItems - b.minItems);
  const cr = cfg.mixAndMatch.completeRoutine;

  const counts: Counts = useMemo(() => {
    const c: Counts = {};
    for (const i of draft.items) if (i.qty > 0) c[i.productId] = (c[i.productId] ?? 0) + i.qty;
    return c;
  }, [draft.items]);
  const n = countItems(counts);
  const g = useMemo(() => priceGroup(counts, store), [counts, store]);
  const gift = draft.giftBox && cfg.giftBox.enabled ? cfg.giftBox.price : 0;
  const final = g.final + gift;
  const progress = tierProgressMessage(n, cfg);
  const current = tierFor(n, tiers);

  // Celebrate when a new discount unlocks
  const [party, setParty] = useState<string | null>(null);
  const prev = useRef({ pct: -1, routine: false });
  const pct = current?.percent ?? 0;
  useEffect(() => {
    const was = prev.current;
    prev.current = { pct, routine: g.routineApplied };
    if (was.pct < 0) return; // first render
    let msg: string | null = null;
    if (pct > was.pct) msg = `${pct}% off unlocked! 🎉`;
    else if (g.routineApplied && !was.routine) msg = `Complete Routine: +${cr.percent}% off! ✨`;
    if (!msg) return;
    setParty(msg);
    const t = setTimeout(() => setParty(null), 1800);
    return () => clearTimeout(t);
  }, [pct, g.routineApplied, cr.percent]);
  const maxMin = tiers[tiers.length - 1]?.minItems ?? 1;
  const routineMissing = cr.enabled
    ? cr.requiredCategories.filter((c) => !store.products.some((p) => p.category === c && counts[p.id]))
    : [];
  const withArticle = (id: string) => {
    const word = (store.categories.find((c) => c.id === id)?.shortName ?? id).toLowerCase().replace(/s$/, "");
    return `${/^[aeiou]/.test(word) ? "an" : "a"} ${word}`;
  };

  const setQty = (productId: string, qty: number) =>
    setDraft((d) => {
      if (qty <= 0) return { ...d, items: d.items.filter((i) => i.productId !== productId) };
      const exists = d.items.some((i) => i.productId === productId);
      return {
        ...d,
        items: exists ? d.items.map((i) => (i.productId === productId ? { productId, qty } : i)) : [...d.items, { productId, qty }],
      };
    });

  const hasSomeRoutine = cr.enabled && routineMissing.length > 0 && routineMissing.length < cr.requiredCategories.length;
  const messages = [
    progress ? `${progress}.` : null,
    hasSomeRoutine ? `Add ${routineMissing.map(withArticle).join(" and ")} for an extra ${cr.percent}% Complete Routine discount.` : null,
    !progress && g.routineApplied ? "You've unlocked the top tier and the Complete Routine discount." : null,
    !progress && !hasSomeRoutine && !g.routineApplied && n > 0 ? "You've unlocked the top discount tier." : null,
  ].filter(Boolean);

  const shown = store.products.filter((p) => tab === "all" || p.category === tab);
  const offerText = g.offers.map((o) => (o.kind === "bundle" ? `${o.label} price${o.times && o.times > 1 ? ` ×${o.times}` : ""}` : o.label)).join(" + ");

  return (
    <div className="builder">
      <div>
        <span className="label">mix &amp; match</span>
        <h2 id="mm-title">
          build your <span className="it">dream</span> box
        </h2>
        <p className="lede" style={{ marginBottom: "1.5rem" }}>
          Any products, any quantity. Watch the discounts unlock as you go.
        </p>
        <ul className="tier-list" aria-label="Discount tiers">
          {tiers.map((t, i) => {
            const upTo = tiers[i + 1] ? tiers[i + 1].minItems - 1 : null;
            return (
              <li key={t.minItems} className={current?.minItems === t.minItems ? "on" : ""}>
                {t.minItems}
                {upTo ? `–${upTo}` : "+"} items: {t.percent}% off
              </li>
            );
          })}
          {cr.enabled && (
            <li className={g.routineApplied ? "on" : ""}>
              Soap + moisturizer + oil: extra {cr.percent}%
            </li>
          )}
        </ul>
        <div className="tabs" role="group" aria-label="Show category">
          <button className="tab" aria-pressed={tab === "all"} onClick={() => setTab("all")}>
            All
          </button>
          {store.categories.map((c) => (
            <button key={c.id} className="tab" aria-pressed={tab === c.id} onClick={() => setTab(c.id)}>
              {c.shortName}
            </button>
          ))}
        </div>
        <div className="pick-grid">
          {shown.map((p) => {
            const q = counts[p.id] ?? 0;
            return (
              <div key={p.id} className={`pick${q ? " in" : ""}`} style={{ position: "relative" }}>
                {q > 0 && (
                  <span className="qty-badge" key={q} aria-hidden="true">
                    ×{q}
                  </span>
                )}
                <Tile src={p.images[0]} alt="" tint={soft(p.color, 0.45)} sizes="(max-width: 700px) 45vw, 220px" />
                <div>
                  <div className="name">
                    <Link href={`/products/${p.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {p.name}
                    </Link>
                  </div>
                  <div className="meta">
                    AED {p.price}, {p.size}
                    {!p.inStock && ", sold out"}
                  </div>
                </div>
                <div className="stepper" role="group" aria-label={`${p.name} quantity`}>
                  <button onClick={() => setQty(p.id, q - 1)} disabled={!q} aria-label={`Remove one ${p.name}`}>
                    −
                  </button>
                  <span aria-live="polite">{q}</span>
                  <button onClick={() => setQty(p.id, q + 1)} disabled={!p.inStock || q >= 20} aria-label={`Add one ${p.name}`}>
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className={`summary sticky${open ? " open" : ""}${!inView && n === 0 ? " idle" : ""}`} aria-label="Your box summary">
        <button className="sheet-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span>
            <strong>Your box: {n} {n === 1 ? "item" : "items"}</strong>
            <br />
            <span className="small muted">{open ? "Hide details" : "Show details"}</span>
          </span>
          <span style={{ textAlign: "end" }}>
            {g.savings > 0 && <s className="price-was small">AED {g.original + gift}</s>}
            <strong className="price" style={{ fontSize: "1.25rem" }}>
              AED {final}
            </strong>
          </span>
        </button>

        <div className="sheet-body">
          <h3>{draft.editingKey ? "Editing your box" : "Your box"}</h3>
          {n === 0 ? (
            <p className="muted">Your box is empty. Use the + buttons to add products.</p>
          ) : (
            <ul className="box-items">
              {Object.entries(counts).map(([id, q]) => {
                const p = store.products.find((x) => x.id === id);
                return p ? (
                  <li key={id}>
                    <span>
                      {q} × {p.name}
                    </span>
                    <span className="muted">AED {p.price * q}</span>
                  </li>
                ) : null;
              })}
            </ul>
          )}
          <div className="meter" aria-hidden="true">
            <span style={{ width: `${Math.min(100, (n / maxMin) * 100)}%` }} />
          </div>
          <dl>
            <dt>Items selected</dt>
            <dd>{n}</dd>
            <dt>Original total</dt>
            <dd>AED {g.original}</dd>
            <dt>Discount applied</dt>
            <dd>{offerText || "None yet"}</dd>
            <dt>You save</dt>
            <dd className="saved">AED {g.savings}</dd>
            {gift > 0 && (
              <>
                <dt>{cfg.giftBox.label}</dt>
                <dd>AED {gift}</dd>
              </>
            )}
            <dt className="total-row">Final price</dt>
            <dd className="total-row">AED {final}</dd>
          </dl>
          {cfg.giftBox.enabled && (
            <div style={{ marginBottom: "1rem" }}>
              <label className="check">
                <input type="checkbox" checked={draft.giftBox} onChange={(e) => setDraft((d) => ({ ...d, giftBox: e.target.checked }))} />
                <span>
                  Add a gift box with a handwritten note (+AED {cfg.giftBox.price})
                </span>
              </label>
              {draft.giftBox && (
                <div className="field" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                  <label htmlFor="gift-note">
                    Gift note <span className="hint">(optional, up to 300 characters)</span>
                  </label>
                  <textarea
                    id="gift-note"
                    maxLength={300}
                    value={draft.giftNote}
                    onChange={(e) => setDraft((d) => ({ ...d, giftNote: e.target.value }))}
                    placeholder="Happy birthday! With love…"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <p className="progress" aria-live="polite">
            {messages.join(" ")}
          </p>
        )}

        <button className="btn btn-primary btn-block" disabled={!ready || n === 0} onClick={() => saveBox(draft)}>
          {draft.editingKey ? "Update bundle in cart" : "Add bundle to cart"}
        </button>
        {n > 0 && (
          <p style={{ textAlign: "center", margin: "0.75rem 0 0" }}>
            <button className="link-btn small" onClick={() => setDraft({ items: [], giftBox: false, giftNote: "" })}>
              {draft.editingKey ? "Cancel editing" : "Empty the box"}
            </button>
          </p>
        )}
      </aside>
      {party && (
        <div className="unlock" role="status" aria-live="assertive">
          {Array.from({ length: 18 }).map((_, k) => (
            <i
              key={k}
              aria-hidden="true"
              style={{
                background: ["#a9b47c", "#d3a08d", "#cf9a45", "#b29d9a", "#7f9270"][k % 5],
                ["--x" as string]: `${Math.cos((k / 18) * Math.PI * 2) * (140 + (k % 3) * 60)}px`,
                ["--y" as string]: `${Math.sin((k / 18) * Math.PI * 2) * (110 + (k % 4) * 40)}px`,
                ["--r" as string]: `${k * 40}deg`,
              }}
            />
          ))}
          <span className="msg">{party}</span>
        </div>
      )}
    </div>
  );
}
