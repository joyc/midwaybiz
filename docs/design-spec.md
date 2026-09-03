# MIDWAY 株式会社 企业形象站 — 设计规格书

> 版本 v1.0 · 设计师：hython · 寄存器判定：**Brand 寄存器**（企业形象站，设计即产品）
> 三轴刻度：DESIGN_VARIANCE = 7（偏移/非对称）· MOTION_INTENSITY = 6（有持续微动效）· VISUAL_DENSITY = 3（美术馆留白）

---

## 1. 设计方向

### 对标参考
1. **UNITED ARROWS（ユナイテッドアローズ）** — 日系时尚集团的编辑级排版：衬线大字 + 大量留白 + 摄影主导。借鉴其"杂志翻页感"的节区节奏。
2. **TSI Holdings / オンワード樫山** — 服装集团企业站的理性骨架：清晰的事业板块信息架构、会社概要表格的严谨呈现。
3. **貝印（KAI Corporation）** — 日本制造业企业的"信赖感"表达：藏蓝主色 + 朱色点睛 + 工艺细节特写图。

### 设计语言一句话
> **「静かな編集美と、海を渡る確かさ」— 以和纸般的留白与明朝体大标题构建静奢编辑感，用藏蓝的理性骨架承载跨境贸易的可信赖感；朱色只在最关键处落笔一次。**

核心气质词（物理对象词）：**旧式贸易会社的活版印刷名片 · 银座画廊的展签 · 横滨港的航海日志**

---

## 2. Design Token 完整清单（四层架构）

```css
:root {
  /* ========== A1-identity（品牌核心，不可省略） ========== */
  /* Surface */
  --bg: #FAF8F5;              /* 和纸暖白 — 页面背景 */
  --surface: #FFFFFF;         /* 卡片/容器 */
  --fg: #1C1B1A;              /* 墨色 — 主文本 */
  --muted: #6E6A64;           /* 鼠色 — 次级文本 */
  --border: #E4E0DA;          /* 薄墨边框 */
  --accent: #17365D;          /* 濃藍 — 品牌主色（藏蓝，航海/贸易意象） */

  /* Typography */
  --font-display: "Shippori Mincho", "Noto Serif JP", "Noto Serif SC", "Songti SC", serif;
  --font-body: "Zen Kaku Gothic New", "Noto Sans JP", "Noto Sans SC", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", monospace;

  /* Type scale（8级，clamp 响应式） */
  --text-xs:   0.75rem;    /* 12px 辅助标注 */
  --text-sm:   0.875rem;   /* 14px 副文本 */
  --text-base: 1rem;       /* 16px 正文基准 */
  --text-lg:   1.125rem;   /* 18px 导语 */
  --text-xl:   1.375rem;   /* 22px 小节标题 */
  --text-2xl:  1.75rem;    /* 28px 卡片标题 */
  --text-3xl:  clamp(2rem, 4vw, 2.75rem);      /* 32-44px 节区标题 */
  --text-4xl:  clamp(2.75rem, 8vw, 5.5rem);    /* 44-88px Hero 大标题 */

  /* Leading & Tracking */
  --leading-body: 1.8;      /* 日文正文需要更松的行高 */
  --leading-tight: 1.25;
  --leading-display: 1.15;
  --tracking-display: 0.02em;   /* 日文大字不做负字距，保留呼吸感 */
  --tracking-caps: 0.12em;      /* 英字 ALL CAPS 标签 */

  /* Layout */
  --container-max: 1200px;
  --container-wide: 1440px;
  --container-gutter-desktop: 40px;
  --container-gutter-phone: 20px;
  --section-y-desktop: 120px;
  --section-y-tablet: 72px;
  --section-y-phone: 48px;

  /* ========== B-slot（语义别名） ========== */
  --surface-warm: #F3F0EB;    /* 生成色 — 三级暖表面（节区分隔用） */
  --surface-ink: #14161C;     /* 深色反转节区（品牌展示用） */
  --fg-2: #3D3B38;            /* 次级正文 */
  --fg-on-ink: #EDEAE4;       /* 深色区上的文本 */
  --meta: #9B968E;            /* 元数据/图注 */
  --border-soft: #EEECE8;     /* 行内分隔线 */
  --accent-vermilion: #B4473C;/* 朱色 — 唯一点睛色（全站 ≤6 处） */

  /* ========== A2（有默认值的系统色） ========== */
  --accent-on: #FFFFFF;
  --accent-hover: #122A4A;
  --accent-active: #0D2038;
  --success: #3D7A55;
  --warn: #B98A2A;
  --danger: #B4473C;

  /* Spacing（4px 网格） */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px; --space-16: 64px; --space-20: 80px;

  /* Radius（克制使用 — 编辑感偏直角） */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-pill: 9999px;   /* 仅用于标签 chip */

  /* Elevation（本项目以 1px 边框为主，阴影极轻） */
  --elev-flat: none;
  --elev-ring: 0 0 0 1px var(--border);
  --elev-raised: 0 24px 48px -24px rgba(28, 27, 26, 0.12);

  /* Focus & Motion */
  --focus-ring: 0 0 0 3px rgba(23, 54, 93, 0.35);
  --motion-fast: 150ms;
  --motion-base: 250ms;
  --motion-slow: 600ms;        /* 滚动入场/图片揭示 */
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);   /* 编辑级揭示动效 */
}

/* 深色反转节区（品牌展示 / Footer） */
.section--ink {
  --bg: var(--surface-ink);
  --fg: var(--fg-on-ink);
  --muted: #8E8A83;
  --border: rgba(237, 234, 228, 0.16);
  --border-soft: rgba(237, 234, 228, 0.08);
}
```

