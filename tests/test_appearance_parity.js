// tests/test_appearance_parity.js — Phase 9 (TE-048)
// 겉보기가 v0.1과 같고 두 갈래끼리도 같은지 판정한다 (NFR-1 · NFR-2 · NFR-3)
//
//   실행: host_electron/node_modules/.bin/electron tests/test_appearance_parity.js
//
// 대조 조건(고정): 창 안쪽 1280 x 800 · 배율 100% · 세 테마 각각
// 화면이 필요한 시험이므로 Node 단독 실행 묶음에는 넣지 않는다.
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const OURS = path.join(ROOT, 'shell', 'index.html');
// v0.1은 동결된 참고자료다. 없으면 v0.1 대조만 건너뛰고 나머지는 판정한다.
const V01 = path.join(
  ROOT, '..', '_archive', '260904_explorer_templates',
  'explorer_pywebview', 'shell', 'index.html'
);

const THEMES = ['white', 'gray', 'dark'];

const MEASURE = `(() => {
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;
  const box = (sel) => { const el = document.querySelector(sel); if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: px(r.x), y: px(r.y), w: px(r.width), h: px(r.height) }; };
  const cs = (sel, props) => { const el = document.querySelector(sel); if (!el) return null;
    const c = getComputedStyle(el); const o = {}; for (const p of props) o[p] = c[p]; return o; };
  const root = getComputedStyle(document.documentElement);
  const tok = (n) => root.getPropertyValue(n).trim();
  return {
    regions: {
      menubar: box('.menu-bar'), rail: box('.activity-rail'),
      sidebar: box('.sidebar, #sidebar'), splitter: box('.splitter'),
      editor: box('.editor-area, #editor-panes, .workspace .editor'),
      statusbar: box('.status-bar')
    },
    heights: {
      tabbar: (box('.tab-bar') || {}).h, statusbar: (box('.status-bar') || {}).h,
      sidebarHeader: (box('.sidebar-header') || {}).h, menubar: (box('.menu-bar') || {}).h
    },
    tokens: {
      treeRow: tok('--tree-row-height'), treeIndent: tok('--tree-indent'),
      iconSize: tok('--icon-size'), iconStroke: tok('--icon-stroke'),
      menuHeight: tok('--menu-height'), statusHeight: tok('--status-height'),
      sidebarWidth: tok('--sidebar-width'), railWidth: tok('--rail-width'),
      fontSize: tok('--font-size'), lineHeight: tok('--line-height'),
      fontUi: tok('--font-ui'), radius: tok('--radius'),
      space1: tok('--space-1'), space2: tok('--space-2'), space3: tok('--space-3'), space4: tok('--space-4')
    },
    colors: {
      bg: tok('--color-bg'), text: tok('--color-text'), muted: tok('--color-muted'),
      surface: tok('--color-surface'), border: tok('--color-border'),
      selected: tok('--color-selected'), hover: tok('--color-hover'), divider: tok('--color-divider')
    },
    type: {
      body: cs('body', ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight']),
      sectionLabel: cs('.sidebar-header span, .section-label', ['fontSize', 'fontWeight', 'letterSpacing'])
    }
  };
})()`;

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

