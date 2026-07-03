// 교체된 Multi-BOM 화면 확인 캡처
import { chromium } from 'playwright';

const out = process.argv[2] || '/tmp/mbom-after';
const { mkdirSync } = await import('fs');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const card = page.locator('#features .feature-card').nth(3);
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await card.screenshot({ path: `${out}/home-card-after.png` });
console.log('saved home-card-after');

await page.goto('http://localhost:5173/product-multibom.html', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
const img = page.locator('img[src*="mbom_dashboard"]');
await img.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/product-after.png` });
console.log('saved product-after');

await browser.close();
