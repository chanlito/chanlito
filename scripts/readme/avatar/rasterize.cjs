// rasterize.cjs <scale> <svg> <png> [<svg> <png> ...]: transparent PNGs of SVGs.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [scale, ...pairs] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: +scale, viewport: { width: 1200, height: 1200 } });
  for (let i = 0; i < pairs.length; i += 2) {
    const svg = fs.readFileSync(pairs[i], 'utf8');
    await p.setContent(`<style>html,body{margin:0;background:transparent}*{animation:none!important}</style>${svg}`);
    await p.locator('svg').first().screenshot({ path: pairs[i + 1], omitBackground: true });
  }
  await b.close();
})();
