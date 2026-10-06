import type { Metadata } from "next";
import { site } from "@/lib/site";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="wrap">
      <header className="page-head" style={{ paddingBottom: "1rem" }}>
        <h1>Checkout.</h1>
        <p className="lede">No account needed. You pay in cash when your order arrives.</p>
      </header>
      <CheckoutForm emirates={site.emirates} slots={site.deliverySlots} />
    </div>
  );
}
