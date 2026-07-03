import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const browser = await chromium.launch();
const errors = [];
const imgReport = {};

async function shoot(page, name, scrollSel) {
  if (scrollSel) {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ block: 'start' });
    }, scrollSel);
    await page.waitForTimeout(700);
  }
  await page.screenshot({ path: `scripts/shots/${name}.png` });
}

// check that key images actually loaded (naturalWidth > 0)
async function checkImages(page, name) {
  const r = await page.evaluate(() => {
    const out = [];
    const sel = ['.hero-shot-body img', '.product-card-thumb img'];
    sel.forEach((s) => {
      document.querySelectorAll(s).forEach((img) => {
        out.push({ src: img.getAttribute('src'), ok: img.naturalWidth > 0, w: img.naturalWidth });
      });
    });
    return out;
  });
  imgReport[name] = r;
}

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };

// Desktop light
let page = await browser.newPage({ viewport: desktop });
page.on('pageerror', (e) => errors.push(`light: ${e.message}`));
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await shoot(page, 'rd-hero-light');
await checkImages(page, 'light');
await shoot(page, 'rd-products-light', '.products-grid');
await checkImages(page, 'light-after-scroll');
await page.close();

// Desktop dark
page = await browser.newPage({ viewport: desktop });
page.on('pageerror', (e) => errors.push(`dark: ${e.message}`));
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await page.waitForTimeout(500);
await shoot(page, 'rd-hero-dark');
await shoot(page, 'rd-products-dark', '.products-grid');
await page.close();

// Mobile light
page = await browser.newPage({ viewport: mobile });
page.on('pageerror', (e) => errors.push(`mobile: ${e.message}`));
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await shoot(page, 'rd-hero-mobile');
await shoot(page, 'rd-products-mobile', '.products-grid');
await page.close();

console.log(JSON.stringify({ errors, imgReport }, null, 2));
await browser.close();
