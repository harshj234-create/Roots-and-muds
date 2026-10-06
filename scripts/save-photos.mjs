// Downloads every product/brand photo that still points at Shopify into public/images/shop/
// and updates the data files to use the local copies. Runs automatically on GitHub
// (.github/workflows/save-photos.yml), or locally with: npm run save-photos
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const dir = new URL("../public/images/shop/", import.meta.url);
mkdirSync(dir, { recursive: true });
const files = ["../data/products.json", "../data/site.json"].map((f) => new URL(f, import.meta.url));
let saved = 0, failed = 0;

async function localise(url) {
  if (typeof url !== "string" || !/^https:\/\/(cdn\.shopify\.com|www\.rootsandmuds\.com)\//.test(url)) return url;
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop());
  const target = new URL(name, dir);
  if (!existsSync(target)) {
    const res = await fetch(url);
    if (!res.ok) { console.error(`Could not download ${url}: ${res.status}`); failed++; return url; }
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    saved++;
  }
  return `/images/shop/${name}`;
}

async function walk(v) {
  if (Array.isArray(v)) return Promise.all(v.map(walk));
  if (v && typeof v === "object") {
    for (const k of Object.keys(v)) v[k] = await walk(v[k]);
    return v;
  }
  return localise(v);
}

for (const f of files) {
  const data = JSON.parse(readFileSync(f, "utf8"));
  await walk(data);
  writeFileSync(f, JSON.stringify(data, null, 2) + "\n");
}
console.log(`Saved ${saved} photos, ${failed} failed.`);
if (failed) process.exitCode = 1;
