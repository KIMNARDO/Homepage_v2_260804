// multibom_dashboard_real.webp에서 브라우저 크롬(탭·주소창) 제거 크롭 → 새 webp
// WSL: node scripts/_crop_multibom.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/';
const SRC = ROOT + 'images/multibom_dashboard_real.webp';
const OUT = ROOT + 'images/multibom_dashboard_app.webp';
const CROP_TOP = 92; // 크롬 탭스트립+주소창 높이

const browser = await chromium.launch();
const page = await browser.newPage();
const b64 = readFileSync(SRC).toString('base64');
const dataUrl = await page.evaluate(async ({ b64, top }) => {
  const img = new Image();
  img.src = 'data:image/webp;base64,' + b64;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight - top;
  c.getContext('2d').drawImage(img, 0, top, c.width, c.height, 0, 0, c.width, c.height);
  return c.toDataURL('image/webp', 0.9);
}, { b64, top: CROP_TOP });
writeFileSync(OUT, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('saved', OUT);
await browser.close();
