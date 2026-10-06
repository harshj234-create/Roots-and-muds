// Downloads Satoshi and Clash Display (Fontshare, free for commercial use) into app/fonts/.
import { writeFileSync } from "node:fs";
const families = { satoshi: [400, 500, 700], "clash-display": [500, 600, 700] };
for (const [fam, weights] of Object.entries(families)) {
  for (const w of weights) {
    const css = await (await fetch(`https://api.fontshare.com/v2/css?f[]=${fam}@${w}&display=swap`)).text();
    const m = css.match(/url\(['"]?(\/\/cdn\.fontshare\.com\/[^'")]+\.woff2)['"]?\)/);
    if (!m) throw new Error(`No woff2 for ${fam} ${w}:\n${css.slice(0, 300)}`);
    const buf = Buffer.from(await (await fetch(`https:${m[1]}`)).arrayBuffer());
    const name = `${fam === "satoshi" ? "Satoshi" : "ClashDisplay"}-${w}.woff2`;
    writeFileSync(new URL(`../app/fonts/${name}`, import.meta.url), buf);
    console.log(`saved ${name} (${buf.length} bytes)`);
  }
}
