"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart, useStoreData } from "@/components/providers";
import { Totals } from "@/components/order-summary";
import { CashIcon } from "@/components/icons";
import { priceCart } from "@/lib/pricing";
import { normalizeUaeMobile } from "@/lib/site";

type Errors = Partial<Record<"name" | "phone" | "email" | "emirate" | "area" | "address", string>>;

export function CheckoutForm({ emirates, slots }: { emirates: string[]; slots: string[] }) {
  const store = useStoreData();
  const { lines, ready, clear } = useCart();
  const router = useRouter();
  const c = useMemo(() => priceCart(lines, store), [lines, store]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);

  if (!ready || (sending && !lines.length)) return <div style={{ minHeight: "50vh" }} aria-busy="true" />;
  if (!lines.length) {
    return (
      <div className="empty">
        <h2>Your bag is empty</h2>
        <Link className="btn btn-primary" href="/shop">
          Go to the shop
        </Link>
      </div>
    );
  }

  function validate(d: Record<string, string>): Errors {
    const e: Errors = {};
    if ((d.name ?? "").trim().length < 2) e.name = "Enter your full name.";
    if (!normalizeUaeMobile(d.phone ?? "")) e.phone = "Enter a UAE mobile number, for example 050 123 4567.";
    if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Check your email address, or leave it empty.";
    if (!d.emirate) e.emirate = "Choose your emirate.";
    if (!(d.area ?? "").trim()) e.area = "Enter your area.";
    if ((d.address ?? "").trim().length < 5) e.address = "Enter your building, flat or villa number and street.";
    return e;
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(ev.currentTarget)) as Record<string, string>;
    const e = validate(d);
    setErrors(e);
    setFormError("");
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: d, lines, expectedTotal: c.total, website: d.website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(data.error ?? "Your order couldn't be placed. Please try again.");
        setSending(false);
        return;
      }
      router.replace(`/order/${data.orderNumber}?t=${data.token}`);
      clear();
    } catch {
      setFormError("Your order couldn't be sent. Check your internet connection and try again.");
      setSending(false);
    }
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <span className="err" id={`e-${k}`}>
        {errors[k]}
      </span>
    ) : null;
  const a = (k: keyof Errors) => ({ id: `f-${k}`, name: k, "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `e-${k}` : undefined });

  return (
    <form className="cart-layout" onSubmit={onSubmit} noValidate>
      <div>
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}
        <fieldset>
          <legend>Your details</legend>
          <div className="field">
            <label htmlFor="f-name">Full name</label>
            <input {...a("name")} autoComplete="name" maxLength={100} required />
            {err("name")}
          </div>
          <div className="two">
            <div className="field">
              <label htmlFor="f-phone">
                Mobile number <span className="hint">(UAE, we'll call to confirm)</span>
              </label>
              <input {...a("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="05X XXX XXXX" maxLength={20} required />
              {err("phone")}
            </div>
            <div className="field">
              <label htmlFor="f-email">
                Email <span className="hint">(optional)</span>
              </label>
              <input {...a("email")} type="email" autoComplete="email" maxLength={150} />
              {err("email")}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Delivery address</legend>
          <div className="two">
            <div className="field">
              <label htmlFor="f-emirate">Emirate</label>
              <select {...a("emirate")} defaultValue="" required autoComplete="address-level1">
                <option value="" disabled>
                  Choose your emirate
                </option>
                {emirates.map((e) => (
                  <option key={e}>{e}</option>
                ))}
              </select>
              {err("emirate")}
            </div>
            <div className="field">
              <label htmlFor="f-area">Area</label>
              <input {...a("area")} autoComplete="address-level2" placeholder="e.g. Al Barsha" maxLength={100} required />
              {err("area")}
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-address">Building, flat or villa, and street</label>
            <textarea {...a("address")} autoComplete="street-address" maxLength={300} style={{ minHeight: 80 }} placeholder="e.g. Flat 1204, Marina Heights, Al Marsa Street" required />
            {err("address")}
          </div>
          <div className="two">
            <div className="field">
              <label htmlFor="f-time">Preferred delivery time</label>
              <select id="f-time" name="deliveryTime" defaultValue={slots[0]}>
                {slots.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-notes">
                Delivery notes <span className="hint">(optional)</span>
              </label>
              <input id="f-notes" name="notes" maxLength={500} placeholder="Landmark, gate code, or 'it's a gift'" />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Payment</legend>
          <label className="pay-option">
            <input type="radio" name="payment" value="cod" defaultChecked readOnly />
            <CashIcon style={{ color: "var(--sage-deep)", flex: "none" }} />
            <span>
              <strong>Cash on Delivery</strong>
              <span className="small muted">Pay AED {c.total} in cash when your order arrives.</span>
            </span>
          </label>
        </fieldset>
        <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <aside className="summary" aria-label="Order summary">
        <h2>Your order</h2>
        <ul className="box-items" style={{ maxHeight: "none" }}>
          {c.lines.map((l) => (
            <li key={l.key}>
              <span>
                {l.qty} × {l.title}
                {l.contents && l.type !== "product" && (
                  <span className="small muted" style={{ display: "block" }}>
                    {l.contents.map((x) => `${x.qty > 1 ? `${x.qty} × ` : ""}${x.name}`).join(", ")}
                  </span>
                )}
              </span>
              <span>AED {l.lineTotal}</span>
            </li>
          ))}
        </ul>
        <Totals c={c} />
        {c.problems.length > 0 && (
          <p className="form-error">
            {c.problems.join(". ")}. <Link href="/cart">Update your bag</Link>
          </p>
        )}
        <button className="btn btn-primary btn-block" disabled={sending || c.problems.length > 0}>
          {sending ? "Placing your order…" : `Place order, pay AED ${c.total} on delivery`}
        </button>
        <p className="small muted" style={{ marginTop: "0.9rem", marginBottom: 0 }}>
          We'll call or WhatsApp you to confirm before delivery. <Link href="/cart">Edit bag</Link>
        </p>
      </aside>
    </form>
  );
}
