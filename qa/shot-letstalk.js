const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);
  await page.evaluate(() => document.querySelector('.contact-en').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: OUT + '/v4-letstalk.png' });
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
