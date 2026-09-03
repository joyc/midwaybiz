const { chromium } = require('playwright-core');
const OUT = '/Users/hython/WorkBuddy/2026-09-03-12-36-52/pw';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8791/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2800);

  // 1) hero：Manrope + 字母拆分 + 漢字 + 滚动指示 + 转圈位置
  const hero = await page.evaluate(() => {
    const letters = document.querySelectorAll('.hero__letter').length;
    const wordFont = getComputedStyle(document.querySelector('.hero__word')).fontFamily;
    const kanji = document.querySelector('.hero__kanji').getBoundingClientRect();
    const w = document.querySelector('.hero__wordwrap').getBoundingClientRect();
    const o = document.querySelector('.hero__orbit').getBoundingClientRect();
    const cue = document.querySelector('.scroll-cue').getBoundingClientRect();
    return { letters, wordFont: wordFont.slice(0, 30), kanjiVisible: kanji.width > 0,
             orbitGap: Math.round(o.left - w.right), orbitInView: o.right < innerWidth,
             cueY: Math.round(cue.top) };
  });
  console.log('hero:', JSON.stringify(hero));
  await page.screenshot({ path: OUT + '/v6-hero.png' });

  // 2) 联系区：CTA 面板替代表单 + LET'S TALK Manrope 宽度不溢出
  await page.evaluate(() => document.querySelector('#contact').scrollIntoView());
  await page.waitForTimeout(1200);
  const contact = await page.evaluate(() => {
    const en = document.querySelector('.contact-en');
    return {
      inlineFormGone: !document.querySelector('.contact__formwrap'),
      ctaExists: !!document.querySelector('.contact__cta'),
      letsTalkFont: getComputedStyle(en).fontFamily.slice(0, 30),
      letsTalkOverflow: en.scrollWidth > en.clientWidth + 1,
      letsTalkW: en.scrollWidth
    };
  });
  console.log('contact:', JSON.stringify(contact));
  await page.screenshot({ path: OUT + '/v6-contact.png' });

  // 3) 弹窗：打开 → 焦点 → 填写提交 → 成功 → ESC 关闭 → 重置
  await page.click('#contactOpen');
  await page.waitForTimeout(800);
  const modalOpen = await page.evaluate(() => ({
    isOpen: document.getElementById('contactModal').classList.contains('is-open'),
    bodyLocked: document.body.classList.contains('modal-open'),
    focused: document.activeElement.id
  }));
  console.log('modal open:', JSON.stringify(modalOpen));
  await page.screenshot({ path: OUT + '/v6-modal.png' });

  await page.click('#fName'); await page.keyboard.type('山田太郎');
  await page.click('#fEmail'); await page.keyboard.type('yamada@example.com');
  await page.click('#fMessage'); await page.keyboard.type('OEM 生産について相談したいです。');
  await page.waitForTimeout(3200);
  await page.click('#formSubmit');
  await page.waitForTimeout(1400);
  const submitted = await page.evaluate(() => ({
    successShown: !document.getElementById('formSuccess').hidden
  }));
  console.log('modal submit:', JSON.stringify(submitted));
  await page.screenshot({ path: OUT + '/v6-modal-success.png' });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const afterClose = await page.evaluate(() => ({
    hidden: document.getElementById('contactModal').hidden,
    unlocked: !document.body.classList.contains('modal-open'),
    formReset: !document.getElementById('contactForm').hidden && !document.getElementById('fName').value,
    focusBack: document.activeElement.id
  }));
  console.log('after close:', JSON.stringify(afterClose));

  // 4) 滚动后 cue 淡出 + 视差生效
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(800);
  const fx = await page.evaluate(() => ({
    cueHidden: document.querySelector('.scroll-cue').classList.contains('is-hidden'),
    kanjiTransform: document.querySelector('.hero__kanji').style.transform || 'none'
  }));
  console.log('scroll fx:', JSON.stringify(fx));

  // 5) zh/en 切换新键
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('.lang-switch__btn[data-lang="zh"]');
  await page.waitForTimeout(400);
  const zh = await page.evaluate(() => document.querySelector('#contactOpen span').textContent);
  await page.click('.lang-switch__btn[data-lang="en"]');
  await page.waitForTimeout(400);
  const en = await page.evaluate(() => document.querySelector('#contactOpen span').textContent);
  console.log('i18n cta:', JSON.stringify({ zh, en }));

  console.log('js errors:', errors.length ? errors.join(' | ') : 'none');
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
