// Deep probe: cadwin mobile hero layout + announcement bar overflow on all pages.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'shots', 'sections');
mkdirSync(SHOTS, { recursive: true });
const BASE = 'http://localhost:4173';
const out = {};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

// 1) cadwin mobile hero — fresh load, no scroll
{
  const page = await context.newPage();
  await page.goto(`${BASE}/product-cadwin.html`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  out.cadwinHero = await page.evaluate(() => {
    const pick = (sel) => {
      const e = document.querySelector(sel);
      if (!e) return null;
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return {
        sel,
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        opacity: cs.opacity, transform: cs.transform, display: cs.display,
        text: (e.textContent || '').trim().slice(0, 60),
      };
    };
    return {
      hero: pick('.product-hero'),
      heroInner: pick('.product-hero .container, .product-hero-inner, .product-hero-grid'),
      h1: pick('.product-hero h1'),
      badge: pick('.product-hero .hero-badge, .product-hero .product-hero-badge'),
      desc: pick('.product-hero p'),
      media: pick('.product-hero video, .product-hero img'),
      actions: pick('.product-hero .hero-actions, .product-hero .btn'),
      docScrollW: document.documentElement.scrollWidth,
      docClientW: document.documentElement.clientWidth,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
      htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
    };
  });
  await page.screenshot({ path: path.join(SHOTS, 'cadwin-mobile-hero-fresh.png') });
  // after slow scroll past hero and back
  await page.evaluate(async () => {
    window.scrollTo(0, 600);
    await new Promise((r) => setTimeout(r, 1200));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS, 'cadwin-mobile-hero-settled.png') });
  out.cadwinHeroSettled = await page.evaluate(() => {
    const e = document.querySelector('.product-hero h1');
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), opacity: getComputedStyle(e).opacity, transform: getComputedStyle(e).transform };
  });
  await page.close();
}

// 2) announcement bar overflow on each page (mobile)
out.announcement = [];
for (const pg of ['index.html', 'product-cadwin.html', 'product-clippdm.html', 'product-clippms.html', 'product-multibom.html', 'product-clipcms.html', 'brochure.html']) {
  const page = await context.newPage();
  await page.goto(`${BASE}/${pg}`, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const bar = document.querySelector('.announcement-bar, .announcement, [class*="announce"]');
    if (!bar) return { found: false };
    const r = bar.getBoundingClientRect();
    const cs = getComputedStyle(bar);
    return {
      found: true,
      cls: bar.className,
      rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
      scrollH: bar.scrollHeight,
      clientH: bar.clientHeight,
      overflowY: cs.overflow + '/' + cs.overflowY,
      clipped: bar.scrollHeight > bar.clientHeight + 1,
      topVisible: r.top >= 0,
    };
  });
  out.announcement.push({ page: pg, ...info });
  await page.close();
}

await browser.close();
writeFileSync(path.join(SHOTS, 'probe2.json'), JSON.stringify(out, null, 2));
console.log('PROBE2 DONE');
