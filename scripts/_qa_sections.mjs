// 섹션별 QA 스크린샷 — 각 <section>을 원본 해상도로 캡처
// 사용법: node scripts/_qa_sections.mjs [url] [outDir] [theme]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = process.argv[3] || '/tmp/qa-sections';
const theme = process.argv[4] || 'light';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
if (theme === 'dark') {
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
}
await page.waitForTimeout(1000);
await page.evaluate(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  const h = document.body.scrollHeight;
  for (let y = 0; y < h; y += 500) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 60));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(800);

const ids = await page.evaluate(() =>
  [...document.querySelectorAll('main section')].map((s, i) => s.id || `section-${i}`)
);
for (let i = 0; i < ids.length; i++) {
  const el = page.locator('main section').nth(i);
  try {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: `${outDir}/${String(i).padStart(2, '0')}-${ids[i]}-${theme}.png` });
    console.log(`saved ${ids[i]}`);
  } catch (e) {
    console.log(`skip ${ids[i]}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
