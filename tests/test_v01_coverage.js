// tests/test_v01_coverage.js — Phase 9 (TE-047)
// v0.1의 자동 시험 32건에 대응하는 검사 (NFR-6)
//
// NFR-6의 13개 묶음을 그대로 옮겨 적고, 각 묶음의 건수를 세어 합이 32인지 함께
// 판정한다. 묶음 이름과 건수는 SPEC의 표와 1:1로 맞춘다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const TabModel = require('../shell/tab_model.js');
const SlotRegistry = require('../shell/slot_registry.js');
const TreeExplorer = require('../shell/tree.js');
const ViewLifecycle = require('../shell/view_lifecycle.js');

const { TabManager, KindRegistry } = TabModel;
const { TreeModel } = TreeExplorer;
const ROOT = path.join(__dirname, '..');

const read = (...parts) => fs.readFileSync(path.join(ROOT, ...parts), 'utf8');
const shellCss = read('shell', 'shell.css');
const shellApp = read('shell', 'app.js');
const shellIndex = read('shell', 'index.html');
const tokensCss = read('shared', 'design', 'tokens.css');
const iconsSvg = read('shared', 'design', 'icons.svg');
const bridgePy = read('host_pywebview', 'host', 'bridge.py');
const hostPyEntry = read('host_pywebview', 'app.py');
const mainJs = read('host_electron', 'host', 'main.js');
const errorContract = read('docs', 'ERROR-CONTRACT.md');

