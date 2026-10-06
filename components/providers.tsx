"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { BundleItem, CartLine, Store } from "@/lib/pricing";

// ---------- Catalog ----------

const StoreCtx = createContext<Store | null>(null);
export const useStoreData = () => {
  const s = useContext(StoreCtx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
};

// ---------- Cart ----------

export interface BoxDraft {
  items: BundleItem[];
  giftBox: boolean;
  giftNote: string;
  editingKey?: string; // set when editing a box that's already in the cart
}

interface CartApi {
  ready: boolean;
  lines: CartLine[];
  count: number;
  addProduct: (productId: string, qty?: number) => void;
  addMany: (productIds: string[]) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  bump: number; // increments on every add (drives the cart badge animation)
  addBundle: (bundleId: string, choices?: string[]) => void;
  saveBox: (box: BoxDraft) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  draft: BoxDraft;
  setDraft: (d: BoxDraft | ((d: BoxDraft) => BoxDraft)) => void;
  addToDraft: (productId: string) => void;
  editBox: (key: string) => void;
  toast: string | null;
}

const CART_KEY = "rm-cart-v1";
const DRAFT_KEY = "rm-box-draft-v1";
const emptyDraft: BoxDraft = { items: [], giftBox: false, giftNote: "" };

const CartCtx = createContext<CartApi | null>(null);
export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage unavailable (private mode): cart still works for this visit */
  }
}

export function Providers({ store, children }: { store: Store; children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [draft, setDraftState] = useState<BoxDraft>(emptyDraft);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bump, setBump] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const ids = new Set(store.products.map((p) => p.id));
    const bids = new Set(store.bundles.map((b) => b.id));
    const saved = read<CartLine[]>(CART_KEY, []).filter((l) =>
      l.type === "product" ? ids.has(l.productId) : l.type === "bundle" ? bids.has(l.bundleId) : l.type === "box",
    );
    setLines(saved);
    setDraftState(read<BoxDraft>(DRAFT_KEY, emptyDraft));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_KEY) setLines(read<CartLine[]>(CART_KEY, []));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [store]);

  useEffect(() => {
    if (ready) write(CART_KEY, lines);
  }, [lines, ready]);
  useEffect(() => {
    if (ready) write(DRAFT_KEY, draft);
  }, [draft, ready]);

  const notify = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const name = useCallback((id: string) => store.products.find((p) => p.id === id)?.name ?? "Item", [store]);

  const api = useMemo<CartApi>(() => {
    const addProduct = (productId: string, qty = 1) => {
      setLines((ls) => {
        const key = `p:${productId}`;
        const ex = ls.find((l) => l.key === key);
        if (ex) return ls.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + qty) } : l));
        return [...ls, { key, type: "product", productId, qty }];
      });
      setBump((b) => b + 1);
      setDrawerOpen(true);
    };
    const addMany = (productIds: string[]) => {
      setLines((ls) => {
        let next = [...ls];
        for (const productId of productIds) {
          const key = `p:${productId}`;
          const ex = next.find((l) => l.key === key);
          next = ex ? next.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + 1) } : l)) : [...next, { key, type: "product", productId, qty: 1 }];
        }
        return next;
      });
      setBump((b) => b + 1);
      setDrawerOpen(true);
    };
    const addBundle = (bundleId: string, choices?: string[]) => {
      const key = `b:${bundleId}${choices?.length ? ":" + choices.join("|") : ""}`;
      setLines((ls) => {
        const ex = ls.find((l) => l.key === key);
        if (ex) return ls.map((l) => (l.key === key ? { ...l, qty: Math.min(99, l.qty + 1) } : l));
        return [...ls, { key, type: "bundle", bundleId, qty: 1, choices }];
      });
      setBump((b) => b + 1);
      setDrawerOpen(true);
    };
    const saveBox = (box: BoxDraft) => {
      const items = box.items.filter((i) => i.qty > 0);
      setLines((ls) => {
        const line: CartLine = {
          key: box.editingKey ?? `x:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          type: "box",
          items,
          giftBox: box.giftBox,
          giftNote: box.giftBox ? box.giftNote : "",
          qty: 1,
        };
        return box.editingKey && ls.some((l) => l.key === box.editingKey)
          ? ls.map((l) => (l.key === box.editingKey ? line : l))
          : [...ls, line];
      });
      setDraftState(emptyDraft);
      setBump((b) => b + 1);
      setDrawerOpen(true);
    };
    return {
      ready,
      lines,
      count: lines.reduce((s, l) => s + (l.type === "box" ? l.items.reduce((a, i) => a + i.qty, 0) : l.qty), 0),
      addProduct,
      addMany,
      drawerOpen,
      setDrawerOpen,
      bump,
      addBundle,
      saveBox,
      setQty: (key, qty) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(99, qty)) } : l))),
      remove: (key) => setLines((ls) => ls.filter((l) => l.key !== key)),
      clear: () => setLines([]),
      draft,
      setDraft: (d) => setDraftState((prev) => (typeof d === "function" ? d(prev) : d)),
      addToDraft: (productId) => {
        setDraftState((d) => {
          const ex = d.items.find((i) => i.productId === productId);
          return {
            ...d,
            items: ex ? d.items.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i)) : [...d.items, { productId, qty: 1 }],
          };
        });
        notify(`${name(productId)} added to your Mix & Match box`);
      },
      editBox: (key) => {
        const line = lines.find((l) => l.key === key);
        if (line?.type === "box") setDraftState({ items: line.items, giftBox: line.giftBox, giftNote: line.giftNote ?? "", editingKey: key });
      },
      toast,
    };
  }, [lines, draft, ready, toast, notify, name, store, drawerOpen, bump]);

  return (
    <StoreCtx.Provider value={store}>
      <CartCtx.Provider value={api}>{children}</CartCtx.Provider>
    </StoreCtx.Provider>
  );
}
