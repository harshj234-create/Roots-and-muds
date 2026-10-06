import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Admin login: one shared password from the ADMIN_PASSWORD environment variable.
// A signed cookie keeps the owner logged in for 30 days.

const COOKIE = "rm_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

function password() {
  const p = process.env.ADMIN_PASSWORD;
  if (p) return p;
  return process.env.NODE_ENV === "production" ? null : "admin"; // local development only
}

function secret() {
  return process.env.ADMIN_SESSION_SECRET || `rm-session:${password() ?? ""}`;
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export const adminConfigured = () => password() !== null;

export function checkPassword(input: string) {
  const p = password();
  return !!p && safeEqual(sign(`pw:${input}`), sign(`pw:${p}`));
}

export async function startSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  const value = `${expires}.${sign(`session:${expires}`)}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(`session:${exp}`));
}
