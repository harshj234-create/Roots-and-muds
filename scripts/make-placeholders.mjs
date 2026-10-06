// Generates tasteful placeholder product images (SVG) into public/images/products.
// Replace any of them with a real photo: put e.g. kumkumadi-soap-1.jpg in the same folder and
// change the path in data/products.json (or from the admin page). Run: npm run images
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const { products } = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url), "utf8"));
const out = new URL("../public/images/products/", import.meta.url);
mkdirSync(out, { recursive: true });

const tint = {
  "kumkumadi-soap": "#D49A55",
  "dahlia-herbal-face-soap": "#D7A8A0",
  "vanilla-herbal-soap": "#E6D6B5",
  "coffee-cream-soap": "#7A5538",
  "lavender-soap": "#B4A6C8",
  "sandalwood-herbal-soap": "#C8A27A",
  "aloe-vera-soap": "#A7BC8C",
  "saffron-sandal-soap": "#D6AE63",
  "haldi-chandan-moisturizer": "#D9A441",
  "kumkumadi-moisturizer": "#CF8F5A",
  "coffee-vanilla-moisturizer": "#8C6446",
  "herbal-oil": "#9AA36A",
  "calming-nourishing-oil": "#B98A4E",
  "mango-butter-lip-balm": "#E3A65C",
  "lip-plump-balm": "#C98A86",
};
const backdrops = ["#E9DFCE", "#E4E2D3", "#EADBCB", "#E2E3D8"];

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v + amt))));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

const seal = (x, y, r, col) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${shade(col, -28)}" stroke-width="3" opacity=".55"/>
   <path d="M${x} ${y + r * 0.55} C ${x} ${y}, ${x} ${y - r * 0.2}, ${x} ${y - r * 0.55} M${x} ${y - r * 0.05} C ${x - r * 0.4} ${y - r * 0.15}, ${x - r * 0.45} ${y - r * 0.45}, ${x - r * 0.5} ${y - r * 0.5} C ${x - r * 0.1} ${y - r * 0.5}, ${x} ${y - r * 0.3}, ${x} ${y - r * 0.05} M${x} ${y + r * 0.15} C ${x + r * 0.35} ${y}, ${x + r * 0.45} ${y - r * 0.25}, ${x + r * 0.5} ${y - r * 0.3} C ${x + r * 0.15} ${y - r * 0.32}, ${x} ${y - r * 0.1}, ${x} ${y + r * 0.15}" fill="none" stroke="${shade(col, -28)}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;

function soap(col) {
  return `<ellipse cx="400" cy="720" rx="250" ry="34" fill="#000" opacity=".08"/>
  <rect x="170" y="420" width="460" height="290" rx="70" fill="${shade(col, -22)}"/>
  <rect x="170" y="390" width="460" height="290" rx="70" fill="${col}"/>
  <rect x="200" y="415" width="400" height="240" rx="52" fill="${shade(col, 10)}" opacity=".55"/>
  ${seal(400, 535, 62, col)}`;
}
function jar(col) {
  return `<ellipse cx="400" cy="760" rx="220" ry="30" fill="#000" opacity=".08"/>
  <path d="M215 470 h370 v250 a40 40 0 0 1 -40 40 h-290 a40 40 0 0 1 -40 -40z" fill="#F4EFE6"/>
  <path d="M215 470 h370 v250 a40 40 0 0 1 -40 40 h-290 a40 40 0 0 1 -40 -40z" fill="${col}" opacity=".18"/>
  <rect x="245" y="545" width="310" height="140" rx="10" fill="${col}"/>
  ${seal(400, 615, 44, col)}
  <rect x="200" y="380" width="400" height="100" rx="26" fill="${shade(col, -30)}"/>
  <rect x="200" y="380" width="400" height="30" rx="15" fill="${shade(col, -10)}" opacity=".6"/>`;
}
function bottle(col) {
  return `<ellipse cx="400" cy="800" rx="160" ry="26" fill="#000" opacity=".08"/>
  <rect x="372" y="170" width="56" height="70" rx="26" fill="#2E2A24"/>
  <rect x="352" y="230" width="96" height="70" rx="10" fill="#3A342C"/>
  <path d="M370 300 h60 v40 c70 20 110 60 110 130 v270 a40 40 0 0 1 -40 40 h-200 a40 40 0 0 1 -40 -40 v-270 c0 -70 40 -110 110 -130z" fill="${shade(col, -40)}"/>
  <path d="M290 470 c0 -40 20 -80 60 -100" stroke="#fff" stroke-width="10" fill="none" opacity=".18" stroke-linecap="round"/>
  <rect x="285" y="520" width="230" height="170" rx="10" fill="#F4EFE6"/>
  ${seal(400, 605, 46, col)}`;
}
function balm(col) {
  return `<ellipse cx="400" cy="780" rx="120" ry="22" fill="#000" opacity=".08"/>
  <rect x="320" y="250" width="160" height="230" rx="26" fill="${shade(col, -24)}"/>
  <rect x="320" y="250" width="160" height="40" rx="20" fill="${shade(col, -8)}" opacity=".6"/>
  <rect x="312" y="470" width="176" height="300" rx="20" fill="#F4EFE6"/>
  <rect x="312" y="560" width="176" height="130" fill="${col}"/>
  ${seal(400, 625, 38, col)}`;
}
const shapes = { soaps: soap, moisturizers: jar, oils: bottle, "lip-balms": balm };

