// Multi-BOM 목업 렌더 PNG → 사이트용 webp 변환/크롭
// mock-1(비교 화면): 하단 여백 크롭 → images/mbom_compare.webp (홈 피처카드)
// mock-2(대시보드): 전체 → images/mbom_dashboard.webp (제품 페이지)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const SRC = process.argv[2]; // 렌더 PNG 폴더
const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main';

const browser = await chromium.launch();
const page = await browser.newPage();

async function toWebp(pngPath, outPath, cropH) {
  const b64 = readFileSync(pngPath).toString('base64');
  const dataUrl = await page.evaluate(async ({ b64, cropH }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = cropH || img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', 0.88);
  }, { b64, cropH });
  writeFileSync(outPath, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('saved', outPath);
}

await toWebp(`${SRC}/mock-1.png`, `${ROOT}/images/mbom_compare.webp`, 980);
await toWebp(`${SRC}/mock-2.png`, `${ROOT}/images/mbom_dashboard.webp`);
await browser.close();
