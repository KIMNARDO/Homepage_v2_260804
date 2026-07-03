// 데모 폼 릴레이 제출 플로우 QA — formsubmit 요청은 가로채서 목 응답 (실전송 없음)
import { chromium } from 'playwright';

const out = process.argv[2] || '/tmp/qa-form';
const { mkdirSync } = await import('fs');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

let intercepted = null;
await page.route('**/formsubmit.co/**', async (route) => {
  intercepted = { url: route.request().url(), body: route.request().postData() };
  await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
});

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.click('.floating-demo-cta');
await page.waitForTimeout(400);
await page.fill('input[name="company"]', '테스트정밀');
await page.fill('input[name="name"]', '홍길동');
await page.fill('input[name="phone"]', '010-1234-5678');
await page.fill('input[name="email"]', 'test@company.co.kr');
await page.click('.demo-submit');
await page.waitForTimeout(800);

console.log('intercepted URL:', intercepted && intercepted.url);
console.log('payload:', intercepted && intercepted.body);
console.log('done popup visible:', await page.evaluate(() => !document.getElementById('demoDoneModal').hidden));
console.log('form modal hidden:', await page.evaluate(() => document.getElementById('demoModal').hidden));
await page.screenshot({ path: `${out}/form-success.png` });
// 확인 버튼으로 닫기
await page.click('.demo-done-confirm');
await page.waitForTimeout(400);
console.log('done popup closed:', await page.evaluate(() => document.getElementById('demoDoneModal').hidden));
console.log('body scroll restored:', await page.evaluate(() => document.body.style.overflow === ''));
await browser.close();
