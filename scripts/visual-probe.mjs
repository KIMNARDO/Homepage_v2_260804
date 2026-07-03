// Probe: distinguish real blank-layout defects from untriggered scroll animations.
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
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const report = [];

for (const pg of PAGES) {
  const slug = pg.replace(/\.html$/, '').replace('product-', '');
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
  page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + String(e).slice(0, 200)));

  await page.goto(`${BASE}/${pg}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);

  // Slow scroll through entire page to give IntersectionObserver time to fire.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.55;
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 550));
    }
    await new Promise((r) => setTimeout(r, 1000));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  const probe = await page.evaluate(() => {
    const res = {};
    res.blurFadeTotal = document.querySelectorAll('.blur-fade').length;
    res.blurFadeNotInView = [...document.querySelectorAll('.blur-fade:not(.in-view)')].map((e) => {
      const r = e.getBoundingClientRect();
      return { tag: e.tagName, cls: e.className.slice(0, 80), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY) };
    });
    res.revealTotal = document.querySelectorAll('.reveal').length;
    res.revealNotVisible = [...document.querySelectorAll('.reveal:not(.visible)')].map((e) => {
      const r = e.getBoundingClientRect();
      return { tag: e.tagName, cls: e.className.slice(0, 80), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY) };
    });
    // Any sizable element still at computed opacity < 0.15 (invisible content)
    const invisible = [];
    for (const e of document.querySelectorAll('section *')) {
      const r = e.getBoundingClientRect();
      if (r.width < 200 || r.height < 120) continue;
      const cs = getComputedStyle(e);
      if (parseFloat(cs.opacity) < 0.15 && cs.display !== 'none' && cs.visibility !== 'hidden') {
        invisible.push({ tag: e.tagName, cls: String(e.className).slice(0, 100), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + window.scrollY), opacity: cs.opacity });
        if (invisible.length >= 25) break;
      }
    }
    res.invisibleBlocks = invisible;
    // dashboard panel state (index only, harmless elsewhere)
    const panel = document.querySelector('.dashboard-panel.active');
    res.activePanel = panel ? { h: Math.round(panel.getBoundingClientRect().height), opacity: getComputedStyle(panel).opacity } : null;
    return res;
  });

  await page.screenshot({ path: path.join(SHOTS, `${slug}-settled-light.png`), fullPage: true });
  report.push({ page: pg, consoleErrors, ...probe });
  await page.close();
}

await browser.close();
writeFileSync(path.join(SHOTS, 'probe.json'), JSON.stringify(report, null, 2));
console.log('PROBE DONE');