### 色彩使用纪律
- 中性色占比 85%+，藏蓝 `--accent` ≤8%，朱色 `--accent-vermilion` **每屏最多 1 处**（仅用于关键 CTA 下划线、一个数字强调、或一枚印章式标记）。
- 禁止任何紫→粉渐变；全站不使用大面积渐变，仅允许图片上的藏蓝单色渐隐遮罩（`rgba(23,54,93,0) → rgba(23,54,93,0.45)`）保证文字可读。

---

## 3. 字体方案

### Google Fonts 加载
```html
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=JetBrains+Mono:wght@400&family=Noto+Serif+SC:wght@400;600&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
```

| 角色 | 字体 | 字重 | 用途 |
|---|---|---|---|
| Display | Shippori Mincho（日文明朝体） | 500/600 | Hero 大标题、节区标题、品牌名言 |
| Body | Zen Kaku Gothic New | 400/500 | 正文、导航、按钮 |
| Mono | JetBrains Mono | 400 | 数字计数、编号、元数据标签（英数混排保证对齐） |
| 中文回退 | Noto Serif SC / Noto Sans SC | — | 中/英语言切换时同位替换 |

### 字号/排版规则
- 正文 16px / 行高 1.8 / 每行 ≤38 字符（日文 25–35 字）
- Hero 大标题 `--text-4xl`（最大 88px），字重 500，字距 +0.02em（日文不加负字距）
- 英文小标签 ALL CAPS 必须 `--tracking-caps: 0.12em`，配 1px 细线
- **縦書き点缀**：Hero 与品牌区允许一处竖排日文（`writing-mode: vertical-rl`），作为编辑感装饰，不承载关键信息
- 字重三级：400（正文）/ 500（小标题）/ 600–700（大标题）

---

## 4. 图标系统（锁定）

- **方案**：Lucide 风格内联 SVG，`stroke="currentColor"`，`stroke-width="1.5"`，`fill="none"`，`stroke-linecap="round"`，`stroke-linejoin="round"`
- **尺寸**：16px（行内）/ 20px（按钮内）/ 24px（板块图标），全站一致
- **颜色**：默认 `var(--fg)`，悬停态 `var(--accent)`，深色区 `var(--fg-on-ink)`

### 各板块图标语义清单
| 板块 | 图标语义 | Lucide 对应 |
|---|---|---|
| 导航 | 语言切换 globe；菜单 menu；关闭 x | `Globe` `Menu` `X` |
| 事业板块 | 跨境贸易 ship；品牌 apparel shirt；OEM scissors/factory；EC shopping-bag | `Ship` `Shirt` `Scissors` `ShoppingBag` |
| 关于我们 | 理念 landmark；历程 history；据点 map-pin | `Landmark` `History` `MapPin` |
| OEM 流程 | 咨询 message-square；设计 pen-tool；打样 ruler；生产 factory；检品 check-circle；交付 truck | `MessageSquare` `PenTool` `Ruler` `Factory` `CheckCircle2` `Truck` |
| EC 渠道 | 外部链接 arrow-up-right | `ArrowUpRight` |
| 联系方式 | 电话 phone；邮件 mail；地址 map-pin；时间 clock | `Phone` `Mail` `MapPin` `Clock` |
| 公司概要 | 建筑 building-2 | `Building2` |
| Footer | 回到顶部 arrow-up | `ArrowUp` |

