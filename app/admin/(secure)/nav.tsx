"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/catalog", label: "Products, bundles & prices" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/", label: "View shop" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </>
  );
}
