import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const browser = await chromium.launch();

const shots = [
  { url: '/', name: 'linear-index-desktop', w: 1440, h: 900 },
  { url: '/', name: 'linear-index-mobile', w: 390, h: 844 },
  { url: '/product-cadwin.html', name: 'linear-cadwin-desktop', w: 1440, h: 900 },
  { url: '/product-clippdm.html', name: 'linear-clippdm-desktop', w: 1440, h: 900 },
  { url: '/', name: 'linear-index-dark', w: 1440, h: 900, dark: true },
];

const errors = [];
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  page.on('pageerror', e => errors.push(`${s.name}: ${e.message}`));
  await page.goto(`${BASE}${s.url}`, { waitUntil: 'networkidle' });
  if (s.dark) {
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: `scripts/shots/${s.name}.png` });
  // second shot scrolled to cards section
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight * 0.35 }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `scripts/shots/${s.name}-mid.png` });
  await page.close();
}
console.log(JSON.stringify({ errors }, null, 2));
await browser.close();
