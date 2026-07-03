import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
const info = await p.evaluate(() => {
  const g = document.querySelector('.products-grid');
  const cs = getComputedStyle(g);
  const cards = g.querySelectorAll('.product-card');
  const rects = [...cards].map((c) => {
    const r = c.getBoundingClientRect();
    return { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width) };
  });
  return {
    cols: cs.gridTemplateColumns,
    count: cards.length,
    gridWidth: Math.round(g.getBoundingClientRect().width),
    rects,
  };
});
console.log(JSON.stringify(info, null, 2));
await b.close();