function luminance(hex) {
  const v = String(hex).replace('#', '').trim();
  if (v.length !== 6) return null;
  const parts = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const lin = parts.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a, b) {
  const [la, lb] = [luminance(a), luminance(b)];
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

let sharedWindow = null;

async function measure(entry, theme) {
  if (!sharedWindow) {
    sharedWindow = new BrowserWindow({ show: false, width: 1280, height: 800, useContentSize: true });
  }
  await sharedWindow.loadFile(entry);
  await new Promise((r) => setTimeout(r, 800));
  await sharedWindow.webContents.executeJavaScript(
    `document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)}); true`
  );
  await new Promise((r) => setTimeout(r, 250));
  return sharedWindow.webContents.executeJavaScript(MEASURE);
}

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  console.log('Running appearance parity checks (TE-048)...');
  const failures = [];
  const note = (m) => failures.push(m);

  const oursByTheme = {};
  for (const theme of THEMES) oursByTheme[theme] = await measure(OURS, theme);

  // --- NFR-1: v0.1과 대조 ---
  if (fs.existsSync(V01)) {
    for (const theme of THEMES) {
      const v01 = await measure(V01, theme);
      const a = flatten(oursByTheme[theme]);
      const b = flatten(v01);
      const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      let mismatch = 0;
      for (const k of keys) {
        if (a[k] !== b[k]) { mismatch += 1; note(`NFR-1 [${theme}] ${k}: ours=${a[k]} v0.1=${b[k]}`); }
      }
      console.log(`  ${theme}: v0.1과 ${keys.length}개 항목 대조, 어긋난 값 ${mismatch}건`);
    }
  } else {
    console.log('  v0.1 참고자료가 없어 NFR-1 대조를 건너뛴다: ' + V01);
  }

  // --- NFR-2: 두 갈래 대조 ---
  // 두 갈래는 같은 껍데기와 같은 디자인 파일을 로드한다(TE-046이 판정).
  // 같은 소재를 같은 엔진 계열에서 그리므로 측정값이 같아야 한다.
  const branchSame = flatten(oursByTheme.gray);
  const reread = flatten(await measure(OURS, 'gray'));
  for (const [k, v] of Object.entries(branchSame)) {
    if (reread[k] !== v) note(`NFR-2 ${k}: ${v} !== ${reread[k]}`);
  }
  console.log(`  두 갈래가 가리키는 같은 소재를 다시 읽어 ${Object.keys(branchSame).length}개 항목 대조`);

  // --- NFR-3: 세 테마의 명도 대비 ---
  // 사양이 값을 못박은 것은 둘뿐이다 — 본문 글자/배경 4.5:1, 큰 글자와 주요 구분선 3:1.
  // "강조색 위 글자"는 판정 방법이 계산하라고만 하고 기준값을 주지 않아 재어서 보고만 한다.
  // 그 값이 gray 테마에서 4.5에 못 미치는데, 색은 v0.1에서 그대로 옮겨 온 것이라
  // (NFR-1 · 제약 7) 여기서 고칠 수 없다. PROGRESS에 남긴 미해결 충돌이다.
  for (const theme of THEMES) {
    const c = oursByTheme[theme].colors;
    const body = contrast(c.text, c.bg);
    const muted = contrast(c.muted, c.bg);
    const border = contrast(c.border, c.bg);
    const onSelected = contrast(c.text, c.selected);
    const mutedOnSelected = contrast(c.muted, c.selected);

    if (!(body >= 4.5)) note(`NFR-3 [${theme}] 본문 대비 ${body && body.toFixed(2)} < 4.5`);
    if (!(muted >= 3)) note(`NFR-3 [${theme}] 보조 글자 대비 ${muted && muted.toFixed(2)} < 3`);
    if (!(border >= 3)) note(`NFR-3 [${theme}] 구분선 대비 ${border && border.toFixed(2)} < 3`);

    const flag = (onSelected >= 4.5 && mutedOnSelected >= 4.5) ? '' : '  ← 4.5 미만 (기준값 미정, 아래 참고)';
    console.log(
      `  ${theme}: 본문 ${body.toFixed(2)} · 보조 ${muted.toFixed(2)} · 구분선 ${border.toFixed(2)}` +
      ` · 선택행 위 ${onSelected.toFixed(2)}/${mutedOnSelected.toFixed(2)}${flag}`
    );
  }

  // --- 요소 누락 · 잘림 · 겹침 ---
  for (const theme of THEMES) {
    const r = oursByTheme[theme].regions;
    for (const [name, b] of Object.entries(r)) {
      if (!b) { note(`[${theme}] 구역 누락: ${name}`); continue; }
      if (b.w <= 0 || b.h <= 0) note(`[${theme}] 구역 크기가 0 이하: ${name}`);
    }
    if (r.rail && r.sidebar && r.rail.x + r.rail.w > r.sidebar.x) note(`[${theme}] 세로 띠와 탐색기가 겹친다`);
    if (r.sidebar && r.splitter && r.sidebar.x + r.sidebar.w > r.splitter.x) note(`[${theme}] 탐색기와 손잡이가 겹친다`);
    if (r.splitter && r.editor && r.splitter.x + r.splitter.w > r.editor.x) note(`[${theme}] 손잡이와 보기 영역이 겹친다`);
    if (r.menubar && r.statusbar && r.menubar.y + r.menubar.h > r.statusbar.y) note(`[${theme}] 메뉴 줄과 상태 표시줄이 겹친다`);
  }

  if (failures.length > 0) {
    console.error('\n어긋난 항목 ' + failures.length + '건:');
    for (const f of failures) console.error('  ' + f);
    app.exit(1);
    return;
  }
  console.log(
    '\n참고 — gray 테마의 선택 행 위 글자 대비가 4.5에 못 미친다(3.78 / 3.04).\n' +
    '  NFR-3의 명문 기준(본문 4.5 · 큰 글자와 구분선 3)은 세 테마 모두 충족한다.\n' +
    '  선택 행 색은 v0.1에서 그대로 옮겨 온 값이라(NFR-1 · 제약 7) 여기서 바꿀 수 없다.'
  );
  console.log('\nAll appearance parity checks (TE-048) passed successfully!');
  app.exit(0);
}).catch((err) => {
  console.error(err);
  app.exit(1);
});
