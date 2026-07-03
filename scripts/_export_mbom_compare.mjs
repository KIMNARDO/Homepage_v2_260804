// mock-1(E-BOM vs M-BOM 비교)을 홈 피처카드 래퍼 비율(16:10)로 재렌더 → webp
// 작은 뷰포트로 렌더해 표가 프레임을 채우도록 (하단 여백 최소화)
import { chromium } from 'playwright';
import { writeFileSync, readFileSync } from 'fs';

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main';
const SRC = `${ROOT}/CLIP MMS/enterprise_multi-bom_management_grid_1/code.html`;
const OUT = `${ROOT}/images/mbom_compare.webp`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2 });
try {
  await page.goto('file://' + SRC, { waitUntil: 'networkidle', timeout: 30000 });
} catch {}
await page.waitForTimeout(2500);
const png = await page.screenshot();

// PNG → webp 변환 (canvas)
const b64 = png.toString('base64');
const dataUrl = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  c.getContext('2d').drawImage(img, 0, 0);
  return c.toDataURL('image/webp', 0.88);
}, b64);
writeFileSync(OUT, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('saved', OUT);
await browser.close();
