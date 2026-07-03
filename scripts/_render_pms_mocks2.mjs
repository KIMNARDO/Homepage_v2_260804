// CLIP PMS 나머지 목업 후보 렌더링 (라이트 테마 탐색)
import { chromium } from 'playwright';

const outDir = process.argv[2] || '/tmp/pms-mocks2';
const { mkdirSync } = await import('fs');
mkdirSync(outDir, { recursive: true });

const ROOT = '/mnt/d/jarvix/projects/papsnet-homepage/papsnet-homepage-main/CLIP PMS';
const CANDIDATES = [
  'clip_pms_dashboard_overview_1',
  'clip_pms_dashboard_overview_2',
  'clip_pms_dashboard_overview_3',
  'clip_pms_dashboard_overview_4',
  'milestone_&_calendar_management_view',
  'resource_workload_management_screen_1',
  'resource_workload_management_screen_2',
  'advanced_gantt_chart_admin_view_3',
  'multi-gantt_project_dashboard_2',
  'multi-gantt_project_dashboard_3',
];

const browser = await chromium.launch();
for (const name of CANDIDATES) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
  try {
    await page.goto(`file://${ROOT}/${name}/code.html`, { waitUntil: 'networkidle', timeout: 25000 });
  } catch {}
  await page.waitForTimeout(1800);
  await page.screenshot({ path: `${outDir}/${name.replace(/[^a-z0-9_-]/gi, '_')}.png` });
  console.log('saved', name);
  await page.close();
}
await browser.close();
