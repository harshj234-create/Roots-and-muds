"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./providers";
import { CartIcon, CloseIcon, LogoMark, MenuIcon, WhatsAppIcon } from "./icons";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/bundles", label: "Bundles" },
  { href: "/about", label: "Our story" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Header({ freeFrom, deliveryFee }: { freeFrom: number; deliveryFee: number }) {
  const path = usePathname();
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  if (path.startsWith("/admin")) return null;

  return (
    <>
      <p className="announce">
        Pay cash on delivery, anywhere in the UAE. Free delivery from AED {freeFrom}.
        <span className="sr-only"> (otherwise AED {deliveryFee})</span>
      </p>
      <header className="site-header">
        <div className="wrap header-row">
          <Link href="/" className="logo" aria-label="Roots and Muds home">
            <LogoMark />
            <span>Roots and Muds</span>
          </Link>
          <nav className="nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <Link href="/cart" className="cart-link" aria-label={`Cart, ${ready ? count : 0} items`}>
            <CartIcon />
            <span className="cart-count" aria-hidden="true">
              {ready ? count : 0}
            </span>
          </Link>
          <button
            className="icon-btn menu-btn"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
        {open && (
          <nav id="mobile-nav" className="wrap mobile-nav" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
            <Link href="/delivery-returns">Delivery & returns</Link>
          </nav>
        )}
      </header>
    </>
  );
}

export function WhatsAppFloat({ number }: { number: string }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <a
      className="wa-float"
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hello Roots and Muds, I have a question.")}`}
      target="_blank"
      rel="noopener"
      aria-label="Chat with us on WhatsApp"
    >
      <WhatsAppIcon />
    </a>
  );
}

export function Toast() {
  const { toast } = useCart();
  const path = usePathname();
  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast}</span>
      {path !== "/cart" && <Link href="/cart">View cart</Link>}
    </div>
  );
}
