import "server-only";
import postgres from "postgres";
import { promises as fs } from "node:fs";
import path from "node:path";

// Storage for orders, contact messages and admin edits.
// Production: Postgres (DATABASE_URL, e.g. Neon from the Vercel Marketplace). Tables are created automatically.
// Local development without DATABASE_URL: a JSON file in .data/db.json.

export const ORDER_STATUSES = ["New", "Confirmed", "Out for delivery", "Delivered", "Cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface OrderRecord {
  orderNumber: string;
  token: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customer: Record<string, string>;
  items: unknown[];
  totals: Record<string, unknown>;
  notifications?: Record<string, string>;
}

export interface MessageRecord {
  id: number;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  message: string;
}

const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL || process.env.POSTGRES_URL;

// ---------- Postgres ----------

let sql: ReturnType<typeof postgres> | null = null;
let ready: Promise<void> | null = null;

function pg() {
  if (!sql) sql = postgres(url!, { ssl: url!.includes("localhost") ? false : "require", max: 3, idle_timeout: 20 });
  if (!ready) {
    const s = sql;
    ready = (async () => {
      await s`CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001`;
      await s`CREATE TABLE IF NOT EXISTS orders (
        order_number text PRIMARY KEY,
        token text NOT NULL,
        status text NOT NULL DEFAULT 'New',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        customer jsonb NOT NULL,
        items jsonb NOT NULL,
        totals jsonb NOT NULL,
        notifications jsonb
      )`;
      await s`CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`;
      await s`CREATE TABLE IF NOT EXISTS messages (
        id serial PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now(),
        name text, phone text, email text, message text
      )`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready.then(() => sql!);
}

const rowToOrder = (r: any): OrderRecord => ({
  orderNumber: r.order_number,
  token: r.token,
  status: r.status,
  createdAt: new Date(r.created_at).toISOString(),
  updatedAt: new Date(r.updated_at).toISOString(),
  customer: r.customer,
  items: r.items,
  totals: r.totals,
  notifications: r.notifications ?? undefined,
});

// ---------- JSON file (local development only) ----------

interface FileDB {
  nextOrder: number;
  orders: OrderRecord[];
  settings: Record<string, unknown>;
  messages: MessageRecord[];
}
const file = path.join(process.cwd(), ".data", "db.json");
let lock: Promise<unknown> = Promise.resolve();

async function readFile(): Promise<FileDB> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return { nextOrder: 1001, orders: [], settings: {}, messages: [] };
  }
}
function withFile<T>(fn: (db: FileDB) => T | Promise<T>, write = false): Promise<T> {
  if (process.env.VERCEL || process.env.NETLIFY) {
    return Promise.reject(new Error("DATABASE_URL is not set. Connect a Postgres database in your host's settings (see README)."));
  }
  const run = lock.then(async () => {
    const db = await readFile();
    const result = await fn(db);
    if (write) {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(db, null, 2));
    }
    return result;
  });
  lock = run.catch(() => undefined);
  return run;
}

// ---------- Public API ----------

export const usingDatabase = !!url;

export async function createOrder(o: Omit<OrderRecord, "orderNumber" | "createdAt" | "updatedAt" | "status">): Promise<OrderRecord> {
  if (url) {
    const s = await pg();
    const [{ n }] = await s`SELECT nextval('order_number_seq') AS n`;
    const orderNumber = `RM-${n}`;
    const [row] = await s`INSERT INTO orders (order_number, token, status, customer, items, totals)
      VALUES (${orderNumber}, ${o.token}, 'New', ${s.json(o.customer as any)}, ${s.json(o.items as any)}, ${s.json(o.totals as any)})
      RETURNING *`;
    return rowToOrder(row);
  }
  return withFile((db) => {
    const now = new Date().toISOString();
    const rec: OrderRecord = { ...o, orderNumber: `RM-${db.nextOrder++}`, status: "New", createdAt: now, updatedAt: now };
    db.orders.push(rec);
    return rec;
  }, true);
}

export async function setOrderNotifications(orderNumber: string, n: Record<string, string>) {
  if (url) {
    const s = await pg();
    await s`UPDATE orders SET notifications = ${s.json(n)} WHERE order_number = ${orderNumber}`;
    return;
  }
  await withFile((db) => {
    const o = db.orders.find((x) => x.orderNumber === orderNumber);
    if (o) o.notifications = n;
  }, true);
}

export async function getOrder(orderNumber: string): Promise<OrderRecord | null> {
  if (url) {
    const s = await pg();
    const [row] = await s`SELECT * FROM orders WHERE order_number = ${orderNumber}`;
    return row ? rowToOrder(row) : null;
  }
  return withFile((db) => db.orders.find((x) => x.orderNumber === orderNumber) ?? null);
}

export async function listOrders(status?: string): Promise<OrderRecord[]> {
  if (url) {
    const s = await pg();
    const rows = status
      ? await s`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC LIMIT 1000`
      : await s`SELECT * FROM orders ORDER BY created_at DESC LIMIT 1000`;
    return rows.map(rowToOrder);
  }
  return withFile((db) =>
    db.orders.filter((o) => !status || o.status === status).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
}

export async function updateOrderStatus(orderNumber: string, status: OrderStatus) {
  if (url) {
    const s = await pg();
    const r = await s`UPDATE orders SET status = ${status}, updated_at = now() WHERE order_number = ${orderNumber}`;
    return r.count > 0;
  }
  return withFile((db) => {
    const o = db.orders.find((x) => x.orderNumber === orderNumber);
    if (!o) return false;
    o.status = status;
    o.updatedAt = new Date().toISOString();
    return true;
  }, true);
}

export async function getSetting<T>(key: string): Promise<T | null> {
  if (url) {
    const s = await pg();
    const [row] = await s`SELECT value FROM settings WHERE key = ${key}`;
    return (row?.value as T) ?? null;
  }
  return withFile((db) => (db.settings[key] as T) ?? null);
}

export async function setSetting(key: string, value: unknown) {
  if (url) {
    const s = await pg();
    await s`INSERT INTO settings (key, value) VALUES (${key}, ${s.json(value as any)})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
    return;
  }
  await withFile((db) => {
    if (value === null) delete db.settings[key];
    else db.settings[key] = value;
  }, true);
}

export async function deleteSetting(key: string) {
  if (url) {
    const s = await pg();
    await s`DELETE FROM settings WHERE key = ${key}`;
    return;
  }
  await withFile((db) => {
    delete db.settings[key];
  }, true);
}

export async function saveMessage(m: Omit<MessageRecord, "id" | "createdAt">) {
  if (url) {
    const s = await pg();
    await s`INSERT INTO messages (name, phone, email, message) VALUES (${m.name}, ${m.phone}, ${m.email}, ${m.message})`;
    return;
  }
  await withFile((db) => {
    db.messages.push({ ...m, id: db.messages.length + 1, createdAt: new Date().toISOString() });
  }, true);
}

export async function listMessages(): Promise<MessageRecord[]> {
  if (url) {
    const s = await pg();
    const rows = await s`SELECT * FROM messages ORDER BY created_at DESC LIMIT 200`;
    return rows.map((r: any) => ({ id: r.id, createdAt: new Date(r.created_at).toISOString(), name: r.name, phone: r.phone, email: r.email, message: r.message }));
  }
  return withFile((db) => [...db.messages].reverse());
}
