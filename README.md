# Roots and Muds online shop

The new rootsandmuds.ae: a fast, mobile-first shop with **Cash on Delivery only** (no online payments), ready-made bundles, a Mix & Match bundle builder, automatic bundle savings in the cart, and a password-protected admin page for orders, products and prices.

Built with Next.js. It runs free on Vercel's Hobby plan for a shop of this size, with a free Neon Postgres database.

---

## 1. Launch it (about 30–45 minutes)

You need free accounts on **GitHub** and **Vercel**. Sign up to Vercel *with* your GitHub account.

### Step 1: Put the code on GitHub
1. On github.com click **New repository**, name it `roots-and-muds`, keep it **Private**, and create it.
2. On the empty repository page click **uploading an existing file**.
3. Unzip this project on your computer, open the folder, select **everything inside it** and drag it into the browser. Click **Commit changes**.
   (GitHub's web upload takes up to 100 files at once; this project is under that.)

### Step 2: Create the site on Vercel
1. On vercel.com click **Add New → Project**, choose the `roots-and-muds` repository and click **Deploy**. Leave all settings as they are.
2. The first deploy will show the shop at a `…vercel.app` address. Orders won't save yet; that's the next step.

### Step 3: Connect the database (stores orders, messages and admin edits)
1. In your Vercel project open **Storage → Create Database → Neon (Postgres)** and follow the prompts (the free plan is enough).
2. Connect it to the project. Vercel adds `DATABASE_URL` for you. The tables are created automatically on the first order.

### Step 4: Set your admin password
In **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | A long password only you know |
| `ADMIN_SESSION_SECRET` | Any long random text (e.g. mash the keyboard for 40 characters) |
| `SITE_URL` | `https://rootsandmuds.ae` |

Then go to **Deployments**, open the ⋯ menu on the latest one and click **Redeploy** (needed after any variable change).

Admin is at **/admin**: e.g. `https://rootsandmuds.ae/admin`.

### Step 5: New-order alerts
Each channel switches on as soon as its variables are set. You can use all three. If one fails, the order is still saved and the others still send; the admin page shows what happened under each order ("Alerts: …").

**Email (Resend, free up to 3,000 emails a month)**
1. Sign up at resend.com and create an API key.
2. Add `RESEND_API_KEY` and `ORDER_EMAIL_TO` (your email; separate several with commas).
3. Until you verify your domain, Resend only delivers to the email address you signed up with. To send from `orders@rootsandmuds.ae`, add the domain in Resend (it gives you DNS records to copy), then set `ORDER_EMAIL_FROM` to `Roots and Muds <orders@rootsandmuds.ae>`.

**WhatsApp message to your phone (CallMeBot, free)**
1. Follow the WhatsApp setup on callmebot.com from the phone that should receive orders (050 550 6800). You send their bot one message and it replies with your API key.
2. Add `CALLMEBOT_API_KEY`. `CALLMEBOT_PHONE` defaults to 971505506800.

CallMeBot is a free third-party service meant for personal alerts. It works well for a small shop but has no guarantee; keep email switched on too. If you later want official WhatsApp Business API messages, a developer can add it in `lib/notify.ts`.

**Google Sheet (a row per order)**
1. Create a Google Sheet. Choose **Extensions → Apps Script**, delete what's there and paste the contents of `docs/google-sheet-script.gs`.
2. Change `SECRET` at the top to any password-like text.
3. Click **Deploy → New deployment → Web app**, set *Execute as: Me* and *Who has access: Anyone*, then **Deploy** and allow access.
4. In Vercel add `GOOGLE_SHEET_WEBHOOK_URL` (the web app URL) and `GOOGLE_SHEET_SECRET` (the same secret).

Redeploy after adding variables.

### Step 6: Point rootsandmuds.ae at the new site
1. In Shopify, remove rootsandmuds.ae from **Settings → Domains** (or cancel the store once you're happy).
2. In Vercel open **Settings → Domains**, add `rootsandmuds.ae` and `www.rootsandmuds.ae`.
3. Vercel shows the exact DNS records to add. Add them where you bought the domain. Changes usually work within an hour.

Old Shopify links to collections, the contact/FAQ/about pages and shipping/refund policies redirect to the new pages automatically (see `next.config.ts`). Product links keep working if your Shopify product handles match the new addresses (e.g. `/products/kumkumadi-soap`); if not, add redirects in `next.config.ts`.

### Step 7: Test before telling customers
Place a test order from your phone, check the email/WhatsApp/sheet arrive, then set that order to **Cancelled** in admin.

---

## 2. Running the shop

### Orders (/admin/orders)
- See every order with customer, address, items, gift notes and the **amount to collect**.
- Filter by status: New, Confirmed, Out for delivery, Delivered, Cancelled. Change status with **Update**.
- **Export to CSV** opens in Excel or Google Sheets (the export follows the filter you're viewing).
- Tap the customer's number to call, or **WhatsApp** to message them.

### Products, bundles and prices (/admin/catalog)
Change names, prices, sizes, descriptions, ingredients, stock, bestsellers; bundle contents, prices and visibility; discount tiers, the Complete Routine discount, the gift box price and delivery fee. Click **Save changes** and the shop updates within seconds.

Admin edits are stored in the database and take priority over the data files. **Reset to data files** throws away the admin edits.

### The data files (for bigger edits or a developer)
| File | What it holds |
|---|---|
| `data/products.json` | Categories and all 15 products: id, name, category, price, size, short and full description, key ingredients, how to use, images, in-stock flag, bestseller |
| `data/bundles.json` | Ready-made bundles: contents (or "choose one from each category"), price, shown/hidden, featured on home page |
| `data/pricing.json` | All pricing rules: Mix & Match tiers, Complete Routine %, gift box, delivery fee and free-delivery threshold |
| `data/site.json` | Phone/WhatsApp, emirates, delivery time slots, brand story, FAQ, delivery and returns policy text |

Editing a file on GitHub (click the file, then the pencil icon, then **Commit**) redeploys the site automatically.

### Replacing the placeholder photos
The product images are illustrated placeholders in `public/images/products/` (two per product: `…-1.svg` is the main image, `…-2.svg` the second gallery image) and `public/images/hero.svg` for the home page.

1. Name your photos to match, e.g. `kumkumadi-soap-1.jpg`. Portrait 4:5 works best (e.g. 1600 × 2000 px). The hero works best around 1200 × 1400.
2. Upload them to `public/images/products/` on GitHub.
3. Update the image paths (on the admin page under **Text, ingredients & images**, or in `data/products.json`). JPG/PNG/WebP photos are automatically resized and compressed for fast loading.

A logo file can replace the leaf mark in `components/icons.tsx` (`LogoMark`) and `app/icon.svg` (browser tab icon).

---

## 3. How the pricing works

All rules live in `data/pricing.json` / the admin page. The same code (`lib/pricing.ts`) runs in the browser for live totals and on the server when the order is placed, so the price saved is always recalculated from your current catalog and never trusted from the customer's browser.

- **Ready-made bundles** have a fixed price. *Full Body Ritual* lets the customer choose any soap, moisturizer and oil.
- **Mix & Match**: 3–4 items 5% off, 5–7 items 10%, 8+ items 15%. A box with at least one soap, one moisturizer and one oil gets an extra 5% (*Complete Routine*). The optional gift box (AED 10) is added after discounts.
- **Automatic savings in the cart**: loose items get the best available price: matching ready-made bundles, the Mix & Match tier, or a combination. **Each item gets only one discount**, never two stacked on the same item. Mix & Match boxes also get the best of tier or bundle price.
- The cart suggests a bundle when a customer is close to one ("Add Mango Butter Lip Balm to complete the Kumkumadi Glow Ritual and save AED 11").
- Prices are rounded to whole AED. Delivery is AED 15, free when products total AED 150 or more after savings.

Run `npm test` to check the pricing rules (12 checks, including every bundle price from the brief).

---

## 4. Adding Arabic later
The layout is ready for right-to-left: all spacing uses direction-aware CSS, and `<html lang dir>` is set from `data/site.json` (`locale`). To add Arabic, a developer would:
1. Add Arabic text for products (e.g. `name_ar`, `description_ar`) and `data/site.json`.
2. Add `/ar` routes (Next.js internationalised routing or `next-intl`) that render `lang="ar" dir="rtl"`.
3. Add an Arabic font (e.g. Noto Naskh Arabic) in `app/layout.tsx`.

---

## 5. For developers

```bash
npm install
npm run dev        # http://localhost:3000, admin password "admin" locally
npm test           # pricing engine tests
npm run build
npm run images     # regenerate placeholder images
```

Without `DATABASE_URL`, local orders go to `.data/db.json`. On Vercel a database is required.

```
app/                     pages (App Router)
  api/orders             places orders: validates, re-prices, saves, notifies
  admin/                 login, orders, CSV export, catalog editor, messages
  bundles/builder.tsx    Mix & Match builder
lib/pricing.ts           pricing engine (bundles, tiers, best-price search, suggestions)
lib/db.ts                Postgres storage (+ local JSON fallback)
lib/notify.ts            email / WhatsApp / Google Sheet alerts
components/providers.tsx catalog + cart state (saved in the browser)
data/                    editable catalog, bundles, pricing, site text
```

SEO: page titles and descriptions, Product + Offer (COD) and Breadcrumb schema on product pages, FAQPage schema, Organization schema, `sitemap.xml`, `robots.txt`, clean `/products/<name>` URLs.
