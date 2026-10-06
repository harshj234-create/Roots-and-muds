import Link from "next/link";
import { listOrders, ORDER_STATUSES } from "@/lib/db";
import type { PricedLine } from "@/lib/pricing";
import { setStatus } from "../../actions";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Dubai", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const all = await listOrders();
  const filter = ORDER_STATUSES.find((s) => s === status);
  const orders = filter ? all.filter((o) => o.status === filter) : all;
  const count = (s: string) => all.filter((o) => o.status === s).length;
  const toCollect = all.filter((o) => o.status !== "Cancelled" && o.status !== "Delivered").reduce((s, o) => s + Number((o.totals as any).total || 0), 0);

  return (
    <>
      <div className="section-head" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "var(--step-4)", margin: 0 }}>Orders</h1>
          <p>
            {all.length} orders in total. AED {toCollect} still to collect on open orders.
          </p>
        </div>
        <a className="btn btn-ghost btn-sm" href={`/admin/orders/export${filter ? `?status=${encodeURIComponent(filter)}` : ""}`}>
          Export {filter ? `“${filter}”` : "all"} to CSV
        </a>
      </div>
      <div className="tabs" role="group" aria-label="Filter by status">
        <Link className="tab" aria-selected={!filter} href="/admin/orders">
          All ({all.length})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} className="tab" aria-selected={filter === s} href={`/admin/orders?status=${encodeURIComponent(s)}`}>
            {s} ({count(s)})
          </Link>
        ))}
      </div>

      {orders.length === 0 && <p className="muted">No {filter ? `“${filter}” ` : ""}orders yet. New orders appear here as soon as they're placed.</p>}

      {orders.map((o) => {
        const c = o.customer;
        const t = o.totals as any;
        const phoneDigits = c.phone?.replace(/^\+/, "");
        return (
          <article key={o.orderNumber} className="order-card">
            <header>
              <div>
                <strong style={{ fontFamily: "var(--font-serif)", fontSize: "1.3rem", fontWeight: 400 }}>{o.orderNumber}</strong>{" "}
                <span className={`status status-${o.status.split(" ")[0]}`}>{o.status}</span>
                <div className="small muted">{fmt(o.createdAt)}</div>
              </div>
              <form key={o.status} action={setStatus} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input type="hidden" name="orderNumber" value={o.orderNumber} />
                <label className="sr-only" htmlFor={`s-${o.orderNumber}`}>
                  Status
                </label>
                <select id={`s-${o.orderNumber}`} name="status" defaultValue={o.status} style={{ width: "auto", minHeight: 40, padding: "0.35rem 2.4rem 0.35rem 0.75rem" }}>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm">Update</button>
              </form>
            </header>
            <div className="cols">
              <div>
                <strong>{c.name}</strong>
                <br />
                <a href={`tel:${c.phone}`}>{c.phoneDisplay}</a>{" "}
                <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener">
                  WhatsApp
                </a>
                {c.email && (
                  <>
                    <br />
                    <a href={`mailto:${c.email}`}>{c.email}</a>
                  </>
                )}
                <p style={{ margin: "0.5rem 0 0" }}>
                  {c.address}
                  <br />
                  {c.area}, {c.emirate}
                  <br />
                  <span className="muted">Time: {c.deliveryTime || "Any"}</span>
                  {c.notes && (
                    <>
                      <br />
                      <span className="muted">Notes: {c.notes}</span>
                    </>
                  )}
                </p>
              </div>
              <div>
                <ul>
                  {(o.items as PricedLine[]).map((l) => (
                    <li key={l.key}>
                      {l.qty} × {l.title}, AED {l.lineTotal}
                      {l.contents && l.type !== "product" && <div className="small muted">{l.contents.map((x) => `${x.qty} × ${x.name}`).join(", ")}</div>}
                      {l.giftBox && <div className="small muted">Gift box{l.giftNote ? `: “${l.giftNote}”` : ""}</div>}
                    </li>
                  ))}
                </ul>
                <p style={{ margin: "0.5rem 0 0" }}>
                  {t.totalSavings > 0 && <span className="muted">Savings AED {t.totalSavings}. </span>}
                  <span className="muted">Delivery {t.deliveryFee ? `AED ${t.deliveryFee}` : "free"}. </span>
                  <strong>Collect AED {t.total}</strong>
                </p>
                {o.notifications && (
                  <p className="small muted" style={{ margin: "0.4rem 0 0" }}>
                    Alerts: email {o.notifications.email}, WhatsApp {o.notifications.whatsapp}, sheet {o.notifications.sheet}
                  </p>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
