import { chromium } from 'playwright';
const b = await chromium.launch();

async function shotFocus(page, name) {
  await page.evaluate(() => {
    const el = document.querySelector('#plm-flow');
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo(0, y);
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `scripts/shots/${name}.png` });
}

// desktop light
let p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await shotFocus(p, 'rd-focus-light');
await p.close();

// desktop dark
p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await shotFocus(p, 'rd-focus-dark');
await p.close();

// mobile light — element screenshot for full stack
p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
await p.locator('#plm-flow .landing-focus-grid').scrollIntoViewIfNeeded();
await p.waitForTimeout(500);
await p.locator('#plm-flow').screenshot({ path: 'scripts/shots/rd-focus-mobile.png' });
await p.close();

await b.close();
console.log('done');
