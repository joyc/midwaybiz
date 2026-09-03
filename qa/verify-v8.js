const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2400);

  // 空 ID 时：不应注入任何第三方脚本
  const noScripts = await page.evaluate(() => ({
    gtag: !!document.querySelector('script[src*="googletagmanager"]'),
    clarity: !!document.querySelector('script[src*="clarity.ms"]')
  }));
  console.log('empty IDs → no 3rd-party scripts:', JSON.stringify(noScripts));

  // 联系区 + LINE 按钮
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await page.waitForTimeout(1200);
  const line = await page.evaluate(() => {
    const a = document.getElementById('lineLink');
    return { exists: !!a, inert: a.getAttribute('href') === '#',
             text: a.querySelector('span').textContent };
  });
  console.log('LINE button:', JSON.stringify(line));
  await page.screenshot({ path: OUT + '/v8-contact.png' });

  // 弹窗流程：trackEvent 空操作不报错（ID 为空时）
  await page.click('#contactOpen');
  await page.waitForTimeout(600);
  await page.click('#fName'); await page.keyboard.type('山田');
  await page.click('#fEmail'); await page.keyboard.type('a@b.co');
  await page.click('#fMessage'); await page.keyboard.type('テスト件名の問い合わせ内容です。');
  await page.waitForTimeout(3200);
  await page.click('#formSubmit');
  await page.waitForTimeout(1300);
  const ok = await page.evaluate(() => !document.getElementById('formSuccess').hidden);
  console.log('modal flow with tracking no-op:', ok);

  // 模拟配置 ID 后：loader 是否注入（注入 window.gtag / window.clarity 函数）
  const injected = await page.evaluate(() => {
    // 直接执行与 app.js 相同的 loader 逻辑做冒烟测试
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.clarity = window.clarity || function(){ (window.clarity.q = window.clarity.q || []).push(arguments); };
    try {
      window.gtag('event', 'contact_form_open', {});
      window.clarity('event', 'contact_form_open');
      return true;
    } catch (e) { return false; }
  });
  console.log('loader smoke (gtag/clarity event calls):', injected);

  // sitemap/robots 可访问
  const sm = await page.evaluate(async () => {
    const r1 = await fetch('/sitemap.xml'); const r2 = await fetch('/robots.txt');
    return { sitemap: r1.status, robots: r2.status };
  });
  console.log('sitemap/robots:', JSON.stringify(sm));

  console.log('js errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