⛔ 全站零 emoji（含语言切换，用「日 / 中 / EN」文字标签而非旗帜 emoji）。

---

## 5. 板块设计说明（逐板块）

> 全站动效基线：滚动入场用 IntersectionObserver 触发 `translateY(24px) + opacity` 揭示（600ms, ease-out-expo），节区间错开 80ms stagger。支持 `prefers-reduced-motion` 全部降级为静态。

### 5.1 Header（固定导航）
- 透明背景起始，滚动超过 40px 后切换为 `var(--bg)` + `border-bottom: 1px solid var(--border-soft)`，过渡 250ms
- 左：MIDWAY 字标（Shippori Mincho 600，全大写英文 + tracking 0.2em）；右：导航（公司简介 / 主营业务 / 品牌 / OEM / EC / 联系）+ 语言切换文字按钮
- 移动端：汉堡菜单 → 全屏抽屉，深藍背景 `--surface-ink`，菜单项大号明朝体逐项 stagger 入场

### 5.2 Hero（首屏）— 反千篇一律设计
- **不做**「居中大标题+副标语+居中CTA+抽象图形」模板
- 布局：**非对称编辑版式** — 左侧 55% 为超大明朝体标题「海を越えて、ものづくりの真髄へ。」（竖排副题「株式会社ミッドウェイ」置右缘），左下角小字导语（日文正文，说明四大事业）
- 右侧 45%：**真实产品摄影拼贴**（服装面料特写 + 童鞋产品图 + 港口/贸易意象图），2–3 张不同宽高比（4:3 与 3:4 混排），加载时以 clip-path 从右向左揭示
- 底部：1px 细线上方，横向 marquee 滚动条「CROSS-BORDER TRADE · APPAREL BRAND · OEM MANUFACTURING · E-COMMERCE」（英字 mono 字体 + tracking，无限循环，20s/圈，悬停暂停）
- 朱色唯一使用：标题中一个关键词的下划线 2px `var(--accent-vermilion)`

### 5.3 About / 公司简介
- 双栏非对称：左栏节区编号「01」+ 竖排「会社について」装饰；右栏导语（--text-lg）+ 正文两段
- 内容：代表致辞摘要 + 企业理念，文案用真实日系企业语感（「私たちミッドウェイは、日本とアジアを結ぶ架け橋として…」风格）
- 下方数字计数带（mono 字体）：設立年 / 取引国数 / 拠点数 / 年間生産点数 —— 数字滚动计数入场（600ms，仅进入视口触发一次）

### 5.4 Business / 主营业务（四大事业）
- **Bento 非对称网格**：4 个事业域用 `grid-template-columns: 3fr 2fr` 两行错落布局，每格配 24px 描边图标 + 事业名（明朝体）+ 英文标注（mono, caps）+ 2 行说明
- 悬停：背景从 `var(--surface)` 过渡到 `var(--surface-warm)`，图标色变为 `--accent`，右下出现 `ArrowUpRight` 图标（150ms）
- 移动端回退单列

### 5.5 Brands / 品牌展示（深色反转节区 `.section--ink`）
- 全站唯一的深色节区，营造品牌的高端感
- 横向滚动卡片带（桌面可拖拽，移动端原生横滑）：每张卡片 = 品牌 Look 图 + 品牌名 + 品类标签 chip（`--radius-pill` + 1px 边框）
- 服装品牌与童鞋品牌分两组，组间大号留白
- 图片悬停：微缩放 `scale(1.03)`（400ms ease-out-expo）

### 5.6 OEM 服务
- 上半：文案区 — 「小ロットから、量産まで。」级的主张标题 + 服务说明 + 2 个 CTA（主按钮藏蓝「お問い合わせ」/ 次按钮描边「制作実績を見る」）
- 下半：**6 步工艺流程横排时间线**（咨询→企画设计→打样→量产→检品→交付），每步 24px 图标 + mono 编号「STEP 01」+ 标题；桌面横排，移动端纵向；步骤间用 1px 虚线连接
- 能力数据：最小起订量、交期、对应品类 —— 用无边框的 `border-t` 列表呈现（非卡片）

