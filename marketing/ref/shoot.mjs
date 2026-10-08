import { chromium } from 'playwright';
import fs from 'fs';
const url = 'https://enkiswebstudio.com/';
const out = 'marketing/ref/shots';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
for (const [name, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const pg = await ctx.newPage();
  const scripts = [];
  pg.on('response', r => { const u = r.url(); if (u.endsWith('.js') || u.includes('.js?')) scripts.push(u); });
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('goto', e.message));
  await pg.waitForTimeout(4000);
  const H = await pg.evaluate(() => document.documentElement.scrollHeight);
  fs.writeFileSync(`${out}/${name}_info.txt`, `height ${H}\n` + scripts.join('\n'));
  let i = 0;
  for (let y = 0; y < H && i < 40; y += vp.height * 0.6) {
    await pg.mouse.wheel(0, i === 0 ? 0 : vp.height * 0.6);
    await pg.waitForTimeout(1200);
    await pg.screenshot({ path: `${out}/${name}_${String(i).padStart(2, '0')}.jpg`, quality: 70, type: 'jpeg' });
    i++;
  }
  // grab library fingerprints
  const libs = await pg.evaluate(() => ({ gsap: !!window.gsap, three: !!window.THREE, lenis: !!window.lenis || !!document.querySelector('.lenis'), canvas: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length, fonts: [...new Set([...document.querySelectorAll('h1,h2,p,a,span')].slice(0,80).map(e=>getComputedStyle(e).fontFamily))] }));
  fs.appendFileSync(`${out}/${name}_info.txt`, '\n' + JSON.stringify(libs, null, 1));
  await ctx.close();
}
await b.close();
