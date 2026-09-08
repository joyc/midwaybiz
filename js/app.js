/* ==========================================================================
   MIDWAY Co., Ltd. — app.js（vanilla JS · 零依赖）
   模块分区：
   1. I18N        三语字典与切换（ja 默认 / zh / en，localStorage 持久化）
   2. HEADER      滚动实色化 + scroll spy 导航高亮
   3. DRAWER      移动端全屏抽屉菜单
   4. REVEAL      IntersectionObserver 滚动揭示（stagger）
   5. CLIP        Hero/OEM 图片 clip-path 揭示
   6. COUNTERS    数字计数动画（进入视口一次）
   7. MARQUEE     无限滚动条（内容复制实现无缝）
   8. BRANDTRACK  品牌卡带拖拽横移
   9. ANCHORS     平滑锚点滚动兜底
   10. FORM       联系表单校验 + 提交（可配置真实端点）
   11. MISC       回到顶部 / 外链占位
   ========================================================================== */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE_POINTER = window.matchMedia('(pointer: fine)').matches;

  /* ========================================================================
     0.5 ANALYTICS — GA4 + Microsoft Clarity（填入 ID 即自动加载，不填不加载）
     要确认：GA4_MEASUREMENT_ID（G-XXXXXXXXXX）/ CLARITY_PROJECT_ID
     事件：contact_form_open（弹窗打开）/ contact_form_submit（提交成功）
     ======================================================================== */
  var GA4_MEASUREMENT_ID = '';
  var CLARITY_PROJECT_ID = '';

  if (GA4_MEASUREMENT_ID) {
    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_MEASUREMENT_ID;
    document.head.appendChild(gaScript);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
  }
  if (CLARITY_PROJECT_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
  }

  /* 统一事件出口：gtag / clarity 同时上报，未配置时为空操作 */
  function trackEvent(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
    if (window.clarity) window.clarity('event', name);
  }


  /* ========================================================================
     0. PRELOADER — 首屏加载幕（融合自参考版）
     最短停留 1050ms，load 后上滑离场；reduced-motion 直接跳过
     ======================================================================== */
  var loader = document.getElementById('loader');
  function siteReady() {
    document.body.classList.remove('is-loading');
    if (loader) loader.classList.add('is-done');
  }
  if (REDUCED || !loader) {
    siteReady();
  } else {
    var loadT0 = performance.now();
    var LOAD_MIN = 1050;
    var loadDone = false;
    function finishLoad() {
      if (loadDone) return;
      loadDone = true;
      var rest = Math.max(0, LOAD_MIN - (performance.now() - loadT0));
      window.setTimeout(siteReady, rest);
    }
    if (document.readyState === 'complete') finishLoad();
    else window.addEventListener('load', finishLoad);
    window.setTimeout(finishLoad, 2500); /* 兜底：load 被阻塞也不卡死 */
  }

  /* ========================================================================
     1. I18N — 三语字典
     数値・住所・電話等の具体値は保守的な例示（要确认：客户確定後に差し替え）
     ======================================================================== */
  var DICT = {
    ja: {
      'meta.title': '株式会社MIDWAY｜日本と世界の中間点で、価値を編む。',
      'meta.desc': '株式会社MIDWAYは、越境貿易・自社ブランド（アパレル／子供革靴）・OEM生産・ECストア運営を一気通貫で手がけるトレーディングカンパニーです。',

      'nav.about': '会社について',
      'nav.business': '事業内容',
      'nav.brands': 'ブランド',
      'nav.oem': 'OEM',
      'nav.ec': 'EC',
      'nav.company': '会社概要',
      'nav.contact': 'お問い合わせ',

      'a11y.menuOpen': 'メニューを開く',
      'a11y.menuClose': 'メニューを閉じる',
      'a11y.backToTop': 'ページ上部へ戻る',
      'a11y.skip': 'コンテンツへスキップ',

      'hero.title': '日本と世界の<span class="u-vermilion">中間点</span>で、<br>価値を編む。',
      'hero.lead': '貿易から自社ブランド（アパレル／子供革靴）、OEM生産、ECストア運営まで。モノと価値が行き交う「MIDWAY＝中間点」から、次のビジネスをつくります。',
      'hero.ctaPrimary': '事業内容を見る',
      'hero.ctaSecondary': 'お問い合わせ',
      'hero.vertical': '株式会社ミッドウェー',

      'img.heroMain': 'ミッドウェイのアパレルルック——服装編集イメージ',
      'img.heroFabric': '生地の質感クローズアップ',
      'img.heroKids': '3elves の子供革靴',
      'img.brandApparel': 'WEARSHOW のルックイメージ',
      'img.brandKids': '3elves の子供革靴ルック',
      'img.oemFactory': '縫製工場の作業風景',

      'about.vertical': '会社について',
      'about.title': '行き交うものごとの、<br>中間点に立つ。',
      'about.lead': 'ブランドの想いと、ものづくりの現場。日本の市場と、世界の工場。株式会社MIDWAYは、それらの「間（＝midway）」に立つ会社です。',
      'about.p1': '2023年の創業以来、越境貿易で培った調達力と、自社ブランドで磨いた企画力。その二つを両輪に、生地の選定から縫製、検品、店頭に並ぶ瞬間まで、一貫して品質を見つめてきました。',
      'about.p2': '海を隔てた工場と、日本の店舗と。そのあいだに立ち、言葉と品質の橋渡しをする。それが社名の由来であり、これからも変わらない約束です。',

      'pillar1.name': 'つなぐ',
      'pillar1.desc': '海外のサプライチェーンと日本市場を、最短距離で結ぶ。',
      'pillar2.name': 'つくる',
      'pillar2.desc': 'アパレルと子供革靴の企画から生産まで、一気通貫で手がける。',
      'pillar3.name': 'まわす',
      'pillar3.desc': 'ECストアを軸に、ブランドと顧客を結ぶ体験を運営する。',

      'stats.founded': '設立',
      'stats.foundedUnit': '年',
      'stats.countries': '取引国数',
      'stats.countriesUnit': 'カ国',
      'stats.bases': '拠点数',
      'stats.basesUnit': '拠点',
      'stats.items': '年間生産点数',
      'stats.itemsUnit': '万点',
      'stats.note': '※ 数値は概数です。',

      'business.title': '事業内容',
      'business.lead': '四つの事業はすべて、「中間点で価値を編む」というひとつの思想の上にあります。',
      'biz.trade.name': '越境貿易',
      'biz.trade.desc': '日本と中国・東南アジアを結ぶ貿易実務。生地・資材の調達から製品の輸出入まで、一貫して支えます。',
      'biz.brand.name': 'ブランド事業',
      'biz.brand.desc': '自社アパレルブランドと子供革靴ブランドの企画・生産・販売。素材と縫製にこだわったものづくり。',
      'biz.oem.name': 'OEM生産',
      'biz.oem.desc': '国内アパレル・雑貨メーカー様の企画を形にする受託生産。小ロットから量産まで対応します。',
      'biz.ec.name': 'EC運営',
      'biz.ec.desc': '楽天市場・Amazonなど国内主要モールでの自社店舗運営。企画から発送・CSまで内製で運用。',

      'brands.title': 'ブランド',
      'brands.lead': '素材と仕立てに向き合う、二つの自社ブランド。',
      'brands.brand1.desc': '毎日の眠りをもっと心地よく。やさしい肌ざわりと快適な着心地にこだわった、家族みんなのためのルームウェア・パジャマをお届けします。',
      'brands.brand1.cat1': 'レディース',
      'brands.brand1.cat2': 'メンズ',
      'brands.brand1.cat3': 'キッズ',
      'brands.brand2.desc': 'はじめての一歩を、やさしく支える子供革靴。成長する足に寄り添う設計と、安心の素材選び。',
      'brands.brand2.cat1': 'キッズ',
      'brands.brand2.cat2': 'シューズ',
      'brands.brand2.cat3': 'ベビー',

      'oem.title': '小ロットから、量産まで。',
      'oem.lead': '日本国内のアパレル・雑貨メーカー様へ、企画から納品まで一貫した受託生産をご提供します。',
      'oem.desc': '提携工場との長年の取引関係と、国内基準の検品体制。仕様書づくりからご相談に乗り、ブランドの品質をそのまま形にします。',
      'oem.ctaPrimary': 'お問い合わせ',
      'oem.ctaSecondary': '制作実績を見る',
      'oem.step1.name': 'ご相談',
      'oem.step1.desc': 'ご要望・数量・ご予算を伺います。',
      'oem.step2.name': '企画・デザイン',
      'oem.step2.desc': '素材選定と仕様書を作成します。',
      'oem.step3.name': 'サンプル作成',
      'oem.step3.desc': '実物サンプルで品質をご確認。',
      'oem.step4.name': '量産',
      'oem.step4.desc': '提携工場で一貫して生産します。',
      'oem.step5.name': '検品',
      'oem.step5.desc': '国内基準で検品を実施します。',
      'oem.step6.name': '納品',
      'oem.step6.desc': 'ご指定の納期・場所へお届け。',
      'oem.cap.moq.label': '最小ロット',
      'oem.cap.moq.value': '100点〜（アイテムによりご相談）',
      'oem.cap.leadtime.label': 'リードタイム',
      'oem.cap.leadtime.value': 'サンプル 約2週間 / 量産 約30日〜',
      'oem.cap.items.label': '対応品目',
      'oem.cap.items.value': 'アパレル製品全般、靴・服飾雑貨など',

      'ec.title': 'EC ストア',
      'ec.lead': '公式ストアおよび楽天市場・Amazonなど国内主要モールで、自社ブランドの商品をお求めいただけます。',
      'ec.store1.desc': 'WEARSHOW・3elves の全ラインナップ',
      'ec.store2.desc': '定番アイテムを中心とした品揃え',
      'ec.store3.desc': 'セール・限定アイテムを展開',
      'ec.store4.desc': '公式オンラインストアで、3elves の全アイテムを販売中。',
      'ec.note': '※ 各ストアは外部サイトへ移動します。',

      'company.title': '会社概要',
      'company.name.label': '会社名',
      'company.name.value': '株式会社MIDWAY（MIDWAY Co., Ltd.）',
      'company.address.label': '所在地',
      'company.address.value': '〒107-0061 東京都港区北青山一丁目3番1号 アールキューブ青山3F',
      'company.established.label': '設立',
      'company.established.value': '2023年8月',
      'company.capital.label': '資本金',
      'company.capital.value': '500万円',
      'company.ceo.label': '代表取締役',
      'company.ceo.value': '史 セイ',
      'company.business.label': '事業内容',
      'company.business.item1': 'アパレル・靴の越境貿易',
      'company.business.item2': '自社ブランド（アパレル・子供革靴）の企画・生産・販売',
      'company.business.item3': '国内アパレル向けOEM受託生産',
      'company.business.item4': 'ECストアの運営',
      'company.partners.label': '主要取引先',
      'company.partners.value': '国内アパレルメーカー各社、中国・東南アジアの製造パートナー ほか',

      'contact.title': 'お問い合わせ',
      'contact.lead': '越境貿易・OEMのご相談、ブランドとの協業など、お気軽にご連絡ください。',
      'contact.phone.label': '電話',
      'contact.mail.label': 'メール',
      'contact.address.label': '所在地',
      'contact.address.value': '東京都港区北青山一丁目3番1号 アールキューブ青山3F',
      'contact.hours.label': '営業時間',
      'contact.hours.value': '平日 9:30–18:30（土日祝休）',
      'contact.ctaText': 'ご相談・お見積もりは専用フォームから。2営業日以内にご返信いたします。',
      'contact.ctaButton': 'お問い合わせフォームを開く',
      'contact.modalTitle': 'お問い合わせ',
      'contact.modalClose': '閉じる',
      'contact.lineText': 'LINEで相談する',

      'form.company': '会社名',
      'form.name': 'お名前',
      'form.email': 'メールアドレス',
      'form.category': 'お問い合わせ種別',
      'form.message': 'お問い合わせ内容',
      'form.cat.trade': '越境貿易について',
      'form.cat.oem': 'OEM生産のご相談',
      'form.cat.brand': 'ブランドとの協業',
      'form.cat.other': 'その他',
      'form.submit': '送信する',
      'form.sending': '送信中…',
      'form.successTitle': '送信が完了しました',
      'form.successMsg': '担当者より2営業日以内にご連絡いたします。',
      'form.errRequired': 'この項目は必須です。',
      'form.errEmail': 'メールアドレスの形式が正しくありません。',
      'form.errLinks': 'リンク（URL）は2件までにしてください。',
      'form.errSend': '送信に失敗しました。しばらくしてからもう一度お試しください。',

      'footer.tagline': '日本と世界の中間点で、価値を編む。'
    },

    zh: {
      'meta.title': '株式会社MIDWAY｜立于日本与世界的中点，编织价值。',
      'meta.desc': '株式会社MIDWAY 业务涵盖跨境贸易、自有品牌（服装／童鞋）、OEM 委托生产与电商店铺运营，是立于日本与世界中点的贸易公司。',

      'nav.about': '公司简介',
      'nav.business': '主营业务',
      'nav.brands': '品牌',
      'nav.oem': 'OEM',
      'nav.ec': '电商',
      'nav.company': '公司概要',
      'nav.contact': '联系我们',

      'a11y.menuOpen': '打开菜单',
      'a11y.menuClose': '关闭菜单',
      'a11y.backToTop': '返回页面顶部',
      'a11y.skip': '跳转到主要内容',

      'hero.title': '立于日本与世界的<span class="u-vermilion">中点</span>，<br>编织价值。',
      'hero.lead': '从跨境贸易到自有品牌（服装／童鞋）、OEM 委托生产与电商店铺运营——MIDWAY 立于商品与价值往来的「中点」，创造下一场商业。',
      'hero.ctaPrimary': '了解主营业务',
      'hero.ctaSecondary': '联系我们',
      'hero.vertical': '株式会社MIDWAY',

      'img.heroMain': 'MIDWAY服装品牌造型大片',
      'img.heroFabric': '面料质感特写',
      'img.heroKids': '3elves 童鞋产品',
      'img.brandApparel': 'WEARSHOW 品牌造型',
      'img.brandKids': '3elves 品牌童鞋',
      'img.oemFactory': '缝制工厂作业场景',

      'about.vertical': '公司简介',
      'about.title': '立于往来事物的<br>中点。',
      'about.lead': '品牌的理念与制造的现场，日本的市场与世界的工厂。株式会社MIDWAY，正立于这些「之间（＝midway）」。',
      'about.p1': '自2023年创立以来，我们以跨境贸易锤炼的采购力与自有品牌打磨的企划力为双轮，从面料选定、缝制、检品，到商品上架的那一刻，始终凝视着品质。',
      'about.p2': '隔着大海的工厂与日本的门店之间，我们立于其间，做语言与品质的摆渡人。这是社名的由来，也是始终不变的承诺。',

      'pillar1.name': '连接',
      'pillar1.desc': '以最短路径连接海外供应链与日本市场。',
      'pillar2.name': '创造',
      'pillar2.desc': '从企划到生产，一气贯通地完成服装与童鞋。',
      'pillar3.name': '循环',
      'pillar3.desc': '以电商店铺为轴，运营连接品牌与顾客的体验。',

      'stats.founded': '创立年份',
      'stats.foundedUnit': '年',
      'stats.countries': '贸易往来国家',
      'stats.countriesUnit': '国',
      'stats.bases': '据点数量',
      'stats.basesUnit': '处',
      'stats.items': '年生产件数',
      'stats.itemsUnit': '万件',
      'stats.note': '※ 数值为约数。',

      'business.title': '主营业务',
      'business.lead': '四大事业环环相扣，覆盖从采购到销售的完整链路。',
      'biz.trade.name': '跨境贸易',
      'biz.trade.desc': '连接日本与中国、东南亚的贸易实务。从面料与辅料采购到成品进出口，提供一体化支持。',
      'biz.brand.name': '品牌事业',
      'biz.brand.desc': '自有服装品牌与童鞋品牌的企划、生产与销售。坚持在面料与缝制上较真。',
      'biz.oem.name': 'OEM生产',
      'biz.oem.desc': '承接日本国内服装与杂货品牌的委托生产，从小批量试单到规模化量产均可对应。',
      'biz.ec.name': '电商运营',
      'biz.ec.desc': '在乐天市场、Amazon等日本主流平台运营自营店铺，企划、发货与客服全部内化完成。',

      'brands.title': '品牌',
      'brands.lead': '认真面对面料与做工的两个自有品牌。',
      'brands.brand1.desc': '让每天的睡眠更舒适。注重亲肤触感与舒适穿着，为全家带来家居服与睡衣。',
      'brands.brand1.cat1': '女装',
      'brands.brand1.cat2': '男装',
      'brands.brand1.cat3': '儿童',
      'brands.brand2.desc': '温柔守护人生第一步的童鞋。贴合成长中脚型的设计与安心的选材。',
      'brands.brand2.cat1': '儿童',
      'brands.brand2.cat2': '童鞋',
      'brands.brand2.cat3': '婴幼儿',

      'oem.title': '从小批量，到规模化量产。',
      'oem.lead': '面向日本国内服装与杂货品牌，提供从企划到交付一体化完成的委托生产服务。',
      'oem.desc': '依托与协作工厂多年的合作关系和日本国内标准的检品体系，从规格书制作阶段即参与沟通，把品牌的品质要求原样落地。',
      'oem.ctaPrimary': '咨询合作',
      'oem.ctaSecondary': '查看制作实绩',
      'oem.step1.name': '需求咨询',
      'oem.step1.desc': '倾听您的需求、数量与预算。',
      'oem.step2.name': '企划设计',
      'oem.step2.desc': '选定素材并制作规格书。',
      'oem.step3.name': '样品制作',
      'oem.step3.desc': '以实物样品确认品质。',
      'oem.step4.name': '批量生产',
      'oem.step4.desc': '由协作工厂一体化生产。',
      'oem.step5.name': '检品',
      'oem.step5.desc': '按日本国内标准实施检品。',
      'oem.step6.name': '交付',
      'oem.step6.desc': '按指定交期与地点送达。',
      'oem.cap.moq.label': '最小起订量',
      'oem.cap.moq.value': '100件起（视品类可协商）',
      'oem.cap.leadtime.label': '交付周期',
      'oem.cap.leadtime.value': '样品约2周 / 量产约30天起',
      'oem.cap.items.label': '对应品类',
      'oem.cap.items.value': '服装产品全品类、鞋类及时尚配饰等',

      'ec.title': '电商店铺',
      'ec.lead': '可在官方商店以及乐天市场、Amazon 等日本主流平台购买我们的自有品牌商品。',
      'ec.store1.desc': 'WEARSHOW 与 3elves 全线商品',
      'ec.store2.desc': '以经典款为主的商品阵容',
      'ec.store3.desc': '促销与限定商品发售中',
      'ec.store4.desc': '官方在线商店，3elves 全系列商品有售。',
      'ec.note': '※ 各店铺将跳转至外部网站。',

      'company.title': '公司概要',
      'company.name.label': '公司名称',
      'company.name.value': '株式会社MIDWAY（MIDWAY Co., Ltd.）',
      'company.address.label': '所在地',
      'company.address.value': '〒107-0061 日本东京都港区北青山一丁目3番1号 R-CUBE青山 3F',
      'company.established.label': '成立时间',
      'company.established.value': '2023年8月',
      'company.capital.label': '注册资本',
      'company.capital.value': '500万日元',
      'company.ceo.label': '代表董事',
      'company.ceo.value': '史 セイ',
      'company.business.label': '事业内容',
      'company.business.item1': '服装与鞋类的跨境贸易',
      'company.business.item2': '自有品牌（服装、童鞋）的企划、生产与销售',
      'company.business.item3': '面向日本国内服装企业的OEM委托生产',
      'company.business.item4': '电商店铺运营',
      'company.partners.label': '主要合作方',
      'company.partners.value': '日本国内服装企业、中国与东南亚制造合作伙伴等',

      'contact.title': '联系我们',
      'contact.lead': '跨境贸易、OEM合作咨询、品牌联名等事宜，欢迎随时联系。',
      'contact.phone.label': '电话',
      'contact.mail.label': '邮箱',
      'contact.address.label': '地址',
      'contact.address.value': '日本东京都港区北青山一丁目3番1号 R-CUBE青山 3F',
      'contact.hours.label': '营业时间',
      'contact.hours.value': '工作日 9:30–18:30（周末及节假日休息）',
      'contact.ctaText': '商务咨询与报价请使用专用表单，我们将在 2 个工作日内回复。',
      'contact.ctaButton': '打开咨询表单',
      'contact.modalTitle': '联系我们',
      'contact.modalClose': '关闭',
      'contact.lineText': 'LINE 咨询',

      'form.company': '公司名称',
      'form.name': '姓名',
      'form.email': '电子邮箱',
      'form.category': '咨询类别',
      'form.message': '留言内容',
      'form.cat.trade': '跨境贸易咨询',
      'form.cat.oem': 'OEM委托生产',
      'form.cat.brand': '品牌合作',
      'form.cat.other': '其他',
      'form.submit': '提交',
      'form.sending': '提交中…',
      'form.successTitle': '提交成功',
      'form.successMsg': '我们将在2个工作日内与您联系。',
      'form.errRequired': '此项为必填项。',
      'form.errEmail': '邮箱格式不正确。',
      'form.errLinks': '留言中的链接（URL）最多 2 个。',
      'form.errSend': '发送失败，请稍后重试。',

      'footer.tagline': '立于日本与世界的中点，编织价值。'
    },

    en: {
      'meta.title': 'MIDWAY Co., Ltd. — Weaving value at the midway point between Japan and the world.',
      'meta.desc': 'MIDWAY Co., Ltd. is a trading company handling cross-border trade, in-house apparel and kids shoe brands, OEM manufacturing, and EC store operation — end to end.',

      'nav.about': 'About',
      'nav.business': 'Business',
      'nav.brands': 'Brands',
      'nav.oem': 'OEM',
      'nav.ec': 'EC Stores',
      'nav.company': 'Company',
      'nav.contact': 'Contact',

      'a11y.menuOpen': 'Open menu',
      'a11y.menuClose': 'Close menu',
      'a11y.backToTop': 'Back to top',
      'a11y.skip': 'Skip to content',

      'hero.title': 'At the <span class="u-vermilion">midway point</span> between Japan and the world,<br>we weave value.',
      'hero.lead': 'From cross-border trade to in-house brands (apparel and kids shoes), OEM manufacturing, and EC store operation — from MIDWAY, the point where goods and value cross, we create the next business.',
      'hero.ctaPrimary': 'Explore our business',
      'hero.ctaSecondary': 'Contact us',
      'hero.vertical': 'MIDWAY Co., Ltd.',

      'img.heroMain': 'Editorial look from the MIDWAY apparel line',
      'img.heroFabric': 'Close-up of fabric texture',
      'img.heroKids': '3elves kids shoes',
      'img.brandApparel': 'WEARSHOW brand look',
      'img.brandKids': '3elves kids shoes look',
      'img.oemFactory': 'Sewing floor at a partner factory',

      'about.vertical': 'About us',
      'about.title': 'Standing at the midway point<br>of all that moves.',
      'about.lead': "A brand's vision and the factory floor. The Japanese market and workshops around the world. MIDWAY Co., Ltd. stands in the space between — the midway.",
      'about.p1': 'Since our founding in 2023, two strengths have driven us: sourcing built through cross-border trade, and product planning refined through our own brands. From fabric selection to sewing, inspection, and the moment a product reaches the shelf, we never take our eyes off quality.',
      'about.p2': 'Between factories across the sea and stores in Japan, we stand in between, ferrying language and quality across. That is the origin of our name, and a promise that will not change.',

      'pillar1.name': 'Connect',
      'pillar1.desc': 'Linking global supply chains with the Japanese market via the shortest path.',
      'pillar2.name': 'Create',
      'pillar2.desc': "Handling apparel and kids' footwear from planning to production, end to end.",
      'pillar3.name': 'Circulate',
      'pillar3.desc': 'Operating experiences that connect brands and customers, centered on EC stores.',

      'stats.founded': 'Founded',
      'stats.foundedUnit': '',
      'stats.countries': 'Trading countries',
      'stats.countriesUnit': '',
      'stats.bases': 'Locations',
      'stats.basesUnit': '',
      'stats.items': 'Units produced / yr',
      'stats.itemsUnit': '×10k',
      'stats.note': '* Figures are approximate.',

      'business.title': 'Our Business',
      'business.lead': 'Every business rests on a single idea: weaving value at the midway point.',
      'biz.trade.name': 'Cross-Border Trade',
      'biz.trade.desc': 'Trade operations linking Japan with China and Southeast Asia — from fabric and material sourcing to finished-goods import and export.',
      'biz.brand.name': 'Apparel Brands',
      'biz.brand.desc': 'Planning, production, and sales of our in-house apparel and kids shoe brands, with uncompromising fabric and sewing standards.',
      'biz.oem.name': 'OEM Manufacturing',
      'biz.oem.desc': 'Contract manufacturing for Japanese apparel and goods companies — from small lots to full-scale production.',
      'biz.ec.name': 'E-Commerce',
      'biz.ec.desc': 'Operating our own stores on major Japanese marketplaces such as Rakuten and Amazon, with planning, fulfilment, and support in-house.',

      'brands.title': 'Brands',
      'brands.lead': 'Two in-house brands built on honest materials and tailoring.',
      'brands.brand1.desc': 'Roomwear and pajamas for the whole family — gentle on the skin and made for comfortable, better sleep every day.',
      'brands.brand1.cat1': 'Women',
      'brands.brand1.cat2': 'Men',
      'brands.brand1.cat3': 'Kids',
      'brands.brand2.desc': 'Kids shoes that gently support every first step — designed for growing feet, made with trusted materials.',
      'brands.brand2.cat1': 'Kids',
      'brands.brand2.cat2': 'Shoes',
      'brands.brand2.cat3': 'Baby',

      'oem.title': 'From small lots to full production.',
      'oem.lead': 'End-to-end contract manufacturing for Japanese apparel and goods companies, from planning to delivery.',
      'oem.desc': 'Long-standing relationships with partner factories and inspection to Japanese domestic standards. We join you at the spec-sheet stage and turn your brand’s quality into product.',
      'oem.ctaPrimary': 'Get in touch',
      'oem.ctaSecondary': 'See our work',
      'oem.step1.name': 'Consultation',
      'oem.step1.desc': 'We listen to your needs, volumes, and budget.',
      'oem.step2.name': 'Planning & Design',
      'oem.step2.desc': 'Material selection and spec sheets.',
      'oem.step3.name': 'Sampling',
      'oem.step3.desc': 'Confirm quality with physical samples.',
      'oem.step4.name': 'Production',
      'oem.step4.desc': 'Integrated production at partner factories.',
      'oem.step5.name': 'Inspection',
      'oem.step5.desc': 'Inspected to Japanese domestic standards.',
      'oem.step6.name': 'Delivery',
      'oem.step6.desc': 'Delivered to your schedule and location.',
      'oem.cap.moq.label': 'Minimum order',
      'oem.cap.moq.value': 'From 100 units (negotiable by item)',
      'oem.cap.leadtime.label': 'Lead time',
      'oem.cap.leadtime.value': 'Samples ~2 weeks / production ~30 days',
      'oem.cap.items.label': 'Product scope',
      'oem.cap.items.value': 'All types of apparel, footwear, and fashion accessories',

      'ec.title': 'EC Stores',
      'ec.lead': 'Our in-house brands are available at our official store and on major Japanese marketplaces.',
      'ec.store1.desc': 'The full WEARSHOW and 3elves lineup',
      'ec.store2.desc': 'A selection centred on staple items',
      'ec.store3.desc': 'Sales and limited-edition items',
      'ec.store4.desc': 'All 3elves items are available at our official online store.',
      'ec.note': '* Each store link leads to an external site.',

      'company.title': 'Company Profile',
      'company.name.label': 'Company name',
      'company.name.value': 'MIDWAY Co., Ltd.',
      'company.address.label': 'Address',
      'company.address.value': '3F, R-CUBE Aoyama, 1-3-1 Kita-Aoyama, Minato-ku, Tokyo 107-0061, Japan',
      'company.established.label': 'Established',
      'company.established.value': 'August 2023',
      'company.capital.label': 'Capital',
      'company.capital.value': 'JPY 5 million',
      'company.ceo.label': 'Representative Director',
      'company.ceo.value': 'Sei Shi',
      'company.business.label': 'Business lines',
      'company.business.item1': 'Cross-border trade of apparel and footwear',
      'company.business.item2': 'Planning, production, and sales of in-house brands (apparel & kids shoes)',
      'company.business.item3': 'OEM contract manufacturing for Japanese apparel companies',
      'company.business.item4': 'E-commerce store operations',
      'company.partners.label': 'Major partners',
      'company.partners.value': 'Japanese apparel companies; manufacturing partners in China and Southeast Asia',

      'contact.title': 'Contact Us',
      'contact.lead': 'For cross-border trade, OEM enquiries, or brand collaborations, feel free to reach out.',
      'contact.phone.label': 'Phone',
      'contact.mail.label': 'Email',
      'contact.address.label': 'Address',
      'contact.address.value': '3F, R-CUBE Aoyama, 1-3-1 Kita-Aoyama, Minato-ku, Tokyo',
      'contact.hours.label': 'Business hours',
      'contact.hours.value': 'Weekdays 9:30–18:30 (closed weekends & holidays)',
      'contact.ctaText': 'For enquiries and quotations, please use our contact form. We reply within 2 business days.',
      'contact.ctaButton': 'Open contact form',
      'contact.modalTitle': 'Contact us',
      'contact.modalClose': 'Close',
      'contact.lineText': 'Chat on LINE',

      'form.company': 'Company',
      'form.name': 'Name',
      'form.email': 'Email',
      'form.category': 'Enquiry type',
      'form.message': 'Message',
      'form.cat.trade': 'Cross-border trade',
      'form.cat.oem': 'OEM manufacturing',
      'form.cat.brand': 'Brand collaboration',
      'form.cat.other': 'Other',
      'form.submit': 'Send',
      'form.sending': 'Sending…',
      'form.successTitle': 'Message sent',
      'form.successMsg': 'Our team will get back to you within two business days.',
      'form.errRequired': 'This field is required.',
      'form.errEmail': 'Please enter a valid email address.',
      'form.errLinks': 'Please keep links (URLs) to 2 or fewer.',
      'form.errSend': 'Failed to send. Please try again later.',

      'footer.tagline': 'Weaving value at the midway point between Japan and the world.'
    }
  };

  var LANG_KEY = 'midway-lang';
  var SUPPORTED = ['ja', 'zh', 'en'];
  var currentLang = SUPPORTED.indexOf(localStorage.getItem(LANG_KEY)) >= 0
    ? localStorage.getItem(LANG_KEY)
    : 'ja';

  function t(key) {
    var pack = DICT[currentLang] || DICT.ja;
    return pack[key] != null ? pack[key] : (DICT.ja[key] != null ? DICT.ja[key] : key);
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = 'ja';
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);

    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : lang);
    document.title = t('meta.title');
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t('meta.desc'));

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) {
      el.setAttribute('alt', t(el.getAttribute('data-i18n-alt')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });

    document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  document.querySelectorAll('.lang-switch__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
    });
  });

  /* ========================================================================
     2. HEADER — 滚动实色化 + scroll spy
     ======================================================================== */
  var header = document.getElementById('siteHeader');
  var progressBar = document.getElementById('scrollProgressBar');

  /* 统一滚动处理（rAF 节流）：header 实色化 + 顶部阅读进度条 */
  var scrollTicking = false;
  function updateScroll() {
    scrollTicking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  }
  function onScrollHeader() {
    if (!scrollTicking) {
      requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  window.addEventListener('resize', onScrollHeader, { passive: true });
  updateScroll();

  var spyLinks = Array.prototype.slice.call(document.querySelectorAll('[data-spy]'));
  var spySections = spyLinks
    .map(function (link) { return document.getElementById(link.getAttribute('data-spy')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (link) {
          link.classList.toggle('is-active', link.getAttribute('data-spy') === entry.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    spySections.forEach(function (sec) { spyObserver.observe(sec); });
  }

  /* ========================================================================
     3. DRAWER — 移动端全屏抽屉
     ======================================================================== */
  var drawer = document.getElementById('drawer');
  var menuToggle = document.getElementById('menuToggle');
  var drawerClose = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    drawerClose.focus();
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ========================================================================
     4. REVEAL — IntersectionObserver 滚动揭示（stagger 80ms）
     ======================================================================== */
  /* 段落标题容器也纳入揭示（驱动 ::after 下划线划入动画） */
  document.querySelectorAll('.section-head').forEach(function (el) {
    el.setAttribute('data-reveal', '');
  });
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (REDUCED || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (entry, i) {
        entry.target.style.transitionDelay = (i * 80) + 'ms';
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ========================================================================
     5. CLIP — 图片 clip-path 揭示
     ======================================================================== */
  var clipEls = document.querySelectorAll('[data-clip]');
  if (REDUCED || !('IntersectionObserver' in window)) {
    clipEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var clipObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          clipObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    clipEls.forEach(function (el) { clipObserver.observe(el); });
  }

  /* ========================================================================
     5.5 REVEAL FAILSAFE — IO 未触发/被节流时保证首屏内容不滞留隐藏态
     ======================================================================== */
  function revealInViewport() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    document.querySelectorAll('[data-reveal]:not(.is-in), [data-clip]:not(.is-in)').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-in');
    });
  }
  window.addEventListener('load', function () { window.setTimeout(revealInViewport, 300); });
  window.setTimeout(revealInViewport, 1500);

  /* ========================================================================
     5.6 HERO 大字字母级入场 — MIDWAY 逐字母错峰升起
     无 JS / 减弱动效时不拆分，文字保持静态可见（CSS 默认无隐藏）
     ======================================================================== */
  (function splitHeroWord() {
    var word = document.querySelector('.hero__word');
    if (!word || REDUCED) return;
    var delay = 150;
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(word.childNodes).forEach(function (node) {
      var cls = node.nodeType === 1 ? node.className : '';
      var text = node.textContent;
      for (var i = 0; i < text.length; i++) {
        var s = document.createElement('span');
        s.className = 'hero__letter' + (cls ? ' ' + cls : '');
        s.textContent = text.charAt(i);
        s.style.transitionDelay = (delay += 45) + 'ms';
        frag.appendChild(s);
      }
    });
    word.textContent = '';
    word.appendChild(frag);
    document.body.classList.add('letters-on');
  })();

  /* ========================================================================
     5.7 PARALLAX — [data-parallax] 滚动视差（rAF 节流，减弱动效关闭）
     ======================================================================== */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (parallaxEls.length && !REDUCED) {
    var parallaxTicking = false;
    var updateParallax = function () {
      parallaxTicking = false;
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = 'translateY(' + (-offset).toFixed(1) + 'px)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });
    updateParallax();
  }

  /* ========================================================================
     5.8 SCROLL CUE — 滚动超过 80px 后淡出
     ======================================================================== */
  var scrollCue = document.querySelector('.scroll-cue');
  if (scrollCue) {
    window.addEventListener('scroll', function () {
      scrollCue.classList.toggle('is-hidden', window.scrollY > 80);
    }, { passive: true });
  }

  /* ========================================================================
     6. COUNTERS — 数字计数（进入视口一次）
     ======================================================================== */
  var counters = document.querySelectorAll('.stats__num[data-count-to]');

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10);
    if (isNaN(target)) return;
    if (REDUCED) { el.textContent = String(target); return; }
    var duration = 1200;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); /* easeOutQuart */
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var statsBox = document.getElementById('stats');
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          /* 交错启动：数字依次变动，载入感更强（参考原版节奏） */
          counters.forEach(function (el, i) {
            window.setTimeout(function () { runCounter(el); }, i * 140);
          });
          counterObserver.disconnect();
        });
      }, { threshold: 0.35 });
      counterObserver.observe(statsBox);
    }
  }

  /* ========================================================================
     7. MARQUEE — 内容复制实现无缝循环
     ======================================================================== */
  var marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    var group = marqueeTrack.querySelector('.marquee__group');
    if (group) {
      /* 复制 3 份，保证 50% 位移时内容宽度 ≥ 视口 */
      for (var m = 0; m < 3; m++) {
        marqueeTrack.appendChild(group.cloneNode(true));
      }
    }
  }

  /* ========================================================================
     8. BRANDTRACK — 品牌卡带拖拽横移（桌面指针）
     ======================================================================== */
  var track = document.getElementById('brandTrack');
  if (track && window.matchMedia('(pointer: fine)').matches) {
    var dragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;

    track.addEventListener('pointerdown', function (e) {
      dragging = true;
      dragStartX = e.clientX;
      dragStartScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      track.scrollLeft = dragStartScroll - (e.clientX - dragStartX);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      track.addEventListener(evt, function () {
        dragging = false;
        track.classList.remove('is-dragging');
      });
    });
    /* 拖拽时阻止图片默认拖放 */
    track.querySelectorAll('img').forEach(function (img) {
      img.addEventListener('dragstart', function (e) { e.preventDefault(); });
    });
  }

  /* ========================================================================
     9. ANCHORS — 平滑滚动兜底 + 抽屉联动
     ======================================================================== */
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash.charAt(0) !== '#') return;
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', hash);
    });
  });

  /* ========================================================================
     10. FORM — 校验 + 提交（FORM_ENDPOINT 未配置时为纯前端模拟）
     ======================================================================== */
  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('formSubmit');
  var successBox = document.getElementById('formSuccess');
  var formSubmitted = false; /* 弹窗关闭时据此重置表单状态 */

  function setFieldError(input, errEl, message) {
    if (message) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errEl) {
        errEl.textContent = message;
        errEl.hidden = false;
        input.setAttribute('aria-describedby', errEl.id);
      }
    } else {
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
        input.removeAttribute('aria-describedby');
      }
    }
  }

  if (form) {
    var fName = document.getElementById('fName');
    var fEmail = document.getElementById('fEmail');
    var fMessage = document.getElementById('fMessage');
    var errName = document.getElementById('errName');
    var errEmail = document.getElementById('errEmail');
    var errMessage = document.getElementById('errMessage');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* ===== 反垃圾/防机器人（前端层）=====
       四层：蜜罐 + 时间陷阱 + 行为指纹 + 内容启发式。
       注意：客户端校验只能拦低级机器人，正式拦截靠 Turnstile + 后端校验（见下）。 */
    /* 表单接收端点：Formspree 表单地址（https://formspree.io 注册获取）。
       蜜罐与 Turnstile 组件均在 <form> 内，token 会随 FormData 一并提交；留空 = 模拟提交（不发送） */
    var FORM_ENDPOINT = 'https://formspree.io/f/maeypgwj';
    var TURNSTILE_SITEKEY = ''; /* 要确认：Cloudflare Turnstile site key。填入后自动加载验证组件；token 必须在后端校验才真正生效 */
    var MIN_FILL_MS = 3000;   /* 从首次聚焦到提交的最短耗时 */
    var MIN_KEYS = 5;         /* 最少真实按键数（防脚本一次性填充） */
    var MAX_LINKS = 2;        /* 留言中允许的最多 URL 数 */
    var formStartedAt = 0;
    var keystrokes = 0;
    var fHp = document.getElementById('fWebsite');

    form.addEventListener('focusin', function () {
      if (!formStartedAt) formStartedAt = Date.now();
    });
    form.addEventListener('keydown', function () { keystrokes++; });

    function countLinks(text) {
      return (text.match(/https?:\/\/|www\./gi) || []).length;
    }

    /* 蜜罐/时间陷阱/行为指纹命中 → 静默丢弃（伪装成功，不向机器人暴露检测逻辑） */
    function isBot() {
      if (fHp && fHp.value.trim()) return true;
      if (formStartedAt && (Date.now() - formStartedAt < MIN_FILL_MS) && keystrokes < MIN_KEYS) return true;
      return false;
    }

    function fakeSuccess() {
      submitBtn.classList.add('is-loading');
      window.setTimeout(function () {
        formSubmitted = true;
        form.hidden = true;
        successBox.hidden = false;
        successBox.focus();
      }, 900);
    }

    /* Turnstile 可选接入：site key 非空时动态加载并渲染组件，提交时必须持有 token */
    var turnstileWidgetId = null;
    if (TURNSTILE_SITEKEY) {
      var tsBox = document.getElementById('turnstileBox');
      var tsScript = document.createElement('script');
      tsScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      tsScript.async = true;
      tsScript.onload = function () {
        tsBox.hidden = false;
        turnstileWidgetId = window.turnstile.render(tsBox, { sitekey: TURNSTILE_SITEKEY });
      };
      document.head.appendChild(tsScript);
    }

    [fName, fEmail, fMessage].forEach(function (input) {
      input.addEventListener('input', function () {
        var errEl = input === fName ? errName : input === fEmail ? errEmail : errMessage;
        setFieldError(input, errEl, '');
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;

      if (!fName.value.trim()) {
        setFieldError(fName, errName, t('form.errRequired'));
        firstInvalid = firstInvalid || fName;
      }
      if (!fEmail.value.trim()) {
        setFieldError(fEmail, errEmail, t('form.errRequired'));
        firstInvalid = firstInvalid || fEmail;
      } else if (!EMAIL_RE.test(fEmail.value.trim())) {
        setFieldError(fEmail, errEmail, t('form.errEmail'));
        firstInvalid = firstInvalid || fEmail;
      }
      if (!fMessage.value.trim()) {
        setFieldError(fMessage, errMessage, t('form.errRequired'));
        firstInvalid = firstInvalid || fMessage;
      }

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      /* 反垃圾：机器人 → 静默丢弃（伪装成功） */
      if (isBot()) {
        fakeSuccess();
        return;
      }

      /* 内容启发式：链接过多 → 软错误提示（真人可能误触，给明确反馈） */
      if (countLinks(fMessage.value) > MAX_LINKS) {
        setFieldError(fMessage, errMessage, t('form.errLinks'));
        fMessage.focus();
        return;
      }

      /* Turnstile 已启用时：必须持有 token 才能提交 */
      if (turnstileWidgetId !== null && window.turnstile) {
        if (!window.turnstile.getResponse(turnstileWidgetId)) {
          return; /* 组件未通过时静默阻断，组件本身有视觉提示 */
        }
      }

      /* 提交：FORM_ENDPOINT 未配置 → 模拟提交（纯前端演示）；已配置 → fetch 真实发送 */
      submitBtn.classList.add('is-loading');
      submitBtn.querySelector('.form__submit-label').textContent = t('form.sending');
      trackEvent('contact_form_submit', { category: document.getElementById('fCategory').value });

      function finishSuccess() {
        formSubmitted = true;
        form.hidden = true;
        successBox.hidden = false;
        successBox.focus();
      }
      function failSend() {
        submitBtn.classList.remove('is-loading');
        submitBtn.querySelector('.form__submit-label').textContent = t('form.submit');
        setFieldError(fMessage, errMessage, t('form.errSend'));
        fMessage.focus();
      }

      if (!FORM_ENDPOINT) {
        window.setTimeout(finishSuccess, 900);
        return;
      }

      /* FormData 直接 POST：兼容 Formspree / formsubmit.co / Basin / 自建后端 */
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          finishSuccess();
        })
        .catch(failSend);
    });
  }

  /* ========================================================================
     10.2 CONTACT MODAL — 按钮触发弹窗：ESC/背景关闭 + 焦点圈禁 + 滚动锁定
     ======================================================================== */
  var modal = document.getElementById('contactModal');
  var contactOpenBtn = document.getElementById('contactOpen');
  var modalCloseBtn = document.getElementById('modalClose');
  var lastFocusedEl = null;

  function openModal() {
    if (!modal) return;
    lastFocusedEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    trackEvent('contact_form_open');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
    });
    window.setTimeout(function () {
      var first = modal.querySelector('.form__input');
      if (first) first.focus();
    }, REDUCED ? 0 : 300);
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    window.setTimeout(function () {
      modal.hidden = true;
      if (formSubmitted) {
        /* 成功提交后关闭 → 重置为可再次填写的初始状态 */
        formSubmitted = false;
        form.reset();
        form.hidden = false;
        successBox.hidden = true;
        submitBtn.classList.remove('is-loading');
        submitBtn.querySelector('.form__submit-label').textContent = t('form.submit');
      }
      if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
    }, REDUCED ? 0 : 260);
  }

  if (modal && contactOpenBtn && modalCloseBtn) {
    contactOpenBtn.addEventListener('click', openModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modal.querySelector('[data-modal-close]').addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        /* 焦点圈禁：Tab 在弹窗内循环（蜜罐 tabindex=-1 自动排除） */
        var nodes = Array.prototype.filter.call(
          modal.querySelectorAll('button, input, select, textarea, [href]'),
          function (el) { return el.tabIndex >= 0 && el.getClientRects().length > 0; }
        );
        if (!nodes.length) return;
        var first = nodes[0];
        var last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });
  }

  /* ========================================================================
     10.5 CURSOR + MAGNETIC — 自定义光标与磁吸按钮（融合自参考版）
     仅 pointer:fine 且非 reduced-motion 启用；触屏与减弱动效完全不受影响
     ======================================================================== */
  if (FINE_POINTER && !REDUCED) {
    document.body.classList.add('cursor-on');
    var cursorDot = document.getElementById('cursorDot');
    var cursorRing = document.getElementById('cursorRing');
    if (cursorDot && cursorRing) {
      var mouseX = window.innerWidth / 2;
      var mouseY = window.innerHeight / 2;
      var ringX = mouseX;
      var ringY = mouseY;
      var ringHover = false;

      document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = 'translate(' + (mouseX - 4) + 'px,' + (mouseY - 4) + 'px)';
      }, { passive: true });

      (function cursorLoop() {
        ringX += (mouseX - ringX) * 0.16;
        ringY += (mouseY - ringY) * 0.16;
        cursorRing.style.transform =
          'translate(' + (ringX - 18) + 'px,' + (ringY - 18) + 'px) scale(' + (ringHover ? 1.6 : 1) + ')';
        requestAnimationFrame(cursorLoop);
      })();

      document.addEventListener('mouseover', function (e) {
        if (e.target.closest('a, button, .bento__item, .store-row, .brand-card, .chip')) {
          ringHover = true;
          cursorRing.classList.add('is-grow');
        }
      }, { passive: true });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest('a, button, .bento__item, .store-row, .brand-card, .chip')) {
          ringHover = false;
          cursorRing.classList.remove('is-grow');
        }
      }, { passive: true });

      /* 磁吸按钮：指针靠近时按钮轻微跟随 */
      document.querySelectorAll('.btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
          var r = btn.getBoundingClientRect();
          var x = e.clientX - r.left - r.width / 2;
          var y = e.clientY - r.top - r.height / 2;
          btn.style.transform = 'translate(' + (x * 0.18) + 'px,' + (y * 0.22) + 'px)';
        });
        btn.addEventListener('mouseleave', function () {
          btn.style.transform = '';
        });
      });
    }
  }

  /* ========================================================================
     11. MISC — 回到顶部 / 外链占位
     ======================================================================== */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    });
  }

  /* EC 店铺链接为占位（店铺 URL 要确认：客户提供后替换 href） */
  document.querySelectorAll('[data-external]').forEach(function (link) {
    link.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* ========== 启动 ========== */
  applyLang(currentLang);
})();
