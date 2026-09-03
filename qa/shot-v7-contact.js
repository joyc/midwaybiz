const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  // 桌面
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await page.waitForTimeout(1300);
  await page.screenshot({ path: OUT + '/v7-contact.png' });
  const geo = await page.evaluate(() => {
    const en = document.querySelector('.contact-en');
    const enR = en.getBoundingClientRect();
    const cta = document.querySelector('.contact__cta').getBoundingClientRect();
    const info = document.querySelector('.contact__info').getBoundingClientRect();
    return {
      enAboveCta: Math.round(cta.top - enR.bottom),
      enInRightCol: enR.left > info.right,
      enOverflow: en.scrollWidth > en.clientWidth + 1,
      enW: en.scrollWidth, colW: Math.round(cta.width)
    };
  });
  console.log('desktop:', JSON.stringify(geo));
  // 移动
  const m = await browser.newPage({ viewport: { width: 375, height: 812 } });
  m.on('pageerror', e => errors.push(e.message));
  await m.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await m.waitForTimeout(2200);
  await m.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await m.waitForTimeout(1200);
  await m.screenshot({ path: OUT + '/v7-mobile-contact.png' });
  const mgeo = await m.evaluate(() => {
    const en = document.querySelector('.contact-en');
    return { enOverflow: en.scrollWidth > en.clientWidth + 1, enW: en.scrollWidth, vw: innerWidth };
  });
  console.log('mobile:', JSON.stringify(mgeo));
  console.log('js errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
