type P = React.SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const LogoMark = (p: P) => (
  <svg viewBox="0 0 40 40" aria-hidden="true" {...p}>
    <path d="M4 26c1-7 7-11 16-11s15 4 16 11c1 7-6 10-16 10S3 33 4 26z" fill="#B48558" />
    <path d="M20 15V4M20 9c-3-1-5-3-6-6 3 0 5 2 6 6zm0 2c2-3 5-4 8-4-1 3-4 5-8 4z" fill="none" stroke="#3E4A36" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 26c2 2 3 4 3 7M20 25v8M26 26c-2 2-3 4-3 7" fill="none" stroke="#7A4E2D" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
  </svg>
);

export const WhatsAppIcon = (p: P) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor" {...p}>
    <path d="M16 3.2C8.9 3.2 3.2 8.9 3.2 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8c1.8 1 3.9 1.6 6.2 1.6 7.1 0 12.8-5.7 12.8-12.8S23.1 3.2 16 3.2zm0 23.4c-2 0-3.9-.5-5.6-1.5l-.4-.2-4 1.1 1.1-3.9-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.9 4.8-10.7 10.7-10.7S26.7 10.1 26.7 16 21.9 26.6 16 26.6zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z" />
  </svg>
);

export const CartIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M5 8h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9L5 8z" />
    <path d="M9 10V6.5a3 3 0 0 1 6 0V10" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} strokeWidth={2} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const PhoneIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const CashIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9.5v5M18 9.5v5" />
  </svg>
);

// Trust badges
const Rabbit = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M9 13c-2.5 0-4.5 2-4.5 4.5S6.5 21 9.5 21h6c2.5 0 4-1.5 4-3.5 0-2.5-2-4.5-5-4.5" />
    <path d="M9.5 13c-1-3-1.5-6-1-9 1.5.5 2.5 3 3 6M12 12.5c.5-3 1.5-6 3.5-8 .8 2 .2 5-1.5 8" />
    <circle cx="15.5" cy="16.5" r=".6" fill="currentColor" />
  </svg>
);
const Leaf = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15" />
    <path d="M5 19l7-7" />
  </svg>
);
const Sprout = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 21v-9M12 12c-4 0-7-2.5-7-7 4 0 7 2.5 7 7zM12 14c0-4 2.5-7 7-7 0 4-2.5 7-7 7z" />
  </svg>
);
const Sun = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
  </svg>
);
const Hand = (p: P) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v7M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 7-6 7-2.5 0-4-1-5.5-3L3.8 15a1.6 1.6 0 0 1 2.4-2L8 15" />
  </svg>
);
export const badgeIcon: Record<string, (p: P) => React.ReactElement> = {
  "Cruelty Free": Rabbit,
  "100% Natural Ingredients": Leaf,
  Vegan: Sprout,
  Organic: Sun,
  Handmade: Hand,
};
