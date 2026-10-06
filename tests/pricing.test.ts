import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  priceGroup,
  priceCart,
  bundlesForProduct,
  cartSuggestion,
  tierProgressMessage,
  type Store,
  type CartLine,
} from "../lib/pricing.ts";

const load = (f: string) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const store: Store = { ...load("products.json"), ...load("bundles.json"), pricing: load("pricing.json") };
const p = (id: string, qty = 1): CartLine => ({ key: id, type: "product", productId: id, qty });

test("bundle original prices match the brief", () => {
  const expected: Record<string, [number, number]> = {
    "kumkumadi-glow-ritual": [100, 89],
    "coffee-lovers-set": [100, 89],
    "sensitive-skin-trio": [75, 65],
    "lip-care-duo": [50, 45],
    "complete-soap-collection": [200, 169],
    "full-collection": [500, 399],
  };
  const prices = new Map(store.products.map((x) => [x.id, x.price]));
  for (const b of store.bundles) {
    if (!b.items) continue;
    const orig = b.items.reduce((s, it) => s + prices.get(it.productId)! * it.qty, 0);
    assert.deepEqual([orig, b.price], expected[b.id], b.id);
  }
});

test("tiers: 2 items no discount, 3 → 5%, 5 → 10%, 8 → 15%", () => {
  assert.equal(priceGroup({ "lavender-soap": 2 }, store).final, 50);
  assert.equal(priceGroup({ "lavender-soap": 3 }, store).final, 71); // 75 * .95 = 71.25
  assert.equal(priceGroup({ "lavender-soap": 5 }, store).final, 113); // 125 * .9 = 112.5 → 113
  assert.equal(priceGroup({ "lavender-soap": 8 }, store, { useBundles: false }).final, 170); // 200 * .85
});

test("complete routine adds 5% on top of the tier", () => {
  const g = priceGroup({ "lavender-soap": 1, "herbal-oil": 1, "kumkumadi-moisturizer": 1 }, store, { useBundles: false });
  assert.equal(g.final, 113); // 125 * .90 = 112.5
  assert.ok(g.routineApplied);
});

test("loose items matching a ready-made bundle get the bundle price", () => {
  const c = priceCart([p("kumkumadi-soap"), p("kumkumadi-moisturizer"), p("mango-butter-lip-balm")], store);
  assert.equal(c.merchandiseTotal, 89);
  assert.equal(c.bundleSavings, 11);
  assert.equal(c.deliveryFee, 15);
  assert.equal(c.total, 104);
});

test("any soap + moisturizer + oil gets Full Body Ritual (better than tier + routine)", () => {
  const g = priceGroup({ "aloe-vera-soap": 1, "haldi-chandan-moisturizer": 1, "calming-nourishing-oil": 1 }, store);
  assert.equal(g.final, 109);
  assert.equal(g.offers[0].label, "Full Body Ritual");
});

test("all 8 soaps → Complete Soap Collection beats 15% tier", () => {
  const counts = Object.fromEntries(store.products.filter((x) => x.category === "soaps").map((x) => [x.id, 1]));
  assert.equal(priceGroup(counts, store).final, 169);
});

test("all 15 products → Full Collection 399", () => {
  const counts = Object.fromEntries(store.products.map((x) => [x.id, 1]));
  assert.equal(priceGroup(counts, store).final, 399);
});

test("no item is discounted twice; picks the best combination", () => {
  // Glow ritual items + lip duo overlap on mango balm; only one mango balm present
  const g = priceGroup({ "kumkumadi-soap": 1, "kumkumadi-moisturizer": 1, "mango-butter-lip-balm": 1, "lip-plump-balm": 1 }, store);
  // Options: Glow (89) + plump 25 = 114; Duo (45) + 75 tier 3 items? no, 2 items = 75 → 120; tier 4 items 5% of 125 = 119
  assert.equal(g.final, 114);
  assert.ok(g.savings <= 125 - 114);
});

test("flat delivery fee, no free delivery by default", () => {
  const big = priceCart([p("haldi-chandan-moisturizer", 6)], store);
  assert.equal(big.deliveryFee, 15);
  assert.equal(big.freeDeliveryGap, 0);
});

test("free delivery threshold still works when switched on", () => {
  const store150: Store = { ...store, pricing: { ...store.pricing, delivery: { fee: 15, freeFrom: 150 } } };
  const c = priceCart([p("haldi-chandan-moisturizer", 3)], store150); // 150 * .95 = 142.5 → 143 (<150)
  assert.equal(c.merchandiseTotal, 143);
  assert.equal(c.deliveryFee, 15);
  const c2 = priceCart([p("haldi-chandan-moisturizer", 4)], store150); // 200 * .95 = 190
  assert.equal(c2.deliveryFee, 0);
});

test("ready-made bundle line and gift box", () => {
  const c = priceCart(
    [
      { key: "b", type: "bundle", bundleId: "full-body-ritual", qty: 1, choices: ["lavender-soap", "kumkumadi-moisturizer", "herbal-oil"] },
      { key: "x", type: "box", items: [{ productId: "coffee-cream-soap", qty: 2 }, { productId: "lip-plump-balm", qty: 1 }], giftBox: true, giftNote: "Hi", qty: 1 },
    ],
    store,
  );
  assert.equal(c.lines[0].lineTotal, 109);
  assert.equal(c.lines[1].lineTotal, 71 + 10);
  assert.equal(c.total, 190 + 15);
});

test("invalid bundle choices are flagged", () => {
  const c = priceCart([{ key: "b", type: "bundle", bundleId: "full-body-ritual", qty: 1, choices: ["lavender-soap", "herbal-oil", "herbal-oil"] }], store);
  assert.equal(c.problems.length, 1);
});

test("suggestions", () => {
  const s = bundlesForProduct("kumkumadi-soap", store)[0];
  assert.equal(s.message, "Add Kumkumadi Moisturizer + Mango Butter Lip Balm and save AED 11");
  const cs = cartSuggestion([p("mango-butter-lip-balm")], store);
  assert.equal(cs?.bundle.id, "kumkumadi-glow-ritual");
  assert.equal(cs?.savings, 11);
  assert.equal(tierProgressMessage(3, store.pricing), "Add 2 more items to unlock 10% off");
  assert.equal(tierProgressMessage(9, store.pricing), null);
});
