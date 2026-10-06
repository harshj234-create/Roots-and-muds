// Roots and Muds pricing engine.
// Pure functions shared by the browser (live totals) and the server (the price an order is saved at).
// All the numbers it uses (tiers, bundle prices, gift box, delivery) come from data/*.json
// or from the admin page, never from this file.

export type CategoryId = string;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  price: number;
  size: string;
  shortDescription: string;
  description: string;
  keyIngredients: string[];
  howToUse: string;
  images: string[];
  inStock: boolean;
  bestseller?: boolean;
  // used by the skin quiz and for colour accents
  skinTypes?: string[];
  goals?: string[];
  scent?: string;
  color?: string;
  legacyHandle?: string; // the product's old Shopify address, redirected to the new one
}

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  image?: string;
  color?: string;
}

export interface BundleItem {
  productId: string;
  qty: number;
}

export interface BundleSlot {
  category: CategoryId;
  label: string;
}

export interface Bundle {
  id: string;
  slug: string;
  name: string;
  description: string;
  items?: BundleItem[]; // fixed contents
  slots?: BundleSlot[]; // "customer chooses one from each category"
  price: number;
  active: boolean;
  featured?: boolean;
  image?: string;
}

export interface Tier {
  minItems: number;
  percent: number;
}

export interface PricingConfig {
  currency: string;
  mixAndMatch: {
    tiers: Tier[];
    completeRoutine: { enabled: boolean; percent: number; label: string; requiredCategories: CategoryId[] };
  };
  applyToCart: { enabled: boolean };
  giftBox: { enabled: boolean; price: number; label: string };
  delivery: { fee: number; freeFrom: number };
}

export interface Store {
  categories: Category[];
  products: Product[];
  bundles: Bundle[];
  pricing: PricingConfig;
}

// ---------- Cart model ----------

export type CartLine =
  | { key: string; type: "product"; productId: string; qty: number }
  | { key: string; type: "bundle"; bundleId: string; qty: number; choices?: string[] }
  | {
      key: string;
      type: "box";
      name?: string;
      items: BundleItem[];
      giftBox: boolean;
      giftNote?: string;
      qty: number;
    };

export type Counts = Record<string, number>;

export interface AppliedOffer {
  kind: "bundle" | "tier";
  label: string; // e.g. "Kumkumadi Glow Ritual" or "Mix & Match 10% off + Complete Routine 5%"
  times?: number;
  productIds?: string[]; // items the offer used
  savings: number;
}

export interface GroupPrice {
  itemCount: number;
  original: number;
  final: number;
  savings: number;
  offers: AppliedOffer[];
  tierPercent: number; // tier % applied to all items as one group (for the builder summary)
  routineApplied: boolean;
}

// ---------- Helpers ----------

export const roundAED = (n: number) => Math.round(n + Number.EPSILON);

export function productMap(store: Pick<Store, "products">) {
  const m = new Map<string, Product>();
  for (const p of store.products) m.set(p.id, p);
  return m;
}

