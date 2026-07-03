// Element-level screenshots of key sections for close visual inspection.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(__dirname, 'shots', 'sections');
mkdirSync(SHOTS, { recursive: true });

const BASE = 'http://localhost:4173';

const TARGETS = [
  { page: 'index.html', sel: '.products-overview-section', name: 'index-products', themes: ['light', 'dark'] },
  { page: 'index.html', sel: '.plm-dashboard-section', name: 'index-dashboard', themes: ['light'] },
  { page: 'index.html', sel: '.feature-cards-section', name: 'index-features', themes: ['light'] },
  { page: 'index.html', sel: '.industry-section', name: 'index-industry', themes: ['light'] },
  { page: 'index.html', sel: '.marquee-section', name: 'index-marquee', themes: ['light'] },
  { page: 'index.html', sel: '.integrations-section', name: 'index-integrations', themes: ['light'] },
  { page: 'index.html', sel: '.cta-section', name: 'index-cta', themes: ['light', 'dark'] },
  { page: 'index.html', sel: 'footer', name: 'index-footer', themes: ['light', 'dark'] },
  { page: 'product-cadwin.html', sel: '.product-capabilities', name: 'cadwin-caps', themes: ['light'] },
  { page: 'product-cadwin.html', sel: '.product-cta', name: 'cadwin-cta', themes: ['light', 'dark'] },
  { page: 'product-cadwin.html', sel: 'footer', name: 'cadwin-footer', themes: ['light'] },
  { page: 'product-clippdm.html', sel: '.product-capabilities', name: 'clippdm-caps', themes: ['light'] },
  { page: 'product-clippdm.html', sel: '.product-outcomes', name: 'clippdm-outcomes', themes: ['light'] },
  { page: 'product-clippms.html', sel: '.product-capabilities', name: 'clippms-caps', themes: ['light'] },
  { page: 'product-multibom.html', sel: '.product-capabilities', name: 'multibom-caps', themes: ['light'] },
  { page: 'product-clipcms.html', sel: '.product-capabilities', name: 'clipcms-caps', themes: ['light', 'dark'] },
  { page: 'product-clipcms.html', sel: '.product-integrations', name: 'clipcms-integrations', themes: ['light'] },
  { page: 'product-clipcms.html', sel: '.specs-grid-section', name: 'clipcms-specsgrid', themes: ['light'] },
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

// group by page to load each page once
const byPage = {};
for (const t of TARGETS) (byPage[t.page] = byPage[t.page] || []).push(t);

for (const [pg, targets] of Object.entries(byPage)) {
  const page = await context.newPage();
  await page.goto(`${BASE}/${pg}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.55;
    const max = document.body.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 800));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') {
      await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
      await page.waitForTimeout(700);
    }
    for (const t of targets) {
      if (!t.themes.includes(theme)) continue;
      const el = page.locator(t.sel).first();
      try {
        await el.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        await el.screenshot({ path: path.join(SHOTS, `${t.name}-${theme}.png`), timeout: 10000 });
      } catch (e) {
        console.log(`MISS ${t.name}-${theme}: ${String(e).split('\n')[0]}`);
      }
    }
  }
  await page.close();
}

await browser.close();
console.log('SECTIONS DONE');