function leaves(col, seed) {
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let g = "";
  for (let i = 0; i < 9; i++) {
    const x = 60 + rnd() * 680, y = 80 + rnd() * 860, r = 10 + rnd() * 26, a = rnd() * 360;
    g += i % 3 === 0
      ? `<circle cx="${x}" cy="${y}" r="${r * 0.6}" fill="${shade(col, -10)}" opacity=".35"/>`
      : `<path transform="translate(${x} ${y}) rotate(${a})" d="M0 0 C ${r} ${-r}, ${r * 2.4} ${-r * 0.4}, ${r * 3} 0 C ${r * 2.4} ${r * 0.4}, ${r} ${r}, 0 0z" fill="#7D8B6A" opacity=".35"/>`;
  }
  return g;
}

function svg(p, variant, i) {
  const col = tint[p.id] ?? "#C8A27A";
  const bg = backdrops[(i + variant) % backdrops.length];
  const shape = shapes[p.category](col);
  const body =
    variant === 1
      ? `<path d="M80 620 C 140 470, 300 430, 420 450 C 560 470, 700 520, 720 640 C 740 790, 600 900, 400 905 C 200 910, 40 800, 80 620z" fill="${shade(bg, -14)}"/>
         <g>${shape}</g>`
      : `${leaves(col, i * 7 + 3)}
         <circle cx="400" cy="560" r="300" fill="${shade(bg, 10)}"/>
         <g transform="translate(400 560) rotate(-8) scale(.82) translate(-400 -560)">${shape}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${p.name.replace("&", "&amp;")}">
  <rect width="800" height="1000" fill="${bg}"/>
  ${body}
  <text x="400" y="960" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="#6B6358" opacity=".8">${p.name.replace("&", "&amp;")}</text>
</svg>`;
}

products.forEach((p, i) => {
  writeFileSync(new URL(`${p.id}-1.svg`, out), svg(p, 1, i));
  writeFileSync(new URL(`${p.id}-2.svg`, out), svg(p, 2, i));
});
console.log(`Wrote ${products.length * 2} placeholder images`);

// Hero still life (swap public/images/hero.svg for a lifestyle photo, ideally 1200 × 1400)
const hero = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400" role="img" aria-label="Handmade soap, moisturizer and body oil on a clay stone">
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
  </defs>
  <rect width="1200" height="1400" fill="#E3D6C1"/>
  ${leaves("#C8A27A", 11).replace(/opacity="\.35"/g, 'opacity=".5"')}
  <path d="M90 1010 C 120 860, 330 800, 600 805 C 880 810, 1110 880, 1120 1020 C 1130 1170, 900 1250, 600 1252 C 300 1255, 60 1170, 90 1010z" fill="#8E6440"/>
  <path d="M90 980 C 120 830, 330 770, 600 775 C 880 780, 1110 850, 1120 990 C 1130 1120, 900 1200, 600 1202 C 300 1205, 60 1120, 90 980z" fill="#B48558"/>
  <path d="M90 980 C 120 830, 330 770, 600 775 C 880 780, 1110 850, 1120 990 C 1130 1120, 900 1200, 600 1202 C 300 1205, 60 1120, 90 980z" filter="url(#grain)"/>
  <g transform="translate(120 170) scale(.95)">${jar("#D9A441")}</g>
  <g transform="translate(520 40) scale(1.02)">${bottle("#9AA36A")}</g>
  <g transform="translate(260 470) scale(.9)">${soap("#D49A55")}</g>
  <g transform="translate(-30 760) scale(.4) rotate(-18 400 500)">${balm("#E3A65C")}</g>
</svg>`;
writeFileSync(new URL("../public/images/hero.svg", import.meta.url), hero);
console.log("Wrote hero image");
