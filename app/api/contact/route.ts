import { NextResponse } from "next/server";
import { saveMessage } from "@/lib/db";
import { notifyMessage } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || b.website) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const m = { name: s(b.name, 100), phone: s(b.phone, 30), email: s(b.email, 150), message: s(b.message, 2000) };
  if (!m.name || !m.message || (!m.phone && !m.email)) {
    return NextResponse.json({ error: "Add your name, a phone number or email, and your message." }, { status: 400 });
  }
  try {
    await saveMessage(m);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Your message couldn't be saved. Please WhatsApp us instead." }, { status: 500 });
  }
  await notifyMessage(m);
  return NextResponse.json({ ok: true });
}
