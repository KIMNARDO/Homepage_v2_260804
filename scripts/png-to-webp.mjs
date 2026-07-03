// PNG → WebP 변환 (의존성 없이 Playwright Chromium 캔버스 사용)
// index 히어로/카드/솔루션/기능 카드에 쓰이는 무거운 PNG만 대상
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, statSync } from 'fs';

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/';
const Q = 0.85; // 한글 UI 텍스트 가독성 위해 높게

const targets = [
  'images/plm_executive_dashboard.png',          // 히어로 (LCP)
  '260528_등록이미지/도면검색.png',               // CADWin 카드
  '260528_등록이미지/도면체크아웃.png',            // PDM 카드
  'images/pms_advanced_gantt.png',               // PMS 카드
  'images/multibom_comparison_real.png',         // BOM 카드
  '260528_등록이미지/CMS관리시스템데시보드.png',     // CMS 카드
  'images/multibom_dashboard_real.png',          // Multi-BOM 기능 카드 (영어 목업 대체용)
  '260528_등록이미지/관리자데시보드.png',           // 대시보드 갤러리 + PDM 미리보기
  '260528_등록이미지/팀장데시보드_02.png',          // 대시보드 갤러리
  '260528_등록이미지/개인데시보드_01.png',          // 대시보드 갤러리
  '260528_등록이미지/도면등록_01.png',             // PDM 미리보기 그리드
];

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const rel of targets) {
  const buf = readFileSync(ROOT + rel);
  const b64 = buf.toString('base64');
  const webpB64 = await page.evaluate(async ({ b64, q }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q).split(',')[1];
  }, { b64, q: Q });
  const outRel = rel.replace(/\.png$/i, '.webp');
  const outBuf = Buffer.from(webpB64, 'base64');
  writeFileSync(ROOT + outRel, outBuf);
  results.push({
    out: outRel,
    pngKB: Math.round(statSync(ROOT + rel).size / 1024),
    webpKB: Math.round(outBuf.length / 1024),
  });
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
