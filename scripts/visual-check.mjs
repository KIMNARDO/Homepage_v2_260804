// Visual rendering verification: screenshots of dist pages (light/dark x desktop/mobile)
// Runs against `vite preview` on port 4173 (started externally).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'shots');
mkdirSync(SHOTS, { recursive: true });

const BASE = 'http://localhost:4173';
const PAGES = [
  'index.html',
  'product-cadwin.html',
  'product-clippdm.html',
  'product-clippms.html',
  'product-multibom.html',
  'product-clipcms.html',
  'brochure.html',
];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, fullPage: true },
  { name: 'mobile', width: 390, height: 844, fullPage: false },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
}

async function collectMetrics(page) {
  return page.evaluate(() => {
    const brokenImgs = [...document.querySelectorAll('img')]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute('src'));
    const videos = [...document.querySelectorAll('video')].map((v) => ({
      src: v.currentSrc || (v.querySelector('source') && v.querySelector('source').src) || v.src,
      networkState: v.networkState, // 3 = NETWORK_NO_SOURCE
      error: v.error ? v.error.code : null,
      hasPoster: !!v.getAttribute('poster'),
    }));
    const hScroll = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return { brokenImgs, videos, hScrollOverflowPx: hScroll };
  });
}

const report = [];
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  for (const pg of PAGES) {
    const slug = pg.replace(/\.html$/, '').replace('product-', '');
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (m) => {
      if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
    });
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('requestfailed', (r) => {
      const f = r.failure();
      failedRequests.push(`${r.url()} :: ${f ? f.errorText : '?'}`);
    });

    try {
      await page.goto(`${BASE}/${pg}`, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1200);
      await autoScroll(page);

      // LIGHT
      const lightMetrics = await collectMetrics(page);
      await page.screenshot({
        path: path.join(SHOTS, `${slug}-${vp.name}-light.png`),
        fullPage: vp.fullPage,
      });

      // DARK
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(800);
      const darkMetrics = await collectMetrics(page);
      await page.screenshot({
        path: path.join(SHOTS, `${slug}-${vp.name}-dark.png`),
        fullPage: vp.fullPage,
      });

      report.push({
        page: pg,
        viewport: vp.name,
        consoleErrors,
        failedRequests,
        light: lightMetrics,
        dark: darkMetrics,
      });
    } catch (e) {
      report.push({ page: pg, viewport: vp.name, fatal: String(e), consoleErrors, failedRequests });
    }
    await page.close();
  }
  await context.close();
}

await browser.close();
writeFileSync(path.join(SHOTS, 'report.json'), JSON.stringify(report, null, 2));
console.log('DONE — report at scripts/shots/report.json');