### 5.7 EC 电商渠道
- 简洁的店铺列表：每行 = 店铺名（楽天市場店 / Amazon ストア / Yahoo!ショッピング等）+ 品类说明 + `ArrowUpRight` 外链图标
- 行 hover：背景 `var(--surface-warm)`，整行可点击（≥56px 行高，触摸友好）
- 一处朱色：节区标题旁的「EC」小标签

### 5.8 Company / 会社概要
- 经典日式会社概要表：`border-t` 定义列表（会社名 / 所在地 / 設立 / 資本金 / 代表取締役 / 事業内容 / 主要取引先），dt 栏 200px 宽 mono 标签，dd 栏正文
- 可配一幅办公地/仓库实景小图（右对齐，4:3）

### 5.9 Contact / 联系方式
- 双栏：左栏「お問い合わせ」大标题 + 电话/邮件/地址/营业时间（各配 20px 图标）；右栏简易表单（公司名/姓名/邮箱/咨询类别 select/内容 textarea）
- 表单：可见 label（非纯 placeholder）、focus 时 2px 藏蓝边框 + `--focus-ring`、错误提示紧贴字段下方（var(--danger)）、提交按钮 Loading 态 spinner
- 必须有空/错误/成功三态：成功后 inline 显示「送信が完了しました。担当者より2営業日以内にご連絡いたします。」

### 5.10 Footer（深色）
- `var(--surface-ink)` 背景：左 = 字标 + 一行理念；中 = 站点地图；右 = 联系方式摘要 + 回到顶部按钮（`ArrowUp`，44×44px）
- 底部 1px 线上：「© 2026 MIDWAY Co., Ltd.」+ 语言切换

---

## 6. 反模板自检声明

| 检查项 | 结果 |
|---|---|
| emoji 功能图标扫描 | ✅ 零 emoji，全部 Lucide 内联 SVG |
| 紫→粉渐变 | ✅ 零渐变主视觉；仅图片遮罩用藏蓝单色渐隐 |
| 空洞占位文案 | ✅ 无 "Welcome to"/Lorem ipsum；全部日文真实企业语感文案方向已给出 |
| 硬编码颜色 | ✅ 全部经 Design Token 引用；白 `#FFFFFF` 仅用于 accent 上文字（规则内例外） |
| 千篇一律 Hero | ✅ 非对称编辑版式 + 真实产品摄影 + 竖排日文 + marquee，无抽象 3D 图形 |
| 默认靛蓝 accent | ✅ 主色为濃藍 `#17365D`（偏青的藏蓝，非 Tailwind 默认 indigo） |
| 彩色左边框卡片 | ✅ 无；节区分隔用 1px `border-t` 与留白 |
| 虚构指标 | ✅ 数字计数带字段已列出，具体数值由客户提供后填入（不设占位假数） |
| 圆角 ≥24px 卡片 | ✅ 全站圆角上限 4px（编辑感直角），pill 仅用于标签 |
| 每节小型大写标签 | ⚠️ 仅 Hero marquee 与节区编号使用英字 caps，非每节标题上方重复标签 |
| 相同卡片网格 | ✅ Bento 非对称网格 + 横滚卡带 + 定义列表，三种不同结构 |
| 幽灵卡片 | ✅ 卡片用 `--elev-ring` 或 `--elev-raised` 之一，不叠加 |
| 字体 | ✅ Shippori Mincho 不在反射拒绝列表（日系场景刻意选择，非训练默认值）；已交叉验证 |

**对比度核验**：`--fg #1C1B1A` on `--bg #FAF8F5` = 15.9:1 ✅；`--muted #6E6A64` on `--bg` = 5.4:1 ✅（≥4.5）；`--accent-on #FFF` on `--accent #17365D` = 10.8:1 ✅；`--fg-on-ink` on `--surface-ink` = 12.1:1 ✅。

**a11y 基线**：全站键盘可达、`:focus-visible` 显示 `--focus-ring`、图标按钮配 aria-label、marquee 与计数动效支持 `prefers-reduced-motion` 降级。
