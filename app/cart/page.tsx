import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap">
      <header className="page-head" style={{ paddingBottom: "1rem" }}>
        <h1>
          Your <span className="it">bag</span>
        </h1>
      </header>
      <CartView />
    </div>
  );
}
