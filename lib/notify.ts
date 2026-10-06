import "server-only";
import type { OrderRecord } from "./db";
import type { PricedLine } from "./pricing";
import { site } from "./site";

// New-order notifications. Each channel is optional and switches on when its environment
// variables are set (see README). A failure in one channel never stops the order.

const TIMEOUT = 8000;

async function withTimeout(p: (signal: AbortSignal) => Promise<Response>) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const res = await p(ctl.signal);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

export function orderText(o: OrderRecord) {
  const c = o.customer;
  const t = o.totals as Record<string, number>;
  const lines = (o.items as PricedLine[])
    .map((l) => {
      let s = `• ${l.qty} × ${l.title} — AED ${l.lineTotal}`;
      if (l.contents && l.type !== "product") s += "\n   " + l.contents.map((x) => `${x.qty} × ${x.name}`).join(", ");
      if (l.giftBox) s += `\n   Gift box${l.giftNote ? `, note: "${l.giftNote}"` : ""}`;
      return s;
    })
    .join("\n");
  return [
    `New order ${o.orderNumber} (Cash on Delivery)`,
    ``,
    lines,
    ``,
    t.totalSavings ? `Savings: AED ${t.totalSavings}` : null,
    `Products: AED ${t.merchandiseTotal}`,
    `Delivery: ${t.deliveryFee ? `AED ${t.deliveryFee}` : "Free"}`,
    `TOTAL TO COLLECT: AED ${t.total}`,
    ``,
    `${c.name}`,
    `${c.phoneDisplay}${c.email ? ` · ${c.email}` : ""}`,
    `${c.address}, ${c.area}, ${c.emirate}`,
    c.deliveryTime ? `Preferred time: ${c.deliveryTime}` : null,
    c.notes ? `Notes: ${c.notes}` : null,
  ]
    .filter((x) => x !== null)
    .join("\n");
}

function esc(s: string) {
  return s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
}

async function email(o: OrderRecord) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  if (!key || !to) return "not configured";
  const from = process.env.ORDER_EMAIL_FROM || "Roots and Muds <onboarding@resend.dev>";
  const text = orderText(o);
  const admin = `${process.env.SITE_URL || site.domain}/admin/orders`;
  await withTimeout((signal) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: to.split(",").map((x) => x.trim()),
        reply_to: o.customer.email || undefined,
        subject: `New order ${o.orderNumber}: AED ${(o.totals as any).total} COD, ${o.customer.name}, ${o.customer.emirate}`,
        text: `${text}\n\nManage orders: ${admin}`,
        html: `<pre style="font:14px/1.5 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap">${esc(text)}</pre><p><a href="${admin}">Open the orders page</a></p>`,
      }),
    }),
  );
  return "sent";
}

async function whatsapp(o: OrderRecord) {
  // CallMeBot: free WhatsApp messages to your own number. One-time setup in README.
  const key = process.env.CALLMEBOT_API_KEY;
  if (!key) return "not configured";
  const phone = process.env.CALLMEBOT_PHONE || site.whatsapp;
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(key)}&text=${encodeURIComponent(orderText(o))}`;
  const res = await withTimeout((signal) => fetch(url, { signal }));
  const body = await res.text();
  if (/error|invalid|not/i.test(body) && !/queued|sent/i.test(body)) throw new Error(body.slice(0, 200));
  return "sent";
}

async function sheet(o: OrderRecord) {
  // Google Apps Script web app that appends a row (script in README).
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return "not configured";
  const c = o.customer;
  const t = o.totals as Record<string, number>;
  await withTimeout((signal) =>
    fetch(url, {
      method: "POST",
      signal,
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret: process.env.GOOGLE_SHEET_SECRET || "",
        row: {
          order: o.orderNumber,
          date: new Date(o.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }),
          status: o.status,
          name: c.name,
          phone: c.phoneDisplay,
          email: c.email,
          emirate: c.emirate,
          area: c.area,
          address: c.address,
          deliveryTime: c.deliveryTime,
          notes: c.notes,
          items: (o.items as PricedLine[])
            .map((l) => `${l.qty} × ${l.title}${l.contents && l.type !== "product" ? ` (${l.contents.map((x) => `${x.qty} × ${x.name}`).join(", ")})` : ""}`)
            .join("; "),
          savings: t.totalSavings,
          delivery: t.deliveryFee,
          total: t.total,
        },
      }),
    }),
  );
  return "sent";
}

export async function notifyOwner(o: OrderRecord) {
  const channels = { email, whatsapp, sheet };
  const entries = await Promise.all(
    Object.entries(channels).map(async ([name, fn]) => {
      try {
        return [name, await fn(o)] as const;
      } catch (e) {
        console.error(`Order ${o.orderNumber}: ${name} notification failed`, e);
        return [name, `failed: ${(e as Error).message}`.slice(0, 200)] as const;
      }
    }),
  );
  return Object.fromEntries(entries) as Record<string, string>;
}

export async function notifyMessage(m: { name: string; phone: string; email: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;
  if (!key || !to) return;
  await withTimeout((signal) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || "Roots and Muds <onboarding@resend.dev>",
        to: to.split(",").map((x) => x.trim()),
        reply_to: m.email || undefined,
        subject: `Website message from ${m.name}`,
        text: `${m.message}\n\n${m.name}\n${m.phone}\n${m.email}`,
      }),
    }),
  ).catch((e) => console.error("Contact email failed", e));
}
