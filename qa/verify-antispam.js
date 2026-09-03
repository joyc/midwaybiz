const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];

  async function newFormPage() {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
    await page.waitForTimeout(600);
    return page;
  }

  // --- 场景 1：蜜罐被填（模拟机器人）→ 应伪装成功但实际走 isBot 分支 ---
  let page = await newFormPage();
  await page.fill('#fName', 'Bot Test');
  await page.fill('#fEmail', 'bot@example.com');
  await page.fill('#fMessage', 'hello this is a bot message');
  await page.evaluate(() => { document.getElementById('fWebsite').value = 'http://spam.example'; });
  // 标记：拦截 window.setTimeout 观察是否走 fakeSuccess（与正常路径同表现，故用键盘计数区分：
  // 机器人路径特征是 formStartedAt 已设且 keystrokes 少 + honeypot 有值；直接断言成功框出现且耗时正常）
  await page.click('#formSubmit');
  await page.waitForTimeout(1400);
  const s1 = await page.evaluate(() => ({
    successShown: !document.getElementById('formSuccess').hidden,
    formHidden: document.getElementById('contactForm').hidden
  }));
  console.log('场景1 蜜罐命中(伪装成功):', JSON.stringify(s1));
  await page.close();

  // --- 场景 2：链接过多（真人误触）→ 应显示软错误，不提交 ---
  page = await newFormPage();
  await page.click('#fName'); await page.keyboard.type('山田太郎');
  await page.click('#fEmail'); await page.keyboard.type('yamada@example.com');
  await page.click('#fMessage'); await page.keyboard.type('参考: https://a.com https://b.com https://c.com よろしく');
  await page.click('#formSubmit');
  await page.waitForTimeout(600);
  const s2 = await page.evaluate(() => ({
    errShown: !document.getElementById('errMessage').hidden,
    errText: document.getElementById('errMessage').textContent,
    successShown: !document.getElementById('formSuccess').hidden
  }));
  console.log('场景2 链接过多(软错误):', JSON.stringify(s2));
  await page.close();

  // --- 场景 3：正常真人填写（键盘输入 + 停留 3s+）→ 应正常成功 ---
  page = await newFormPage();
  await page.click('#fName'); await page.keyboard.type('山田太郎');
  await page.click('#fEmail'); await page.keyboard.type('yamada@example.com');
  await page.click('#fMessage'); await page.keyboard.type('OEM 生産について相談したいです。');
  await page.waitForTimeout(3200); // 超过时间陷阱阈值
  await page.click('#formSubmit');
  await page.waitForTimeout(1400);
  const s3 = await page.evaluate(() => ({
    successShown: !document.getElementById('formSuccess').hidden,
    errShown: !document.getElementById('errMessage').hidden
  }));
  console.log('场景3 正常提交(成功):', JSON.stringify(s3));
  await page.close();

  // --- 场景 4：蜜罐字段对真人不可见 + 不可 Tab 聚焦 ---
  page = await newFormPage();
  const s4 = await page.evaluate(() => {
    const hp = document.getElementById('fWebsite');
    const r = hp.getBoundingClientRect();
    return { offscreen: r.left < 0 || r.width <= 1, tabindex: hp.tabIndex,
             turnstileHidden: document.getElementById('turnstileBox').hidden };
  });
  console.log('场景4 蜜罐不可见/Tab跳过/Turnstile默认隐藏:', JSON.stringify(s4));
  await page.close();

  console.log('js errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