export function countItems(counts: Counts) {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function sumPrice(counts: Counts, products: Map<string, Product>) {
  let total = 0;
  for (const [id, q] of Object.entries(counts)) total += (products.get(id)?.price ?? 0) * q;
  return total;
}

export function tierFor(itemCount: number, tiers: Tier[]): Tier | null {
  let best: Tier | null = null;
  for (const t of tiers) if (itemCount >= t.minItems && (!best || t.minItems > best.minItems)) best = t;
  return best;
}

export function nextTier(itemCount: number, tiers: Tier[]): (Tier & { needed: number }) | null {
  const current = tierFor(itemCount, tiers);
  const upcoming = [...tiers]
    .filter((t) => t.minItems > itemCount && t.percent > (current?.percent ?? 0))
    .sort((a, b) => a.minItems - b.minItems)[0];
  return upcoming ? { ...upcoming, needed: upcoming.minItems - itemCount } : null;
}

export function hasCompleteRoutine(counts: Counts, products: Map<string, Product>, cfg: PricingConfig) {
  const cr = cfg.mixAndMatch.completeRoutine;
  if (!cr.enabled) return false;
  const cats = new Set<string>();
  for (const [id, q] of Object.entries(counts)) if (q > 0) cats.add(products.get(id)?.category ?? "");
  return cr.requiredCategories.every((c) => cats.has(c));
}

/** Mix & Match pricing for a set of items: tier % plus optional Complete Routine %. */
export function tierPrice(counts: Counts, products: Map<string, Product>, cfg: PricingConfig) {
  const original = sumPrice(counts, products);
  const n = countItems(counts);
  const tier = tierFor(n, cfg.mixAndMatch.tiers);
  const routine = tier ? hasCompleteRoutine(counts, products, cfg) : false; // routine bonus needs a qualifying box
  const pct = Math.min(100, (tier?.percent ?? 0) + (routine ? cfg.mixAndMatch.completeRoutine.percent : 0));
  const final = roundAED((original * (100 - pct)) / 100);
  return { original, final, tierPercent: tier?.percent ?? 0, routine, pct };
}

export function tierLabel(tierPercent: number, routine: boolean, cfg: PricingConfig) {
  const parts: string[] = [];
  if (tierPercent) parts.push(`Mix & Match ${tierPercent}% off`);
  if (routine) parts.push(`${cfg.mixAndMatch.completeRoutine.label} +${cfg.mixAndMatch.completeRoutine.percent}%`);
  return parts.join(" + ");
}

/** Normal (separate) price of a bundle's contents. For choose-your-own bundles, uses the given choices
 *  or, if none, the cheapest product in each category. */
export function bundleOriginal(bundle: Bundle, products: Map<string, Product>, choices?: string[]) {
  if (bundle.items) return bundle.items.reduce((s, it) => s + (products.get(it.productId)?.price ?? 0) * it.qty, 0);
  return (bundle.slots ?? []).reduce((s, slot, i) => {
    const chosen = choices?.[i] ? products.get(choices[i]) : undefined;
    if (chosen) return s + chosen.price;
    const prices = [...products.values()].filter((p) => p.category === slot.category).map((p) => p.price);
    return s + (prices.length ? Math.min(...prices) : 0);
  }, 0);
}

export function bundleContents(bundle: Bundle, choices?: string[]): Counts {
  const c: Counts = {};
  if (bundle.items) for (const it of bundle.items) c[it.productId] = (c[it.productId] ?? 0) + it.qty;
  else (bundle.slots ?? []).forEach((_, i) => {
    const id = choices?.[i];
    if (id) c[id] = (c[id] ?? 0) + 1;
  });
  return c;
}

export function bundleAvailable(bundle: Bundle, products: Map<string, Product>) {
  if (!bundle.active) return false;
  if (bundle.items) return bundle.items.every((it) => products.get(it.productId)?.inStock);
  return (bundle.slots ?? []).every((s) => [...products.values()].some((p) => p.category === s.category && p.inStock));
}

/** Checks that choices for a choose-your-own bundle are valid. */
export function validChoices(bundle: Bundle, products: Map<string, Product>, choices?: string[]) {
  if (!bundle.slots) return true;
  if (!choices || choices.length !== bundle.slots.length) return false;
  return bundle.slots.every((s, i) => {
    const p = products.get(choices[i]);
    return !!p && p.category === s.category;
  });
}

// ---------- Best-price search ----------

const SEARCH_LIMIT = 60; // above this many items, skip the bundle search and use tiers only

/** Every way the bundle can be taken out of `counts` (for fixed bundles there is at most one way). */
function takeOptions(bundle: Bundle, counts: Counts, products: Map<string, Product>): { rest: Counts; used: string[] }[] {
  if (bundle.items) {
    const rest = { ...counts };
    for (const it of bundle.items) {
      if ((rest[it.productId] ?? 0) < it.qty) return [];
      rest[it.productId] -= it.qty;
    }
    return [{ rest, used: bundle.items.flatMap((it) => Array(it.qty).fill(it.productId)) }];
  }
  let options: { rest: Counts; used: string[] }[] = [{ rest: { ...counts }, used: [] }];
  for (const slot of bundle.slots ?? []) {
    const next: typeof options = [];
    for (const opt of options) {
      for (const [id, q] of Object.entries(opt.rest)) {
        if (q > 0 && products.get(id)?.category === slot.category) {
          next.push({ rest: { ...opt.rest, [id]: q - 1 }, used: [...opt.used, id] });
        }
      }
    }
    options = next;
    if (!options.length) return [];
  }
  // de-duplicate identical results
  const seen = new Set<string>();
  return options.filter((o) => {
    const k = key(o.rest);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function key(c: Counts) {
  return Object.entries(c)
    .filter(([, q]) => q > 0)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([id, q]) => `${id}:${q}`)
    .join(",");
}

interface Plan {
  final: number;
  bundles: { bundle: Bundle; used: string[] }[];
  rest: Counts;
}

/**
 * Finds the lowest price for a set of items. Each item gets at most ONE offer: it is either part of a
 * ready-made bundle (at the bundle price) or part of the remaining Mix & Match group (tier %), never both.
 */
export function priceGroup(counts: Counts, store: Store, opts: { useBundles?: boolean } = {}): GroupPrice {
  const products = productMap(store);
  const clean: Counts = {};
  for (const [id, q] of Object.entries(counts)) if (q > 0 && products.has(id)) clean[id] = q;
  const itemCount = countItems(clean);
  const original = sumPrice(clean, products);
  const asGroup = tierPrice(clean, products, store.pricing);

  const useBundles = opts.useBundles !== false && itemCount <= SEARCH_LIMIT;
  const bundles = useBundles ? store.bundles.filter((b) => b.active) : [];

  const memo = new Map<string, Plan>();
  const best = (c: Counts, start: number): Plan => {
    const k = `${start}|${key(c)}`;
    const hit = memo.get(k);
    if (hit) return hit;
    let plan: Plan = { final: tierPrice(c, products, store.pricing).final, bundles: [], rest: c };
    for (let i = start; i < bundles.length; i++) {
      for (const opt of takeOptions(bundles[i], c, products)) {
        const sub = best(opt.rest, i);
        const total = bundles[i].price + sub.final;
        if (total < plan.final) {
          plan = { final: total, bundles: [{ bundle: bundles[i], used: opt.used }, ...sub.bundles], rest: sub.rest };
        }
      }
    }
    memo.set(k, plan);
    return plan;
  };

  const plan = best(clean, 0);
  const offers: AppliedOffer[] = [];
  const grouped = new Map<string, AppliedOffer>();
  for (const { bundle, used } of plan.bundles) {
    const orig = used.reduce((s, id) => s + (products.get(id)?.price ?? 0), 0);
    const g = grouped.get(bundle.id);
    if (g) {
      g.times = (g.times ?? 1) + 1;
      g.savings += orig - bundle.price;
      g.productIds!.push(...used);
    } else {
      const o: AppliedOffer = { kind: "bundle", label: bundle.name, times: 1, productIds: [...used], savings: orig - bundle.price };
      grouped.set(bundle.id, o);
      offers.push(o);
    }
  }
  const restTier = tierPrice(plan.rest, products, store.pricing);
  if (restTier.original - restTier.final > 0) {
    offers.push({
      kind: "tier",
      label: tierLabel(restTier.tierPercent, restTier.routine, store.pricing),
      productIds: Object.keys(plan.rest),
      savings: restTier.original - restTier.final,
    });
  }

  return {
    itemCount,
    original,
    final: plan.final,
    savings: original - plan.final,
    offers,
    tierPercent: asGroup.tierPercent,
    routineApplied: asGroup.routine,
  };
}

// ---------- Whole cart ----------

export interface PricedLine {
  key: string;
  type: CartLine["type"];
  title: string;
  qty: number;
  unitOriginal: number;
  unitPrice: number; // per unit, after the line's own discount (bundles/boxes); loose products show list price
  lineOriginal: number;
  lineTotal: number;
  contents?: { productId: string; name: string; qty: number }[];
  giftBox?: boolean;
  giftNote?: string;
  offers?: AppliedOffer[];
  problem?: string; // out of stock / invalid
}

export interface PricedCart {
  lines: PricedLine[];
  itemCount: number;
  originalTotal: number; // everything at normal prices, incl. gift boxes
  bundleSavings: number; // automatic savings on loose items
  totalSavings: number;
  merchandiseTotal: number; // what the products cost after all savings
  deliveryFee: number;
  total: number;
  looseOffers: AppliedOffer[];
  freeDeliveryGap: number; // AED still needed for free delivery (0 if free)
  problems: string[];
}

export function priceCart(lines: CartLine[], store: Store): PricedCart {
  const products = productMap(store);
  const bundles = new Map(store.bundles.map((b) => [b.id, b]));
  const out: PricedLine[] = [];
  const problems: string[] = [];
  const loose: Counts = {};
  let originalTotal = 0;
  let merch = 0;
  let itemCount = 0;

  for (const line of lines) {
    const qty = Math.max(1, Math.floor(line.qty || 1));
    if (line.type === "product") {
      const p = products.get(line.productId);
      if (!p) continue;
      const pl: PricedLine = {
        key: line.key,
        type: "product",
        title: p.name,
        qty,
        unitOriginal: p.price,
        unitPrice: p.price,
        lineOriginal: p.price * qty,
        lineTotal: p.price * qty,
      };
      if (!p.inStock) {
        pl.problem = `${p.name} is sold out`;
        problems.push(pl.problem);
      } else {
        loose[p.id] = (loose[p.id] ?? 0) + qty;
        itemCount += qty;
      }
      out.push(pl);
    } else if (line.type === "bundle") {
      const b = bundles.get(line.bundleId);
      if (!b) continue;
      const unitOriginal = bundleOriginal(b, products, line.choices);
      const contents = Object.entries(bundleContents(b, line.choices)).map(([id, q]) => ({
        productId: id,
        name: products.get(id)?.name ?? id,
        qty: q,
      }));
      const pl: PricedLine = {
        key: line.key,
        type: "bundle",
        title: b.name,
        qty,
        unitOriginal,
        unitPrice: b.price,
        lineOriginal: unitOriginal * qty,
        lineTotal: b.price * qty,
        contents,
      };
      const oos = contents.filter((c) => !products.get(c.productId)?.inStock);
      if (!b.active) pl.problem = `${b.name} is no longer available`;
      else if (!validChoices(b, products, line.choices)) pl.problem = `Choose one product for each step of ${b.name}`;
      else if (oos.length) pl.problem = `${oos.map((c) => c.name).join(", ")} sold out`;
      if (pl.problem) problems.push(pl.problem);
      else {
        originalTotal += pl.lineOriginal;
        merch += pl.lineTotal;
        itemCount += contents.reduce((s, c) => s + c.qty, 0) * qty;
      }
      out.push(pl);
    } else if (line.type === "box") {
      const counts: Counts = {};
      for (const it of line.items) if (it.qty > 0) counts[it.productId] = (counts[it.productId] ?? 0) + it.qty;
      const g = priceGroup(counts, store);
      const gift = line.giftBox && store.pricing.giftBox.enabled ? store.pricing.giftBox.price : 0;
      const contents = Object.entries(counts).map(([id, q]) => ({ productId: id, name: products.get(id)?.name ?? id, qty: q }));
      const pl: PricedLine = {
        key: line.key,
        type: "box",
        title: line.name || "Your Mix & Match box",
        qty,
        unitOriginal: g.original + gift,
        unitPrice: g.final + gift,
        lineOriginal: (g.original + gift) * qty,
        lineTotal: (g.final + gift) * qty,
        contents,
        giftBox: !!gift,
        giftNote: gift ? line.giftNote?.slice(0, 300) : undefined,
        offers: g.offers,
      };
      const oos = contents.filter((c) => !products.get(c.productId)?.inStock);
      if (!contents.length) pl.problem = "This box is empty";
      else if (oos.length) pl.problem = `${oos.map((c) => c.name).join(", ")} sold out`;
      if (pl.problem) problems.push(pl.problem);
      else {
        originalTotal += pl.lineOriginal;
        merch += pl.lineTotal;
        itemCount += g.itemCount * qty;
      }
      out.push(pl);
    }
  }

  const looseOriginal = sumPrice(loose, products);
  const looseGroup = store.pricing.applyToCart.enabled
    ? priceGroup(loose, store)
    : { final: looseOriginal, savings: 0, offers: [] as AppliedOffer[] };
  originalTotal += looseOriginal;
  merch += looseGroup.final;

  const { fee, freeFrom } = store.pricing.delivery;
  const deliveryFee = merch <= 0 || merch >= freeFrom ? 0 : fee;
  return {
    lines: out,
    itemCount,
    originalTotal,
    bundleSavings: looseGroup.savings,
    totalSavings: originalTotal - merch,
    merchandiseTotal: merch,
    deliveryFee,
    total: merch + deliveryFee,
    looseOffers: looseGroup.offers,
    freeDeliveryGap: merch > 0 && merch < freeFrom ? freeFrom - merch : 0,
    problems,
  };
}

// ---------- Suggestions ----------

export interface BundleSuggestion {
  bundle: Bundle;
  missing: Product[];
  savings: number;
  message: string;
}

function joinNames(names: string[]) {
  if (names.length <= 1) return names.join("");
  return names.slice(0, -1).join(", ") + " + " + names[names.length - 1];
}

/** Bundles that include this product, with the saving versus buying the items separately. */
export function bundlesForProduct(productId: string, store: Store): BundleSuggestion[] {
  const products = productMap(store);
  const p = products.get(productId);
  if (!p) return [];
  return store.bundles
    .filter((b) => bundleAvailable(b, products))
    .filter((b) => b.items?.some((it) => it.productId === productId) || b.slots?.some((s) => s.category === p.category))
    .map((b) => {
      const missing = b.items
        ? b.items.filter((it) => it.productId !== productId).map((it) => products.get(it.productId)!).filter(Boolean)
        : [];
      const original = b.items ? bundleOriginal(b, products) : bundleOriginal(b, products, undefined);
      const savings = original - b.price;
      const message = b.items
        ? missing.length <= 3
          ? `Add ${joinNames(missing.map((m) => m.name))} and save AED ${savings}`
          : `Get all ${b.items.length} products and save AED ${savings}`
        : `Pair it with any ${b.slots!.filter((s) => s.category !== p.category).map((s) => s.label.replace(/^Your /, "")).join(" and ")} and save AED ${savings}`;
      return { bundle: b, missing, savings, message };
    })
    .filter((s) => s.savings > 0)
    .sort((a, b) => Number(!a.bundle.items) - Number(!b.bundle.items) || size(a.bundle) - size(b.bundle) || b.savings - a.savings);
}

function size(b: Bundle) {
  return b.items ? b.items.reduce((s, it) => s + it.qty, 0) : (b.slots?.length ?? 0);
}

/** Best "add these and save" suggestion for the loose items in a cart. */
export function cartSuggestion(lines: CartLine[], store: Store): BundleSuggestion | null {
  const products = productMap(store);
  const loose: Counts = {};
  for (const l of lines) if (l.type === "product" && products.get(l.productId)?.inStock) loose[l.productId] = (loose[l.productId] ?? 0) + l.qty;
  if (!Object.keys(loose).length) return null;
  const current = priceGroup(loose, store).final;
  let best: BundleSuggestion | null = null;
  for (const b of store.bundles) {
    if (!b.items || !bundleAvailable(b, products)) continue;
    const need: Counts = {};
    let have = 0;
    for (const it of b.items) {
      const owned = Math.min(loose[it.productId] ?? 0, it.qty);
      have += owned;
      if (it.qty - owned > 0) need[it.productId] = it.qty - owned;
    }
    const missingCount = countItems(need);
    if (!have || !missingCount || missingCount > 3) continue;
    const missing = Object.keys(need).map((id) => products.get(id)!).filter(Boolean);
    const addPrice = sumPrice(need, products);
    const merged: Counts = { ...loose };
    for (const [id, q] of Object.entries(need)) merged[id] = (merged[id] ?? 0) + q;
    const after = priceGroup(merged, store).final;
    const savings = current + addPrice - after;
    if (savings > 0 && (!best || savings > best.savings || (savings === best.savings && missing.length < best.missing.length))) {
      best = { bundle: b, missing, savings, message: `Add ${joinNames(missing.map((m) => m.name))} to complete the ${b.name} and save AED ${savings}` };
    }
  }
  return best;
}

export function tierProgressMessage(itemCount: number, cfg: PricingConfig) {
  const nt = nextTier(itemCount, cfg.mixAndMatch.tiers);
  if (!nt) return null;
  return `Add ${nt.needed} more item${nt.needed === 1 ? "" : "s"} to unlock ${nt.percent}% off`;
}

export function formatAED(n: number) {
  return `AED ${Math.round(n).toLocaleString("en-AE")}`;
}
