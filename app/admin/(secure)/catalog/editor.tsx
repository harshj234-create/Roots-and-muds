"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bundleOriginal, productMap, type Bundle, type Product, type Store } from "@/lib/pricing";
import { resetCatalog, saveCatalog } from "../../actions";

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item";
const num = (v: string) => (v === "" ? 0 : Number(v));

export function CatalogEditor({ initial, customised }: { initial: Store; customised: boolean }) {
  const [store, setStore] = useState<Store>(initial);
  const [msg, setMsg] = useState<{ ok?: string; error?: string }>({});
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const products = productMap(store);

  const update = (fn: (s: Store) => Store) => {
    setStore((s) => fn(structuredClone(s)));
    setDirty(true);
    setMsg({});
  };
  const setP = (i: number, patch: Partial<Product>) => update((s) => ((s.products[i] = { ...s.products[i], ...patch }), s));
  const setB = (i: number, patch: Partial<Bundle>) => update((s) => ((s.bundles[i] = { ...s.bundles[i], ...patch }), s));

  const save = () =>
    start(async () => {
      const r = await saveCatalog(store);
      if (r?.error) setMsg({ error: r.error });
      else {
        setMsg({ ok: "Saved. The shop now shows your changes." });
        setDirty(false);
        router.refresh();
      }
    });

  const reset = () => {
    if (!confirm("Undo all changes made here and go back to the data files? This can't be undone.")) return;
    start(async () => {
      await resetCatalog();
      location.reload();
    });
  };

  const addProduct = () =>
    update((s) => {
      let id = "new-product";
      for (let n = 2; s.products.some((p) => p.id === id); n++) id = `new-product-${n}`;
      s.products.push({
        id,
        slug: id,
        name: "New product",
        category: s.categories[0].id,
        price: 25,
        size: "100 g",
        shortDescription: "",
        description: "",
        keyIngredients: [],
        howToUse: "",
        images: ["/images/products/kumkumadi-soap-1.svg"],
        inStock: false,
        bestseller: false,
      });
      return s;
    });

  const addBundle = () =>
    update((s) => {
      let id = "new-bundle";
      for (let n = 2; s.bundles.some((b) => b.id === id); n++) id = `new-bundle-${n}`;
      s.bundles.push({ id, slug: id, name: "New bundle", description: "", items: [], price: 0, active: false, featured: false });
      return s;
    });

  const tiers = store.pricing.mixAndMatch.tiers;

  return (
    <>
      <div className="section-head" style={{ position: "sticky", top: 0, zIndex: 5, background: "var(--paper)", padding: "0.75rem 0", margin: 0 }}>
        <div>
          <h1 style={{ fontSize: "var(--step-4)", margin: 0 }}>Products, bundles & prices</h1>
          <p className="small">
            {msg.error ? <span className="err" style={{ color: "var(--danger)" }}>{msg.error}</span> : msg.ok ? <span className="saved-msg">{msg.ok}</span> : dirty ? "You have unsaved changes." : "Edit anything below, then save."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {customised && (
            <button className="btn btn-quiet btn-sm" onClick={reset} disabled={pending}>
              Reset to data files
            </button>
          )}
          <button className="btn btn-primary" onClick={save} disabled={pending || !dirty}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <section style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "var(--step-3)" }}>Products</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price (AED)</th>
                <th>Size</th>
                <th>In stock</th>
                <th>Bestseller</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((p, i) => (
                <tr key={p.id}>
                  <td style={{ minWidth: 260 }}>
                    <input aria-label="Name" value={p.name} onChange={(e) => setP(i, { name: e.target.value })} />
                    <details style={{ marginTop: "0.4rem" }}>
                      <summary className="small" style={{ cursor: "pointer" }}>
                        Text, ingredients & images
                      </summary>
                      <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem", minWidth: 420 }}>
                        <label className="small">
                          Short description
                          <input value={p.shortDescription} onChange={(e) => setP(i, { shortDescription: e.target.value })} />
                        </label>
                        <label className="small">
                          Full description
                          <textarea value={p.description} onChange={(e) => setP(i, { description: e.target.value })} />
                        </label>
                        <label className="small">
                          Key ingredients (comma separated)
                          <input value={p.keyIngredients.join(", ")} onChange={(e) => setP(i, { keyIngredients: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} />
                        </label>
                        <label className="small">
                          How to use
                          <textarea value={p.howToUse} onChange={(e) => setP(i, { howToUse: e.target.value })} />
                        </label>
                        <label className="small">
                          Image paths, one per line (e.g. /images/products/{p.id}-1.jpg)
                          <textarea value={p.images.join("\n")} onChange={(e) => setP(i, { images: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} />
                        </label>
                        <span className="small muted">Web address: /products/{p.slug}</span>
                      </div>
                    </details>
                  </td>
                  <td>
                    <select aria-label="Category" value={p.category} onChange={(e) => setP(i, { category: e.target.value })}>
                      {store.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input aria-label="Price" type="number" min={0} step={1} value={p.price} onChange={(e) => setP(i, { price: num(e.target.value) })} style={{ width: 90 }} />
                  </td>
                  <td>
                    <input aria-label="Size" value={p.size} onChange={(e) => setP(i, { size: e.target.value })} style={{ width: 90 }} />
                  </td>
                  <td>
                    <input aria-label="In stock" type="checkbox" checked={p.inStock} onChange={(e) => setP(i, { inStock: e.target.checked })} style={{ width: 22, minHeight: 22 }} />
                  </td>
                  <td>
                    <input aria-label="Bestseller" type="checkbox" checked={!!p.bestseller} onChange={(e) => setP(i, { bestseller: e.target.checked })} style={{ width: 22, minHeight: 22 }} />
                  </td>
                  <td>
                    {p.id.startsWith("new-product") && (
                      <button
                        className="link-btn small"
                        onClick={() => {
                          const id = slugify(p.name);
                          if (store.products.some((x) => x.id === id)) return alert("Another product already uses that name.");
                          setP(i, { id, slug: id });
                        }}
                      >
                        Set web address from name
                      </button>
                    )}
                    <button
                      className="link-btn small"
                      style={{ color: "var(--danger)", display: "block", marginTop: "0.3rem" }}
                      onClick={() => {
                        if (store.bundles.some((b) => b.items?.some((it) => it.productId === p.id))) return alert("Remove this product from its bundles first, or mark it out of stock instead.");
                        if (confirm(`Delete ${p.name}?`)) update((s) => ((s.products = s.products.filter((x) => x.id !== p.id)), s));
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ marginTop: "0.75rem" }} onClick={addProduct}>
          Add a product
        </button>
        <p className="small muted">Sold-out products stay visible but can't be ordered. Tip: to hide one, mark it out of stock.</p>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "var(--step-3)" }}>Ready-made bundles</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Bundle</th>
                <th>Contents</th>
                <th>Normal price</th>
                <th>Bundle price (AED)</th>
                <th>Shown</th>
                <th>On home page</th>
              </tr>
            </thead>
            <tbody>
              {store.bundles.map((b, i) => {
                const orig = bundleOriginal(b, products);
                return (
                  <tr key={b.id}>
                    <td style={{ minWidth: 220 }}>
                      <input aria-label="Bundle name" value={b.name} onChange={(e) => setB(i, { name: e.target.value })} />
                      <textarea aria-label="Bundle description" value={b.description} onChange={(e) => setB(i, { description: e.target.value })} style={{ marginTop: "0.4rem", minHeight: 60 }} />
                    </td>
                    <td style={{ minWidth: 240 }}>
                      {b.slots ? (
                        <span className="small">Customer chooses: {b.slots.map((s) => s.label.replace(/^Your /, "")).join(", ")}</span>
                      ) : (
                        <details>
                          <summary className="small" style={{ cursor: "pointer" }}>
                            {b.items!.length ? b.items!.map((it) => `${it.qty > 1 ? it.qty + "× " : ""}${products.get(it.productId)?.name ?? it.productId}`).join(", ") : "No products yet"}
                          </summary>
                          <div style={{ display: "grid", gap: "0.3rem", marginTop: "0.5rem" }}>
                            {store.products.map((p) => {
                              const q = b.items!.find((it) => it.productId === p.id)?.qty ?? 0;
                              return (
                                <label key={p.id} className="small" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                  <input
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={q}
                                    style={{ width: 64, minHeight: 34 }}
                                    onChange={(e) => {
                                      const v = Math.max(0, num(e.target.value));
                                      const items = b.items!.filter((it) => it.productId !== p.id);
                                      setB(i, { items: v ? [...items, { productId: p.id, qty: v }].sort((x, y) => store.products.findIndex((z) => z.id === x.productId) - store.products.findIndex((z) => z.id === y.productId)) : items });
                                    }}
                                  />
                                  {p.name}
                                </label>
                              );
                            })}
                          </div>
                        </details>
                      )}
                    </td>
                    <td>AED {orig}{b.slots ? " (from)" : ""}</td>
                    <td>
                      <input aria-label="Bundle price" type="number" min={0} value={b.price} onChange={(e) => setB(i, { price: num(e.target.value) })} style={{ width: 90 }} />
                      {orig - b.price > 0 && <div className="small saved-msg">Saves AED {orig - b.price}</div>}
                      {orig - b.price <= 0 && b.price > 0 && <div className="small" style={{ color: "var(--danger)" }}>No saving</div>}
                    </td>
                    <td>
                      <input aria-label="Shown" type="checkbox" checked={b.active} onChange={(e) => setB(i, { active: e.target.checked })} style={{ width: 22, minHeight: 22 }} />
                    </td>
                    <td>
                      <input aria-label="Featured" type="checkbox" checked={!!b.featured} onChange={(e) => setB(i, { featured: e.target.checked })} style={{ width: 22, minHeight: 22 }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ marginTop: "0.75rem" }} onClick={addBundle}>
          Add a bundle
        </button>
        <p className="small muted">Bundles that are switched on are also applied automatically when customers add the same items to their cart one by one.</p>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2 style={{ fontSize: "var(--step-3)" }}>Discounts & delivery</h2>
        <div className="two" style={{ gap: "2rem" }}>
          <div className="order-card">
            <h3>Mix & Match tiers</h3>
            {tiers.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
                <input aria-label="Minimum items" type="number" min={1} value={t.minItems} style={{ width: 80 }} onChange={(e) => update((s) => ((s.pricing.mixAndMatch.tiers[i].minItems = num(e.target.value)), s))} />
                <span>or more items:</span>
                <input aria-label="Percent off" type="number" min={0} max={90} value={t.percent} style={{ width: 80 }} onChange={(e) => update((s) => ((s.pricing.mixAndMatch.tiers[i].percent = num(e.target.value)), s))} />
                <span>% off</span>
                <button className="link-btn small" onClick={() => update((s) => ((s.pricing.mixAndMatch.tiers = s.pricing.mixAndMatch.tiers.filter((_, j) => j !== i)), s))}>
                  Remove
                </button>
              </div>
            ))}
            <button className="link-btn small" onClick={() => update((s) => (s.pricing.mixAndMatch.tiers.push({ minItems: (tiers.at(-1)?.minItems ?? 0) + 3, percent: (tiers.at(-1)?.percent ?? 0) + 5 }), s))}>
              Add a tier
            </button>
            <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "1rem 0" }} />
            <label className="check" style={{ marginBottom: "0.5rem" }}>
              <input type="checkbox" checked={store.pricing.mixAndMatch.completeRoutine.enabled} onChange={(e) => update((s) => ((s.pricing.mixAndMatch.completeRoutine.enabled = e.target.checked), s))} />
              <span>Complete Routine: extra discount for soap + moisturizer + oil</span>
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              Extra
              <input type="number" min={0} max={50} value={store.pricing.mixAndMatch.completeRoutine.percent} style={{ width: 80 }} onChange={(e) => update((s) => ((s.pricing.mixAndMatch.completeRoutine.percent = num(e.target.value)), s))} />% off
            </label>
            <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: "1rem 0" }} />
            <label className="check">
              <input type="checkbox" checked={store.pricing.applyToCart.enabled} onChange={(e) => update((s) => ((s.pricing.applyToCart.enabled = e.target.checked), s))} />
              <span>Automatically give loose cart items the best tier or bundle price</span>
            </label>
          </div>
          <div className="order-card">
            <h3>Delivery</h3>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
              Delivery fee AED
              <input type="number" min={0} value={store.pricing.delivery.fee} style={{ width: 90 }} onChange={(e) => update((s) => ((s.pricing.delivery.fee = num(e.target.value)), s))} />
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              Free delivery from AED
              <input type="number" min={0} value={store.pricing.delivery.freeFrom} style={{ width: 90 }} onChange={(e) => update((s) => ((s.pricing.delivery.freeFrom = num(e.target.value)), s))} />
            </label>
            <h3 style={{ marginTop: "1.5rem" }}>Gift box</h3>
            <label className="check" style={{ marginBottom: "0.5rem" }}>
              <input type="checkbox" checked={store.pricing.giftBox.enabled} onChange={(e) => update((s) => ((s.pricing.giftBox.enabled = e.target.checked), s))} />
              <span>Offer a gift box in Mix & Match</span>
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              Price AED
              <input type="number" min={0} value={store.pricing.giftBox.price} style={{ width: 90 }} onChange={(e) => update((s) => ((s.pricing.giftBox.price = num(e.target.value)), s))} />
            </label>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: "1rem" }}>
          The FAQ and policy texts mention these numbers too; update them in data/site.json if you change them.
        </p>
      </section>
    </>
  );
}
