import site from "@/data/site.json";

export { site };

export function whatsappLink(text?: string) {
  return `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Accepts 05X XXX XXXX, 5XXXXXXXX, +9715XXXXXXXX, 009715XXXXXXXX. Returns +9715XXXXXXXX or null. */
export function normalizeUaeMobile(input: string): string | null {
  const digits = (input || "").replace(/[\s\-().]/g, "").replace(/^\+/, "").replace(/^00/, "");
  const m = digits.match(/^(?:971|0)?(5[024568]\d{7})$/);
  return m ? `+971${m[1]}` : null;
}

export function formatUaeMobile(e164: string) {
  const m = e164.match(/^\+971(5\d)(\d{3})(\d{4})$/);
  return m ? `0${m[1]} ${m[2]} ${m[3]}` : e164;
}
