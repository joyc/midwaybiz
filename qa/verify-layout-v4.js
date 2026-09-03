const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: OUT + '/v4-hero.png' });

  const geo = await page.evaluate(() => {
    const w = document.querySelector('.hero__wordwrap').getBoundingClientRect();
    const o = document.querySelector('.hero__orbit').getBoundingClientRect();
    return { wordRight: Math.round(w.right), orbitLeft: Math.round(o.left), orbitRight: Math.round(o.right),
             gap: Math.round(o.left - w.right), vw: innerWidth,
             wordVCenter: Math.round(w.top + w.height/2), orbitVCenter: Math.round(o.top + o.height/2) };
  });
  console.log('hero geometry:', JSON.stringify(geo));

  await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await page.waitForTimeout(1400);
  await page.screenshot({ path: OUT + '/v4-contact.png' });

  const cgeo = await page.evaluate(() => {
    const items = document.querySelectorAll('.contact-list li');
    const last = items[items.length-1].getBoundingClientRect();
    const en = document.querySelector('.contact-en').getBoundingClientRect();
    return { lastRowBottom: Math.round(last.bottom), letsTalkTop: Math.round(en.top),
             gap: Math.round(en.top - last.bottom), text: document.querySelector('.contact-en').textContent.trim() };
  });
  console.log('contact geometry:', JSON.stringify(cgeo));

  const sections = ['#about','#business','#oem','#stats'];
  for (const s of sections) {
    await page.evaluate(sel => { const el = document.querySelector(sel); if (el) el.scrollIntoView(); }, s);
    await page.waitForTimeout(900);
  }
  console.log('js errors:', errors.length ? errors.join('\n') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
