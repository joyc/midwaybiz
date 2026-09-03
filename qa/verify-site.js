const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-proxy-server', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const out = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
  const fs = require('fs');
  fs.mkdirSync(out, { recursive: true });

  // 1. Hero 首屏
  await page.screenshot({ path: out + '/s-hero.png' });

  // 2. 逐板块平滑滚动截图
  for (const id of ['about', 'business', 'brands', 'oem', 'ec', 'company', 'contact']) {
    await page.evaluate((id) => {
      document.getElementById(id).scrollIntoView({ behavior: 'instant', block: 'start' });
    }, id);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${out}/s-${id}.png` });
  }

  // 3. 页脚
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: out + '/s-footer.png' });

  // 4. is-in 统计 + 语言切换测试
  const stats = await page.evaluate(() => ({
    total: document.querySelectorAll('[data-reveal],[data-clip]').length,
    revealed: document.querySelectorAll('.is-in').length
  }));

  // 5. 切到英文
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.click('[data-lang="en"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: out + '/s-en.png' });
  const enTitle = await page.title();

  // 6. 切到中文
  await page.click('[data-lang="zh"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: out + '/s-zh.png' });
  const zhTitle = await page.title();

  // 7. 移动端
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.querySelector('[data-lang="ja"]').click());
  await page.waitForTimeout(800);
  await page.screenshot({ path: out + '/s-mobile.png' });
  // 移动端抽屉
  await page.click('#menuToggle');
  await page.waitForTimeout(900);
  await page.screenshot({ path: out + '/s-mobile-drawer.png' });

  console.log(JSON.stringify({ stats, enTitle, zhTitle, errors }, null, 2));
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