// --- 대비율 계산 (NFR-3) ---
function luminance(hex) {
  const v = hex.replace('#', '');
  const parts = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255);
  const lin = parts.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function themeTokens(theme) {
  const block = new RegExp(`:root\\[data-theme="${theme}"\\]\\s*\\{([^}]*)\\}`).exec(tokensCss);
  assert(block, `${theme} 테마 토큰이 있다`);
  const out = {};
  for (const line of block[1].split('\n')) {
    const m = /(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})/.exec(line);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const THEMES = ['white', 'gray', 'dark'];
const FS_MAP = {
  '': [
    { name: 'src', path: 'src', is_dir: true },
    { name: 'a.txt', path: 'a.txt', is_dir: false },
    { name: 'b.txt', path: 'b.txt', is_dir: false }
  ],
  'src': [{ name: 'deep.txt', path: 'src/deep.txt', is_dir: false }]
};

class CountingBridge {
  constructor(map) { this.map = map; this.reads = []; }
  async list_children(p) { this.reads.push(p); return { ok: true, value: this.map[p] || [] }; }
}

// --- 묶음 정의: [이름, 건수, 검사 함수 배열] ---
const groups = [];
function group(name, expectedCount, checks) {
  assert.strictEqual(
    checks.length, expectedCount,
    `묶음 '${name}'의 검사 수가 SPEC의 건수(${expectedCount})와 달라졌다: ${checks.length}`
  );
  groups.push({ name, expectedCount, checks });
}

// ---------------------------------------------------------------
// 1. 한 단계 나열 · 정렬 · 루트 경계 · 오류 구분 — 3건 (FR-17 · FR-20 · FR-37)
// ---------------------------------------------------------------
group('한 단계 나열 · 정렬 · 루트 경계 · 오류 구분', 3, [
  async function 한단계만_나열한다() {
    const bridge = new CountingBridge(FS_MAP);
    const tree = new TreeModel({ bridge, tabManager: new TabManager(new KindRegistry()), slots: new SlotRegistry() });
    await tree.setRoot('D:\\w');
    assert.deepStrictEqual(bridge.reads, [''], '루트 선택 직후 한 단계만 읽는다');
    await tree.toggleExpand('src');
    assert.deepStrictEqual(bridge.reads, ['', 'src'], '펼칠 때만 그 단계를 읽는다');
    tree.toggleExpand('src');
    await tree.toggleExpand('src');
    assert.strictEqual(bridge.reads.length, 2, '접었다 펴도 다시 읽지 않는다');
  },

  async function 정렬은_연결_계층이_정한_순서를_따른다() {
    // 껍데기는 정렬 규칙을 갖지 않는다. 받은 순서를 그대로 보인다 (FR-4)
    const bridge = new CountingBridge(FS_MAP);
    const tree = new TreeModel({ bridge, tabManager: new TabManager(new KindRegistry()), slots: new SlotRegistry() });
    await tree.setRoot('D:\\w');
    const names = tree.getVisibleRows().filter((r) => !r.isRoot).map((r) => r.name);
    assert.deepStrictEqual(names, ['src', 'a.txt', 'b.txt'], '받은 순서가 그대로 보인다');
    // 껍데기가 항목을 이름이나 종류로 다시 세우지 않는다.
    // (펼침 경로를 정렬하는 것은 항목 정렬이 아니므로 대상이 아니다)
    const treeSrc = read('shell', 'tree.js');
    assert(
      !/\.sort\([^)]*\b(name|is_dir)\b/.test(treeSrc),
      '껍데기가 이름이나 종류로 항목을 정렬하지 않는다'
    );
    // 순서를 뒤집어 주면 뒤집힌 채로 보인다 — 껍데기가 순서에 손대지 않는 증거
    const reversedBridge = new CountingBridge({ '': [...FS_MAP['']].reverse() });
    const reversedTree = new TreeModel({
      bridge: reversedBridge, tabManager: new TabManager(new KindRegistry()), slots: new SlotRegistry()
    });
    await reversedTree.setRoot('D:\\w');
    assert.deepStrictEqual(
      reversedTree.getVisibleRows().filter((r) => !r.isRoot).map((r) => r.name),
      ['b.txt', 'a.txt', 'src'],
      '연결 계층이 준 순서를 그대로 따른다'
    );
    // 연결 계층이 폴더 먼저 · 이름순으로 정렬한다
    assert(/entries\.sort|sorted\(/.test(bridgePy), 'pywebview 갈래가 정렬한다');
    assert(/\.sort\(/.test(mainJs), 'Electron 갈래도 정렬한다');
  },

  function 루트_경계와_오류_구분값() {
    assert(/_is_inside_root|_resolve_inside_root/.test(bridgePy), 'pywebview 갈래에 루트 경계 검증이 있다');
    assert(/ROOT_ESCAPE/.test(bridgePy) && /ROOT_ESCAPE/.test(mainJs), '두 갈래가 루트 이탈에 같은 구분값을 쓴다');
    for (const code of ['ROOT_ESCAPE', 'NOT_FOUND', 'READ_FAILED', 'UNSUPPORTED_TARGET']) {
      assert(errorContract.includes(code), `오류 구분값 ${code}이 계약에 있다`);
    }
  }
]);

// ---------------------------------------------------------------
// 2. 설정 판 번호 · 기본값 복귀 · Recent 지우기 — 3건 (FR-26)
// ---------------------------------------------------------------
group('설정 판 번호 · 기본값 복귀 · Recent 지우기', 3, [
  function 설정에_판_번호가_있다() {
    assert(/"version"\s*:\s*1|"version": 1/.test(bridgePy) || /version.*1/.test(bridgePy), 'pywebview 기본 설정에 판 번호가 있다');
    assert(/version/.test(mainJs), 'Electron 기본 설정에도 판 번호가 있다');
  },

  function 망가진_설정은_기본값으로_떨어진다() {
    assert(
      /except \(OSError, ValueError, json\.JSONDecodeError\)/.test(bridgePy),
      'pywebview 갈래가 읽기 실패를 잡아 기본값으로 떨어진다'
    );
    assert(/startup_notice/.test(bridgePy), '기본값으로 떨어진 사실을 알린다');
    assert(/catch/.test(mainJs) && /notice/.test(mainJs), 'Electron 갈래도 같게 처리한다');
  },

  function Recent_지우기가_다른_설정을_건드리지_않는다() {
    const block = /def clear_recent_folders\(self\):([\s\S]*?)\n    def /.exec(bridgePy);
    assert(block, 'clear_recent_folders가 있다');
    assert(
      !/theme|sidebar_width|root_path/.test(block[1]),
      'Recent 지우기가 다른 설정 값을 건드리지 않는다'
    );
  }
]);

// ---------------------------------------------------------------
// 3. 창 제어 · 최대화 상태 · 폴더 대화상자 · 창 크기 복원 — 4건 (FR-21)
// ---------------------------------------------------------------
group('창 제어 · 최대화 상태 · 폴더 대화상자 · 창 크기 복원', 4, [
  function 창_제어_세_가지가_메뉴_줄_오른쪽에_있다() {
    assert(/id="btn-win-min"/.test(shellApp), '최소화 버튼이 있다');
    assert(/id="btn-win-max"/.test(shellApp), '최대화 버튼이 있다');
    assert(/id="btn-win-close"/.test(shellApp), '닫기 버튼이 있다');
    assert(/window-controls/.test(shellApp), '창 제어가 메뉴 줄 오른쪽 묶음에 있다');
  },

  function 최대화_상태가_창_밖에서_바뀌어도_따라온다() {
    assert(/__hostWindowState/.test(shellApp), '호스트가 알리는 최대화 상태를 받는다');
    assert(/icon-restore/.test(shellApp) && /icon-maximize/.test(shellApp), '상태에 따라 표시가 바뀐다');
    assert(/notify_window_state/.test(bridgePy), 'pywebview 갈래가 알린다');
    assert(/window-state|windowState/.test(mainJs), 'Electron 갈래도 알린다');
  },

  function 폴더_대화상자가_있다() {
    assert(/def choose_root/.test(bridgePy), 'pywebview 갈래에 폴더 선택이 있다');
    assert(/showOpenDialog/.test(mainJs), 'Electron 갈래에 폴더 선택이 있다');
    assert(/choose_root/.test(shellApp), '껍데기가 계약의 이름으로 부른다');
  },

  function 창_크기가_고정_값으로_복원된다() {
    assert(/WINDOW_WIDTH|1280/.test(hostPyEntry), 'pywebview 갈래가 창 크기를 정한다');
    assert(/1280/.test(mainJs), 'Electron 갈래도 같은 창 크기를 쓴다');
    assert(/800/.test(hostPyEntry) && /800/.test(mainJs), '두 갈래의 창 높이가 같다');
  }
]);

// ---------------------------------------------------------------
// 4. 메뉴 끌기 영역 · 세로 띠 상태줄 토글 · Recent 지우기 항목 — 3건 (FR-21 · FR-22)
// ---------------------------------------------------------------
group('메뉴 끌기 영역 · 세로 띠 상태줄 토글 · Recent 지우기 항목', 3, [
  function 메뉴_줄에_끄는_영역이_등록돼_있다() {
    assert(/-webkit-app-region: drag/.test(shellCss), '끄는 영역이 있다');
    assert(/-webkit-app-region: no-drag/.test(shellCss), '버튼은 끌기에서 빠진다');
    assert(/drag-region/.test(shellApp), '껍데기가 그 영역을 그린다');
    assert(/DRAG_REGION_SELECTOR/.test(hostPyEntry), 'pywebview 갈래가 그 영역을 쓴다');
  },

  function 세로_띠에서_상태_표시줄을_접고_편다() {
    assert(/btn-rail-statusbar/.test(shellApp), '세로 띠에 상태 표시줄 토글이 있다');
    assert(/status-hidden/.test(shellApp) || /statusbar-toggle/.test(shellApp), '토글이 상태를 바꾼다');
    assert(/\.statusbar-toggle/.test(shellCss), '토글에 표시가 있다');
  },

  function 메뉴에_Recent_지우기_항목이_있다() {
    assert(/clear-recent|clear_recent/.test(shellApp), '메뉴에 Recent 지우기가 있다');
    assert(/def clear_recent_folders/.test(bridgePy), 'pywebview 갈래가 그 동작을 갖는다');
    assert(/clear_recent_folders/.test(mainJs), 'Electron 갈래도 갖는다');
  }
]);

// ---------------------------------------------------------------
// 5. 정적 파일 제공 · 프로젝트 밖 거부 — 2건 (FR-35)
// ---------------------------------------------------------------
group('정적 파일 제공 · 프로젝트 밖 거부', 2, [
  function 저장소_안의_소재를_그대로_제공한다() {
    assert(/ProjectStaticApp/.test(hostPyEntry), 'pywebview 갈래가 정적 제공기를 쓴다');
    assert(/project_root/.test(hostPyEntry), '저장소 루트를 기준으로 제공한다');
    assert(/loadFile/.test(mainJs), 'Electron 갈래는 파일을 직접 로드한다');
  },

  function 프로젝트_밖_요청을_거부한다() {
    assert(/commonpath/.test(hostPyEntry), '요청 경로가 저장소 안인지 확인한다');
    assert(/404 Not Found/.test(hostPyEntry), '밖이면 거부한다');
  }
]);

// ---------------------------------------------------------------
// 6. 색·글꼴을 토큰으로만 씀 — 1건 (FR-28)
// ---------------------------------------------------------------
group('색·글꼴을 토큰으로만 씀', 1, [
  function 색과_글꼴이_토큰을_거친다() {
    const rawColors = shellCss.match(/#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) || [];
    assert.strictEqual(rawColors.length, 0, `껍데기 CSS에 직접 적힌 색 값: ${rawColors}`);
    const fontDecls = (shellCss.match(/font-family\s*:[^;]+;/g) || [])
      .filter((d) => !/var\(--/.test(d));
    assert.strictEqual(fontDecls.length, 0, `토큰을 거치지 않은 글꼴 이름: ${fontDecls}`);
    // 값의 출처는 디자인 파일 한 곳이다
    assert(/--color-bg/.test(tokensCss) && /--font-ui/.test(tokensCss), '색과 글꼴이 토큰에 정의돼 있다');
  }
]);

// ---------------------------------------------------------------
// 7. 트리 초점 시 선택 행 표시 — 1건 (FR-16)
// ---------------------------------------------------------------
group('트리 초점 시 선택 행 표시', 1, [
  function 초점이_트리에_있을_때_선택_행이_드러난다() {
    assert(/\.tree-row\.selected/.test(shellCss), '선택 행에 표시가 있다');
    assert(
      /:focus[^{]*\.tree-row\.selected|\.tree-row\.selected[^{]*\{[^}]*outline/.test(shellCss)
      || /#tree-root:focus/.test(shellCss),
      '초점이 있을 때의 표시가 따로 있다'
    );
    assert(/color-selected/.test(shellCss), '선택 배경이 토큰을 쓴다');
  }
]);

// ---------------------------------------------------------------
// 8. 아이콘 형태 · 크기 · 대비 여섯 건 — 6건 (FR-30 · FR-31 · NFR-3)
// ---------------------------------------------------------------
group('아이콘 형태 · 크기 · 대비 여섯 건', 6, [
  function 아이콘은_단색_테두리_한_벌이다() {
    assert(/stroke="currentColor"/.test(iconsSvg), '선이 현재 글자색을 따른다');
    // 프로그램 표식(icon-app)은 상표라 색을 갖는다. 껍데기 아이콘 한 벌이 판정 대상이다.
    // 마스크 안의 white/black은 화면의 색이 아니라 가림 규칙이라 함께 뺀다.
    const symbols = [...iconsSvg.matchAll(/<symbol[^>]*id="([^"]+)"[\s\S]*?<\/symbol>/g)];
    assert(symbols.length > 10, '아이콘 한 벌을 찾을 수 있다');
    for (const [block, id] of symbols) {
      if (id === 'icon-app') continue;
      const body = block.replace(/<mask[\s\S]*?<\/mask>/g, '');
      const filled = (body.match(/fill="(?!none|currentColor)[^"]+"/g) || []);
      assert.strictEqual(filled.length, 0, `${id}이 임의의 색으로 채워져 있다: ${filled}`);
      const stroked = (body.match(/stroke="(?!none|currentColor)[^"]+"/g) || []);
      assert.strictEqual(stroked.length, 0, `${id}의 선이 현재 글자색을 따르지 않는다: ${stroked}`);
    }
  },

  function 그림문자를_쓰지_않는다() {
    // 그림문자는 아이콘 자리를 대신하는 이모지를 말한다.
    // 메뉴의 체크 표시(U+2713)는 v0.1이 쓰던 글자 표식이라 대상이 아니다.
    const emoji = /[\u{1F000}-\u{1FAFF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
    assert(!emoji.test(shellApp), '껍데기 코드에 이모지가 없다');
    assert(!emoji.test(shellCss), '껍데기 CSS에 이모지가 없다');
    assert(!emoji.test(iconsSvg), '아이콘 파일에 이모지가 없다');
    // 화면의 아이콘은 모두 아이콘 파일의 심볼을 가리킨다
    const uses = [...shellApp.matchAll(/icons\.svg#([\w-]+)/g)].map((m) => m[1]);
    assert(uses.length > 5, '껍데기가 아이콘 파일의 심볼을 쓴다');
    for (const id of new Set(uses)) {
      assert(iconsSvg.includes(`id="${id}"`), `아이콘 파일에 ${id}이 있다`);
    }
  },

  function 아이콘_크기와_선_굵기가_고정이다() {
    assert(/--icon-size:\s*16px/.test(tokensCss), '아이콘 크기가 16으로 고정이다');
    assert(/--icon-stroke:\s*1/.test(tokensCss), '선 굵기가 1로 고정이다');
    assert(/width: var\(--icon-size\)/.test(shellCss), '껍데기가 그 토큰을 쓴다');
  },

  function 아이콘_상자의_높이가_모두_짝수다() {
    const heights = {
      '--menu-height': 30, '--status-height': 30, '--tree-row-height': 22
    };
    for (const [name, expected] of Object.entries(heights)) {
      const m = new RegExp(`${name}:\\s*(\\d+)px`).exec(tokensCss);
      assert(m, `${name} 토큰이 있다`);
      assert.strictEqual(Number(m[1]), expected, `${name}이 ${expected}이다`);
      assert.strictEqual(Number(m[1]) % 2, 0, `${name}이 짝수다`);
    }
  },

  function 본문_대비가_세_테마에서_4_5_이상이다() {
    for (const theme of THEMES) {
      const t = themeTokens(theme);
      const ratio = contrast(t['--color-text'], t['--color-bg']);
      assert(ratio >= 4.5, `${theme}: 본문 대비 ${ratio.toFixed(2)} < 4.5`);
    }
  },

  function 큰_글자와_구분선_대비가_3_이상이다() {
    for (const theme of THEMES) {
      const t = themeTokens(theme);
      const muted = contrast(t['--color-muted'], t['--color-bg']);
      const border = contrast(t['--color-border'], t['--color-bg']);
      assert(muted >= 3, `${theme}: 옅은 글자 대비 ${muted.toFixed(2)} < 3`);
      assert(border >= 3, `${theme}: 테두리 대비 ${border.toFixed(2)} < 3`);
    }
  }
]);

// ---------------------------------------------------------------
// 9. 껍데기가 실행 환경을 부르지 않음 — 1건 (FR-35)
// ---------------------------------------------------------------
group('껍데기가 실행 환경을 부르지 않음', 1, [
  function 껍데기에_실행_환경의_이름과_API가_없다() {
    for (const name of ['pywebview', 'electron', 'Electron', 'ipcRenderer', 'BrowserWindow', 'require(']) {
      assert(!shellApp.includes(name), `shell/app.js에 '${name}'이 있으면 안 된다`);
      assert(!shellIndex.includes(name), `shell/index.html에 '${name}'이 있으면 안 된다`);
    }
    assert(/window\.bridge/.test(shellApp), '껍데기는 계약의 이름 하나로만 닿는다');
  }
]);

// ---------------------------------------------------------------
// 10. 조각 사이 탭 이동 — 1건 (FR-24)
// ---------------------------------------------------------------
group('조각 사이 탭 이동', 1, [
  function 탭이_반대쪽_조각으로_옮겨진다() {
    const tm = new TabManager(new KindRegistry());
    const opened = tm.openTab({ kind: 'k', resource: { path: 'a' }, title: 'a' });
    tm.splitActivePane();
    const target = tm.getPanes().find((p) => p !== opened.tab.paneId);
    assert(target, '가르면 조각이 둘이 된다');
    assert.strictEqual(tm.moveTabToPane(opened.tab.id, target), true, '탭이 옮겨진다');
    assert.strictEqual(tm.getTab(opened.tab.id).paneId, target, '옮긴 조각에 있다');
    assert(tm.getPanes().length <= 2, '셋 이상으로 갈리지 않는다');
  }
]);

// ---------------------------------------------------------------
// 11. Enter 반복으로 미리보기 고정 — 1건 (FR-23)
// ---------------------------------------------------------------
group('Enter 반복으로 미리보기 고정', 1, [
  async function 두_번째_Enter가_고정으로_올린다() {
    const slots = new SlotRegistry();
    const tm = new TabManager(new KindRegistry());
    const tree = new TreeModel({ bridge: new CountingBridge(FS_MAP), tabManager: tm, slots });
    await tree.setRoot('D:\\w');
    tree.setCursor('a.txt');

    const evt = { key: 'Enter', preventDefault() {} };
    await tree.handleKeyDown(evt);
    let tab = tm.getActiveTab();
    assert(tab, '첫 Enter로 탭이 열린다');
    assert.strictEqual(tab.preview, true, '첫 Enter는 미리보기다');
    assert.strictEqual(tab.pinned, false);

    await tree.handleKeyDown(evt);
    tab = tm.getActiveTab();
    assert.strictEqual(tab.preview, false, '두 번째 Enter로 미리보기가 풀린다');
    assert.strictEqual(tab.pinned, true, '두 번째 Enter가 고정으로 올린다');
    assert.strictEqual(tm.getAllTabs().length, 1, '탭이 늘지 않는다');
  }
]);

// ---------------------------------------------------------------
// 12. 참조 보기가 내용을 읽지 않음 · 경계 유지 — 2건 (FR-33)
// ---------------------------------------------------------------
group('참조 보기가 내용을 읽지 않음 · 경계 유지', 2, [
  function 참조_보기가_읽기_통로를_갖지_않는다() {
    for (const preset of ['file', 'folder']) {
      const src = read('presets', preset, 'reference_view.js');
      for (const forbidden of ['readFile', 'listDir', 'list_children', 'fetch(', 'bridge', 'require(']) {
        assert(!src.includes(forbidden), `presets/${preset}/reference_view.js에 '${forbidden}'이 있으면 안 된다`);
      }
    }
  },

  function 참조_보기가_껍데기_밖에_있고_경계를_지킨다() {
    for (const preset of ['file', 'folder']) {
      const src = read('presets', preset, 'reference_view.js');
      for (const forbidden of ['document.getElementById', 'renderShell', 'renderEditor', 'window.__shell']) {
        assert(!src.includes(forbidden), `presets/${preset}/reference_view.js가 껍데기를 건드리면 안 된다`);
      }
    }
    assert(!shellApp.includes('reference-view'), '껍데기가 참조 보기를 알지 못한다');
  }
]);

// ---------------------------------------------------------------
// 13. 두 갈래 공유 · 브릿지 동작 · 오류 구분값 (parity) — 4건 (FR-35 · FR-36 · FR-37)
// ---------------------------------------------------------------
const CONTRACT_OPERATIONS = [
  'choose_root', 'set_root', 'list_children',
  'minimize', 'toggle_maximize', 'close',
  'get_settings', 'save_settings', 'get_recent_folders', 'clear_recent_folders',
  'call_domain'
];

group('두 갈래 공유 · 브릿지 동작 · 오류 구분값 (parity)', 4, [
  function 두_갈래가_같은_껍데기와_디자인을_가리킨다() {
    assert(/\/shell\/index\.html/.test(hostPyEntry), 'pywebview 갈래가 공유 껍데기를 가리킨다');
    assert(/"shell",\s*"index\.html"/.test(mainJs), 'Electron 갈래도 같은 껍데기를 가리킨다');
    assert(shellIndex.includes('../shared/design/tokens.css'), '껍데기가 공유 디자인을 가리킨다');
  },

  function 두_갈래가_계약의_동작을_모두_갖는다() {
    for (const op of CONTRACT_OPERATIONS) {
      assert(bridgePy.includes(`def ${op}`), `pywebview 갈래에 ${op}이 없다`);
      assert(mainJs.includes(op), `Electron 갈래에 ${op}이 없다`);
    }
  },

  function 껍데기가_계약_밖의_동작을_부르지_않는다() {
    const calls = new Set();
    for (const m of shellApp.matchAll(/window\.bridge\.(\w+)/g)) calls.add(m[1]);
    for (const m of shellApp.matchAll(/bridge\.(\w+)\s*\(/g)) calls.add(m[1]);
    for (const name of calls) {
      if (name === 'then' || name === 'catch') continue;
      assert(
        CONTRACT_OPERATIONS.includes(name),
        `껍데기가 계약 밖의 동작을 부른다: ${name}`
      );
    }
    assert(calls.size > 0, '껍데기가 실제로 계약을 쓴다');
  },

  function 두_갈래가_같은_오류_구분값을_쓴다() {
    const codes = [...errorContract.matchAll(/`([A-Z_]{4,})`/g)].map((m) => m[1]);
    const unique = [...new Set(codes)];
    assert(unique.length >= 4, '계약에 구분값이 정의돼 있다');
    for (const code of unique) {
      assert(bridgePy.includes(code), `pywebview 갈래에 ${code}이 없다`);
      assert(mainJs.includes(code), `Electron 갈래에 ${code}이 없다`);
    }
  }
]);

// ---------------------------------------------------------------
// NFR-6의 나머지 조건 — 껍데기의 공개 동작 중 시험이 없는 것이 0건
// 위 32건과 별개다(v0.1 대응 32건에 이 검사를 더해 세지 않는다).
// ---------------------------------------------------------------
function 공개_동작에_시험이_모두_있다() {
  const exposed = /window\.__shell = \{([\s\S]*?)\n  \};/.exec(shellApp);
  assert(exposed, '껍데기의 공개 목록을 찾을 수 있다');
  const names = [...exposed[1].matchAll(/^\s{4}(\w+)\s*:/gm)].map((m) => m[1]);
  assert(names.length > 0, '공개 동작이 있다');

  // 시험 파일 전체를 한 덩어리로 읽어 각 이름이 어디선가 판정되는지 본다
  const testSources = fs.readdirSync(__dirname)
    .filter((f) => /^test_.*\.(js|py)$/.test(f))
    .map((f) => fs.readFileSync(path.join(__dirname, f), 'utf8'))
    .join('\n');

  // 다시 내보내는 묶음(모듈 자체)은 그 모듈의 시험이 대신한다
  const REEXPORTED = { SlotRegistry: 'slot_registry.js', TabModel: 'tab_model.js', ViewLifecycle: 'view_lifecycle.js', TreeExplorer: 'tree.js' };

  const untested = [];
  for (const name of names) {
    if (REEXPORTED[name]) {
      if (!testSources.includes(REEXPORTED[name])) untested.push(name);
      continue;
    }
    if (!testSources.includes(name)) untested.push(name);
  }
  assert.strictEqual(
    untested.length, 0,
    `시험이 없는 공개 동작: ${untested.join(', ')}`
  );
  return names.length;
}

// ---------------------------------------------------------------
// 실행
// ---------------------------------------------------------------
async function run() {
  console.log('Running v0.1 coverage checks (TE-047, NFR-6)...');
  let total = 0;
  let failures = 0;

  for (const g of groups) {
    for (const check of g.checks) {
      total += 1;
      try {
        await check();
      } catch (err) {
        failures += 1;
        console.error(`  FAIL [${g.name}] ${check.name}\n    ${err.message}`);
      }
    }
    console.log(`  OK  ${g.name} (${g.expectedCount}건)`);
  }

  // 묶음 수와 건수 합을 SPEC의 표와 대조한다
  assert.strictEqual(groups.length, 13, `묶음이 13개여야 한다: ${groups.length}`);
  const sum = groups.reduce((acc, g) => acc + g.expectedCount, 0);
  assert.strictEqual(sum, 32, `건수 합이 32여야 한다: ${sum}`);
  assert.strictEqual(total, 32, `실제로 돌린 검사가 32건이어야 한다: ${total}`);
  assert.strictEqual(failures, 0, `${failures}건이 통과하지 못했다`);

  const publicCount = 공개_동작에_시험이_모두_있다();

  console.log(`\n13개 묶음 · 32건 전건 통과 (NFR-6)`);
  console.log(`껍데기 공개 동작 ${publicCount}개 중 시험이 없는 것 0건`);
  console.log('All v0.1 coverage checks (TE-047) passed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
