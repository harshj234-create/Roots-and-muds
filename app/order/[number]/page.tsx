import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/db";
import { site, whatsappLink } from "@/lib/site";
import type { PricedLine } from "@/lib/pricing";
import { CheckIcon, WhatsAppIcon } from "@/components/icons";
import { Totals } from "@/components/order-summary";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ t?: string }> }) {
  const { number } = await params;
  const { t } = await searchParams;
  const order = await getOrder(number).catch(() => null);
  if (!order || !t || order.token !== t) notFound();

  const items = order.items as PricedLine[];
  const totals = order.totals as any;
  const c = order.customer;
  const msg = [
    `Hello Roots and Muds, I'd like to confirm my order ${order.orderNumber}.`,
    "",
    ...items.map((l) => `${l.qty} × ${l.title}${l.contents && l.type !== "product" ? ` (${l.contents.map((x) => `${x.qty} × ${x.name}`).join(", ")})` : ""}`),
    "",
    `Total: AED ${totals.total} (cash on delivery)`,
    `Name: ${c.name}`,
    `Address: ${c.address}, ${c.area}, ${c.emirate}`,
    c.deliveryTime && c.deliveryTime !== "Any time" ? `Preferred time: ${c.deliveryTime}` : "",
  ]
    .filter((x, i, arr) => x !== "" || arr[i - 1] !== "")
    .join("\n");

  return (
    <div className="wrap narrow">
      <div className="confirm">
        <div className="tick" aria-hidden="true">
          <CheckIcon width={36} height={36} />
        </div>
        <h1 style={{ fontSize: "var(--step-4)" }}>Thank you, {c.name.split(" ")[0]}. Your order is placed.</h1>
        <p className="num">Order {order.orderNumber}</p>
        <p className="muted">We'll call or WhatsApp you on {c.phoneDisplay} to confirm and arrange delivery.</p>
      </div>

      <div className="cod-callout">
        <span className="muted">Pay cash on delivery</span>
        <span className="amt">AED {totals.total}</span>
        <span className="small muted">Please have cash ready for the courier.</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <a className="btn btn-wa" href={whatsappLink(msg)} target="_blank" rel="noopener">
          <WhatsAppIcon width={20} height={20} />
          Confirm on WhatsApp
        </a>
        <p className="small muted" style={{ marginTop: "0.6rem" }}>
          Optional, but it helps us deliver faster.
        </p>
      </div>

      <section className="summary" aria-labelledby="sum">
        <h2 id="sum">Order summary</h2>
        <ul className="box-items" style={{ maxHeight: "none" }}>
          {items.map((l) => (
            <li key={l.key}>
              <span>
                {l.qty} × {l.title}
                {l.contents && l.type !== "product" && (
                  <span className="small muted" style={{ display: "block" }}>
                    {l.contents.map((x) => `${x.qty > 1 ? `${x.qty} × ` : ""}${x.name}`).join(", ")}
                  </span>
                )}
                {l.giftBox && (
                  <span className="small muted" style={{ display: "block" }}>
                    Gift box{l.giftNote ? `: “${l.giftNote}”` : ""}
                  </span>
                )}
              </span>
              <span>AED {l.lineTotal}</span>
            </li>
          ))}
        </ul>
        <Totals c={totals} />
        <h3 style={{ fontSize: "var(--step-1)", marginTop: "1.5rem" }}>Delivering to</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          {c.name}
          <br />
          {c.address}
          <br />
          {c.area}, {c.emirate}
          {c.deliveryTime && (
            <>
              <br />
              Preferred time: {c.deliveryTime}
            </>
          )}
          {c.notes && (
            <>
              <br />
              Notes: {c.notes}
            </>
          )}
        </p>
      </section>
      <p style={{ textAlign: "center", marginTop: "2rem" }}>
        Need to change something? Call <a href={`tel:${site.phoneE164}`}>{site.phoneDisplay}</a>. <Link href="/shop">Continue shopping</Link>
      </p>
    </div>
  );
}
