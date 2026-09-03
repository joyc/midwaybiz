const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: OUT + '/v6-mobile-hero.png' });
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.screenshot({ path: OUT + '/v6-mobile-contact.png' });
  await page.click('#contactOpen');
  await page.waitForTimeout(700);
  await page.screenshot({ path: OUT + '/v6-mobile-modal.png' });
  console.log('js errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
