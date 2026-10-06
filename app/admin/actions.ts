"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, startSession } from "@/lib/auth";
import { deleteSetting, ORDER_STATUSES, setSetting, updateOrderStatus, type OrderStatus } from "@/lib/db";
import type { Store } from "@/lib/pricing";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function login(_: unknown, form: FormData) {
  await new Promise((r) => setTimeout(r, 400)); // slow down guessing
  if (!checkPassword(String(form.get("password") ?? ""))) return { error: "That password isn't right." };
  await startSession();
  redirect("/admin/orders");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

export async function setStatus(form: FormData) {
  await guard();
  const n = String(form.get("orderNumber"));
  const s = String(form.get("status")) as OrderStatus;
  if (ORDER_STATUSES.includes(s)) await updateOrderStatus(n, s);
  revalidatePath("/admin/orders");
}

function validStore(s: Store): string | null {
  if (!Array.isArray(s.products) || !Array.isArray(s.bundles) || !s.pricing) return "Catalog is incomplete.";
  const ids = new Set(s.products.map((p) => p.id));
  for (const p of s.products) {
    if (!p.name?.trim()) return "Every product needs a name.";
    if (!(p.price >= 0)) return `${p.name}: price must be a number.`;
    if (!p.images?.length) return `${p.name}: add at least one image path.`;
  }
  for (const b of s.bundles) {
    if (!b.name?.trim()) return "Every bundle needs a name.";
    if (!(b.price >= 0)) return `${b.name}: price must be a number.`;
    if (b.items && (!b.items.length || b.items.some((i) => !ids.has(i.productId) || i.qty < 1))) return `${b.name}: choose at least one product.`;
  }
  const t = s.pricing.mixAndMatch.tiers;
  if (t.some((x) => !(x.minItems >= 1) || !(x.percent >= 0 && x.percent < 100))) return "Each discount tier needs a minimum of 1+ items and a percent below 100.";
  return null;
}

export async function saveCatalog(store: Store) {
  await guard();
  const err = validStore(store);
  if (err) return { error: err };
  await setSetting("store", { categories: store.categories, products: store.products, bundles: store.bundles, pricing: store.pricing });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function resetCatalog() {
  await guard();
  await deleteSetting("store");
  revalidatePath("/", "layout");
  return { ok: true };
}
