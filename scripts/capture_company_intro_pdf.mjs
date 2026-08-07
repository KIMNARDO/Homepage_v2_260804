import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outputDir = path.join(root, 'tmp', 'pdfs', 'company-intro-pages');
const url = process.env.COMPANY_INTRO_URL || 'http://127.0.0.1:4192/company-intro.html';

const pages = [
  ['01-cover', '#cover', 1],
  ['02-story', '#story', 1],
  ['03-platform', '#platform', 0.7],
  ['04-products', '#products', 0.7],
  ['05-multibom', '#multibom', 0.7],
  ['06-execution', '#execution', 0.7],
  ['07-cost', '#cost', 1],
  ['08-contact', '#contact', 1],
];

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 810 },
  deviceScaleFactor: 1.5,
  colorScheme: 'dark',
});
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle' });
await page.addStyleTag({
  content: `
    html { scroll-behavior: auto !important; }
    .intro-header, .motion-toggle, .intro-progress { display: none !important; }
    .cover-layout { padding-top: 64px !important; }
    .story-layout,
    .platform-layout,
    .products-layout,
    .multibom-layout,
    .execution-layout,
    .cost-layout,
    .contact-layout { padding-top: 72px !important; }
    .reveal-block { opacity: 1 !important; transform: none !important; }
    .line-mask .line { transform: none !important; transition: none !important; }
    video { filter: saturate(1.05) contrast(1.03); }
  `,
});

await page.evaluate(async () => {
  const videos = [...document.querySelectorAll('video')];
  const representativeFrames = [14, 8, 7, 2.2];
  await Promise.all(videos.map((video, index) => new Promise((resolve) => {
    const finish = () => {
      try {
        video.pause();
        const targetTime = representativeFrames[index] ?? 2.2;
        video.currentTime = Number.isFinite(video.duration)
          ? Math.min(targetTime, Math.max(0, video.duration - 0.25))
          : targetTime;
      } catch {}
      resolve();
    };
    if (video.readyState >= 2) finish();
    else video.addEventListener('loadeddata', finish, { once: true });
    setTimeout(finish, 2500);
  })));
});

for (const [name, selector, scale] of pages) {
  await page.evaluate(({ target, sectionScale }) => {
    document.querySelectorAll('.scene-inner').forEach((inner) => {
      inner.style.removeProperty('transform');
      inner.style.removeProperty('transform-origin');
      inner.style.removeProperty('width');
      inner.style.removeProperty('margin-left');
    });

    const section = document.querySelector(target);
    const inner = section?.querySelector('.scene-inner');
    if (inner && sectionScale < 1) {
      const expandedWidth = 96 / sectionScale;
      inner.style.transform = `scale(${sectionScale})`;
      inner.style.transformOrigin = 'top left';
      inner.style.width = `${expandedWidth}%`;
      inner.style.marginLeft = '2%';
    }
    section?.scrollIntoView({ block: 'start' });
  }, { target: selector, sectionScale: scale });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    type: 'png',
    fullPage: false,
  });
}

await browser.close();
console.log(outputDir);
