import { isAdmin } from "@/lib/auth";
import { listOrders, ORDER_STATUSES } from "@/lib/db";
import type { PricedLine } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not logged in", { status: 401 });
  const status = new URL(req.url).searchParams.get("status");
  const orders = await listOrders(ORDER_STATUSES.find((s) => s === status));
  const header = ["Order", "Date (Dubai)", "Status", "Name", "Phone", "Email", "Emirate", "Area", "Address", "Delivery time", "Notes", "Items", "Subtotal", "Savings", "Delivery", "Total (COD)"];
  const rows = orders.map((o) => {
    const c = o.customer;
    const t = o.totals as any;
    const items = (o.items as PricedLine[])
      .map((l) => `${l.qty} x ${l.title}${l.contents && l.type !== "product" ? ` (${l.contents.map((x) => `${x.qty} x ${x.name}`).join(", ")})` : ""}${l.giftBox ? " + gift box" : ""}`)
      .join("; ");
    return [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Dubai" }),
      o.status,
      c.name,
      c.phoneDisplay,
      c.email,
      c.emirate,
      c.area,
      c.address,
      c.deliveryTime,
      c.notes,
      items,
      t.originalTotal,
      t.totalSavings,
      t.deliveryFee,
      t.total,
    ].map(cell);
  });
  const csv = "﻿" + [header.map(cell), ...rows].map((r) => r.join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="roots-and-muds-orders-${date}.csv"`,
    },
  });
}
