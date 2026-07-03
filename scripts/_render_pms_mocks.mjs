// CLIP PMS 라이트 간트 목업 후보 렌더링
import { chromium } from 'playwright';

const outDir = process.argv[2] || '/tmp/pms-mocks';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/CLIP PMS';
const CANDIDATES = [
  'advanced_gantt_chart_admin_view_1',
  'advanced_gantt_chart_admin_view_2',
  'advanced_gantt_chart_admin_view_3',
  'customer_schedule_&_gantt_management',
  'multi-gantt_project_dashboard_1',
  'multi-gantt_project_dashboard_2',
];

const browser = await chromium.launch();
for (const name of CANDIDATES) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1.5 });
  try {
    await page.goto(`file://${ROOT}/${name}/code.html`, { waitUntil: 'networkidle', timeout: 25000 });
  } catch {}
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${outDir}/${name.replace(/[^a-z0-9_-]/gi, '_')}.png` });
  console.log('saved', name);
  await page.close();
}
await browser.close();
