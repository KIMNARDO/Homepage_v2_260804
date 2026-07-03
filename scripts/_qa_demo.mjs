// 데모 상담 모달 + icard 매직 글로우 QA
// 사용법: node scripts/_qa_demo.mjs [url] [outDir]
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:5173/';
const outDir = process.argv[3] || '/tmp/qa-demo';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// 1) 모달 열기 (라이트)
await page.click('.floating-demo-cta');
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/modal-light.png` });
console.log('modal open (light):', await page.evaluate(() => !document.getElementById('demoModal').hidden));

// 2) 폼 채우고 submit → mailto href 확인 (navigation 차단하고 URL만 검사)
await page.fill('input[name="company"]', '테스트정밀');
await page.fill('input[name="name"]', '홍길동');
await page.fill('input[name="phone"]', '010-1234-5678');
const mailto = await page.evaluate(() => {
  let captured = null;
  const orig = window.location;
  // location.href 대입을 가로채기 어렵므로 submit 핸들러 로직을 복제 검증
  const f = new FormData(document.getElementById('demoForm'));
  const subject = `[데모 상담] ${f.get('company') || ''} ${f.get('name') || ''}`.trim();
  captured = `mailto:kimnardo@papsnet.net?subject=${encodeURIComponent(subject)}`;
  return captured;
});
console.log('mailto preview:', decodeURIComponent(mailto));

// 3) ESC 닫기
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
console.log('closed by ESC:', await page.evaluate(() => document.getElementById('demoModal').hidden));

// 4) 다크 모드 모달
await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
await page.click('.floating-demo-cta');
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/modal-dark.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.evaluate(() => document.documentElement.removeAttribute('data-theme'));

// 5) icard 글로우 — 어넥스 카드에 호버 + 마우스 이동
const card = page.locator('.feature-card-annex .icard').first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const box = await card.boundingBox();
await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.4);
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/icard-glow.png`, clip: { x: box.x - 40, y: box.y - 40, width: box.width + 80, height: box.height + 80 } });
console.log('glow vars:', await card.evaluate(el => el.style.getPropertyValue('--mouse-x') + ' / ' + getComputedStyle(el, '::before').opacity));

await browser.close();
