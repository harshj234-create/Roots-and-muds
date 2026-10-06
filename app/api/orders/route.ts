import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { getStore } from "@/lib/store";
import { site, normalizeUaeMobile, formatUaeMobile } from "@/lib/site";
import { priceCart, type CartLine } from "@/lib/pricing";
import { createOrder, setOrderNotifications } from "@/lib/db";
import { notifyOwner } from "@/lib/notify";

export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function sanitizeLines(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLine[] = [];
  for (const l of raw.slice(0, 50)) {
    const qty = Math.max(1, Math.min(99, Math.floor(Number(l?.qty) || 1)));
    const key = str(l?.key, 80) || String(out.length);
    if (l?.type === "product") out.push({ key, type: "product", productId: str(l.productId, 80), qty });
    else if (l?.type === "bundle")
      out.push({ key, type: "bundle", bundleId: str(l.bundleId, 80), qty, choices: Array.isArray(l.choices) ? l.choices.slice(0, 10).map((c: unknown) => str(c, 80)) : undefined });
    else if (l?.type === "box" && Array.isArray(l.items))
      out.push({
        key,
        type: "box",
        qty: 1,
        giftBox: !!l.giftBox,
        giftNote: str(l.giftNote, 300),
        items: l.items.slice(0, 30).map((i: any) => ({ productId: str(i?.productId, 80), qty: Math.max(0, Math.min(20, Math.floor(Number(i?.qty) || 0))) })),
      });
  }
  return out;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body?.website) return NextResponse.json({ error: "Invalid request." }, { status: 400 }); // honeypot

  const c = body?.customer ?? {};
  const customer = {
    name: str(c.name, 100),
    phone: normalizeUaeMobile(str(c.phone, 30)) ?? "",
    email: str(c.email, 150),
    emirate: str(c.emirate, 40),
    area: str(c.area, 100),
    address: str(c.address, 300),
    notes: str(c.notes, 500),
    deliveryTime: str(c.deliveryTime, 60),
    payment: "Cash on Delivery",
  };
  const errors: Record<string, string> = {};
  if (customer.name.length < 2) errors.name = "Enter your full name.";
  if (!customer.phone) errors.phone = "Enter a UAE mobile number, for example 050 123 4567.";
  if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) errors.email = "Check your email address, or leave it empty.";
  if (!site.emirates.includes(customer.emirate)) errors.emirate = "Choose your emirate.";
  if (!customer.area) errors.area = "Enter your area.";
  if (customer.address.length < 5) errors.address = "Enter your building, flat or villa number and street.";
  if (customer.deliveryTime && !site.deliverySlots.includes(customer.deliveryTime)) customer.deliveryTime = "";
  if (Object.keys(errors).length) return NextResponse.json({ error: "Please check the highlighted fields.", fields: errors }, { status: 400 });

  // Prices are always recalculated here from the current catalog; the browser's numbers are never trusted.
  const store = await getStore();
  const lines = sanitizeLines(body?.lines);
  const priced = priceCart(lines, store);
  if (!priced.lines.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  if (priced.problems.length) return NextResponse.json({ error: `${priced.problems.join(". ")}. Please update your cart.` }, { status: 409 });
  if (priced.itemCount === 0) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  if (typeof body?.expectedTotal === "number" && body.expectedTotal !== priced.total) {
    return NextResponse.json({ error: `Prices have changed since you opened the page. Your new total is AED ${priced.total}. Please review and place your order again.`, total: priced.total }, { status: 409 });
  }

  try {
    const order = await createOrder({
      token: randomBytes(12).toString("base64url"),
      customer: { ...customer, phoneDisplay: formatUaeMobile(customer.phone) },
      items: priced.lines,
      totals: {
        itemCount: priced.itemCount,
        originalTotal: priced.originalTotal,
        bundleSavings: priced.bundleSavings,
        totalSavings: priced.totalSavings,
        merchandiseTotal: priced.merchandiseTotal,
        deliveryFee: priced.deliveryFee,
        total: priced.total,
        looseOffers: priced.looseOffers,
        currency: "AED",
      },
    });
    const notifications = await notifyOwner(order);
    await setOrderNotifications(order.orderNumber, notifications).catch((e) => console.error(e));
    return NextResponse.json({ orderNumber: order.orderNumber, token: order.token });
  } catch (e) {
    console.error("Order could not be saved", e);
    return NextResponse.json(
      { error: `We couldn't place your order right now. Please try again, or WhatsApp us on ${site.phoneDisplay} and we'll take it there.` },
      { status: 500 },
    );
  }
}
