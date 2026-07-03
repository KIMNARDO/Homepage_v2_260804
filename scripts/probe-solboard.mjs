import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 980 } });
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.evaluate(() => {
  const el = document.querySelector('.solution-board');
  const y = el.getBoundingClientRect().top + window.scrollY - 130;
  window.scrollTo(0, y);
});
await p.waitForTimeout(600);
await p.screenshot({ path: 'scripts/shots/rd-solboard-viewport.png' });
// confirm step numbers present + visible
const steps = await p.evaluate(() =>
  [...document.querySelectorAll('.solution-axis-step')].map((s) => ({
    text: s.textContent.trim(),
    visible: s.getBoundingClientRect().height > 0 && getComputedStyle(s).color,
  }))
);
console.log(JSON.stringify(steps, null, 2));
await b.close();
