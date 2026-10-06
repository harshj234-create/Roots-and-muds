import type { PricedCart } from "@/lib/pricing";

/** Totals block shared by cart, checkout and confirmation. */
export function Totals({ c, compact }: { c: Pick<PricedCart, "originalTotal" | "totalSavings" | "bundleSavings" | "merchandiseTotal" | "deliveryFee" | "total" | "freeDeliveryGap">; compact?: boolean }) {
  return (
    <dl>
      <dt>Subtotal</dt>
      <dd>AED {c.originalTotal}</dd>
      {c.totalSavings > 0 && (
        <>
          <dt>Bundle savings</dt>
          <dd className="saved">−AED {c.totalSavings}</dd>
        </>
      )}
      <dt>Delivery</dt>
      <dd>{c.deliveryFee ? `AED ${c.deliveryFee}` : "Free"}</dd>
      <dt className="total-row">Total{compact ? "" : ", cash on delivery"}</dt>
      <dd className="total-row">AED {c.total}</dd>
    </dl>
  );
}
