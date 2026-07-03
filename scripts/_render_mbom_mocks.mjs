// CLIP MMS Multi-BOM 목업 4종 렌더링 → 비교용 스크린샷
import { chromium } from 'playwright';

const outDir = process.argv[2] || '/tmp/mbom-mocks';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main';
const browser = await chromium.launch();

for (let i = 1; i <= 4; i++) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
  const file = `${ROOT}/CLIP MMS/enterprise_multi-bom_management_grid_${i}/code.html`;
  try {
    await page.goto('file://' + file, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    console.log(`mock ${i}: networkidle timeout — capturing anyway`);
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outDir}/mock-${i}.png` });
  console.log(`saved mock-${i}`);
  await page.close();
}
await browser.close();
