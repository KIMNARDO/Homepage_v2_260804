// 풀페이지 QA 스크린샷 — 라이트/다크 × 데스크톱/모바일 캡처
// 사용법: node scripts/_qa_shots.mjs [url] [outDir]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = process.argv[3] || '/tmp/qa-shots';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

async function capture(page, name) {
  // blur-fade 등 IntersectionObserver 애니메이션을 모두 트리거
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
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  console.log(`saved ${name}`);
}

for (const [device, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport: vp, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await capture(page, `${device}-light`);
  await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
  await page.waitForTimeout(600);
  await capture(page, `${device}-dark`);
  await page.close();
}

await browser.close();
