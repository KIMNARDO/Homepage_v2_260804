// 전 페이지 이미지/비디오 크롭 감사 — object-fit:cover + 비율 불일치로 잘리는 요소 탐지
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173/';
const PAGES = ['', 'product-cadwin.html', 'product-clippdm.html', 'product-clippms.html', 'product-multibom.html', 'product-clipcms.html'];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

for (const p of PAGES) {
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);

  const report = await page.evaluate(() => {
    const rows = [];
    document.querySelectorAll('img').forEach(img => {
      const r = img.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) return;               // 아이콘류 제외
      if (!img.naturalWidth) { rows.push({ sel: img.src.split('/').pop(), issue: 'NOT_LOADED' }); return; }
      const fit = getComputedStyle(img).objectFit;
      const natural = img.naturalWidth / img.naturalHeight;
      const shown = r.width / r.height;
      const cropPct = Math.round((1 - Math.min(natural, shown) / Math.max(natural, shown)) * 100);
      if ((fit === 'cover' || fit === 'none') && cropPct >= 4) {
        rows.push({
          sel: img.src.split('/').pop().slice(0, 40),
          where: (img.closest('section')?.id || img.closest('section')?.className || '?').toString().slice(0, 36),
          fit, natural: `${img.naturalWidth}x${img.naturalHeight}`,
          box: `${Math.round(r.width)}x${Math.round(r.height)}`, cropPct
        });
      }
    });
    document.querySelectorAll('video').forEach(v => {
      const r = v.getBoundingClientRect();
      if (r.width < 40) return;
      const fit = getComputedStyle(v).objectFit;
      // 헤드리스에서 H.264 미디코드 → videoWidth=0일 수 있어 16:9 가정으로 검사
      const natural = (v.videoWidth && v.videoHeight) ? v.videoWidth / v.videoHeight : 16 / 9;
      const shown = r.width / r.height;
      const cropPct = Math.round((1 - Math.min(natural, shown) / Math.max(natural, shown)) * 100);
      if (fit === 'cover' && cropPct >= 4) {
        rows.push({ sel: 'VIDEO ' + (v.querySelector('source')?.src || v.src || '').split('/').pop(), where: (v.closest('section')?.id || '?'), fit, natural: '16:9(가정)', box: `${Math.round(r.width)}x${Math.round(r.height)}`, cropPct });
      }
    });
    return rows;
  });

  console.log(`\n===== ${p || 'index.html'} — ${report.length} issue(s) =====`);
  report.forEach(r => console.log(JSON.stringify(r)));
}
await browser.close();
