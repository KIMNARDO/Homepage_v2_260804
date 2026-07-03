import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const results = {};

// 1) cadwin hero — h1/desc/media must fit 390px viewport
await page.goto(`${BASE}/product-cadwin.html`, { waitUntil: 'networkidle' });
results.cadwinHero = await page.evaluate(() => {
  const h1 = document.querySelector('.product-hero-text h1');
  const media = document.querySelector('.product-hero-visual video, .product-hero-visual img');
  return {
    h1Width: h1 ? Math.round(h1.getBoundingClientRect().width) : null,
    h1Visible: h1 ? h1.getBoundingClientRect().x >= 0 && h1.getBoundingClientRect().width <= 400 : false,
    mediaWidth: media ? Math.round(media.getBoundingClientRect().width) : null,
    docScrollW: document.documentElement.scrollWidth,
  };
});
await page.screenshot({ path: 'scripts/shots/final-cadwin-mobile.png' });

// 2) announcement bar — no clipping on index
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
results.announcement = await page.evaluate(() => {
  const a = document.querySelector('.announcement');
  if (!a) return null;
  return {
    clientH: a.clientHeight,
    scrollH: a.scrollHeight,
    clipped: a.scrollHeight > a.clientHeight + 1,
  };
});
await page.screenshot({ path: 'scripts/shots/final-index-mobile.png' });

console.log(JSON.stringify(results, null, 2));
await browser.close();
