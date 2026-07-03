// 모든 데모 모달 트리거 + 자료 다운로드 링크 QA
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = process.argv[3] || '/tmp/qa-triggers';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const isOpen = () => page.evaluate(() => !document.getElementById('demoModal').hidden);
const close = async () => { await page.keyboard.press('Escape'); await page.waitForTimeout(350); };

// 트리거 개수 + 각 트리거 동작
const triggers = await page.$$eval('[data-demo-open]', els => els.map(e => (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24)));
console.log('triggers:', JSON.stringify(triggers));

for (let i = 0; i < triggers.length; i++) {
  const el = page.locator('[data-demo-open]').nth(i);
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(250);
    await el.click({ timeout: 3000 });
    await page.waitForTimeout(350);
    console.log(`#${i} "${triggers[i]}" -> modal: ${await isOpen()}`);
    await close();
  } catch (e) {
    console.log(`#${i} "${triggers[i]}" -> SKIP (${e.message.split('\n')[0]})`);
  }
}

// 다운로드 링크가 실제로 200인지 (HEAD)
const hrefs = await page.$$eval('a[download]', as => [...new Set(as.map(a => a.getAttribute('href')))]);
for (const href of hrefs) {
  const res = await page.request.head(new URL(href, url).href);
  console.log(`download ${href} -> ${res.status()}`);
}

// 스크린샷: 모달(다운로드 칩 포함) + CTA 섹션
await page.click('.floating-demo-cta');
await page.waitForTimeout(450);
await page.screenshot({ path: `${outDir}/modal-with-downloads.png` });
await close();
await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('#contact').scrollIntoView(); });
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/cta-downloads.png` });

await browser.close();
