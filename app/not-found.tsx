import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap empty">
      <div className="pebble-mark" aria-hidden="true" />
      <h1 style={{ fontSize: "var(--step-4)" }}>This page doesn't exist</h1>
      <p className="muted">It may have moved when we rebuilt our shop. Everything we make is in the shop.</p>
      <Link href="/shop" className="btn btn-primary">
        Go to the shop
      </Link>
    </div>
  );
}
