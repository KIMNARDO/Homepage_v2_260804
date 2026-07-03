// pms_gantt_chart.png → webp (갤러리 카드용) + 피처카드 영상 원본 해상도 확인
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main';
const browser = await chromium.launch();
const page = await browser.newPage();

const b64 = readFileSync(`${ROOT}/images/pms_gantt_chart.png`).toString('base64');
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
writeFileSync(`${ROOT}/images/pms_gantt_light.webp`, Buffer.from(dataUrl.split(',')[1], 'base64'));
console.log('saved pms_gantt_light.webp');

// 영상 해상도 확인
for (const v of ['videos/hero-cadwin.mp4', 'videos/v3-overview.mp4']) {
  const dim = await page.evaluate(async (src) => {
    const vid = document.createElement('video');
    vid.src = src;
    await new Promise((res, rej) => { vid.onloadedmetadata = res; vid.onerror = rej; setTimeout(rej, 8000); })
      .catch(() => null);
    return vid.videoWidth + 'x' + vid.videoHeight;
  }, `file://${ROOT}/${v}`).catch(() => 'ERR');
  console.log(v, '->', dim);
}
await browser.close();
