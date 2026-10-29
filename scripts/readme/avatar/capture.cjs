// Records mini Chanlito from chanlito.dev frame by frame with a fake clock, so
// every frame is exactly 1/FPS apart. Reads the WebGL canvas directly
// (transparent PNGs), because page screenshots wait on a frame that a paused
// clock never gives.
const { chromium } = require('playwright');
const fs = require('fs');
const FPS = 25, SECONDS = +(process.argv[2] || 3.2), OUT = process.argv[3] || 'avatar/frames';
const URL = process.argv[4] || 'https://chanlito.dev/';
const CLICKS = (process.argv[5] || '').split(',').filter(Boolean).map(Number);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2.5 });
  const p = await ctx.newPage();
  await p.addInitScript(() => {
    // Seeded Math.random, so blinks and fidgets land the same every run.
    let seed = 7;
    Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
      if (/webgl/.test(type)) attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
      return get.call(this, type, attrs);
    };
  });
  await p.clock.install({ time: new Date('2026-10-29T10:00:00Z') });
  await p.goto(URL, { waitUntil: 'networkidle' });
  const grab = () => p.evaluate(() => {
    const c = document.querySelector('chanlito-avatar canvas');
    if (!c || !c.width) return null;
    return c.toDataURL('image/png');
  });
  let f = 0, started = false;
  for (let i = 0; i < 2000 && f < FPS * SECONDS; i++) {
    await p.clock.runFor(1000 / FPS);
    const url = await grab();
    if (!url) continue;
    const buf = Buffer.from(url.split(',')[1], 'base64');
    if (!started) { if (buf.length < 20000) continue; started = true; console.log('first frame at tick', i); }
    fs.writeFileSync(`${OUT}/${String(f++).padStart(3, '0')}.png`, buf);
    if (CLICKS.includes(f)) {
      // Synthetic pointer events on the canvas only, so his head doesn't
      // turn to follow a mouse.
      await p.evaluate(() => {
        const c = document.querySelector('chanlito-avatar canvas');
        const r = c.getBoundingClientRect();
        const o = { clientX: r.left + r.width / 2, clientY: r.top + r.height * 0.55, bubbles: true, pointerId: 1, isPrimary: true };
        c.dispatchEvent(new PointerEvent('pointerdown', o));
        c.dispatchEvent(new PointerEvent('pointerup', o));
      });
      console.log('clicked at frame', f);
    }
  }
  console.log('frames', f);
  await b.close();
})();
