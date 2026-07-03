import { chromium } from 'playwright';
const b = await chromium.launch();

// Desktop: hero section + full products grid (both rows)
let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
await p.locator('#hero').screenshot({ path: 'scripts/shots/rd-final-hero.png' });
await p.evaluate(() => document.querySelector('.solution-board').scrollIntoView());
await p.waitForTimeout(500);
await p.locator('.solution-board').screenshot({ path: 'scripts/shots/rd-final-solboard.png' });
// ensure lazy thumbs load
await p.evaluate(() => document.querySelector('.products-grid').scrollIntoView());
await p.waitForTimeout(900);
await p.locator('.products-grid').screenshot({ path: 'scripts/shots/rd-final-cards.png' });
await p.close();

// Dark: full products grid
p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await p.evaluate(() => document.querySelector('.solution-board').scrollIntoView());
await p.waitForTimeout(500);
await p.locator('.solution-board').screenshot({ path: 'scripts/shots/rd-final-solboard-dark.png' });
await p.evaluate(() => document.querySelector('.products-grid').scrollIntoView());
await p.waitForTimeout(900);
await p.locator('.products-grid').screenshot({ path: 'scripts/shots/rd-final-cards-dark.png' });
await p.close();

// Mobile: first two stacked cards
p = await b.newPage({ viewport: { width: 390, height: 844 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.evaluate(() => document.querySelector('.products-grid').scrollIntoView());
await p.waitForTimeout(900);
await p.evaluate(() => window.scrollBy(0, -40));
await p.waitForTimeout(200);
await p.screenshot({ path: 'scripts/shots/rd-final-cards-mobile.png' });
await p.close();

await b.close();
console.log('done');
