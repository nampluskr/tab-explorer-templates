// tests/test_reachability.js — Phase 9 (TE-049)
// 마우스 도달 가능성(NFR-5)과 갈래별 안내 문서의 조합키 표(FR-25)를 판정한다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const appJs = read('shell', 'app.js');
const treeJs = read('shell', 'tree.js');
const shellSrc = appJs + '\n' + treeJs;

// NFR-5가 이름을 댄 열두 가지. 각각 "눌러서 닿는" 자리가 있어야 한다.
const MOUSE_PATHS = [
  ['폴더 열기', ['id="btn-folder-open"', "action: 'open-root'"]],
  ['트리 접고 펼치기', ['twistie', 'toggleExpand']],
  ['탭 열기', ['tree-row', 'openRowTab']],
  ['탭 닫기', ['tab-close', "action: 'close-tab'"]],
  ['탐색기 접기', ['id="btn-rail-explorer"', "action: 'toggle-sidebar'"]],
  ['보기 영역 가르기', ['split-button', "action: 'split-editor'"]],
  ['Zen 모드', ['id="btn-win-zen"', "action: 'toggle-zen'"]],
  ['테마 전환', ['id="btn-win-theme"', 'set-theme:']],
  ['아이콘 테마 전환', ['set-icon-theme:']],
  ['창 최소화', ['id="btn-win-min"']],
  ['창 최대화', ['id="btn-win-max"']],
  ['창 닫기', ['id="btn-win-close"']]
];

// FR-25가 예약한 열한 가지. 안내 문서의 표가 이것과 어긋나면 안 된다.
const SHORTCUTS = [
  ['F11', 'Zen'],
  ['Esc', '메뉴'],
  ['Ctrl+O', '폴더'],
  ['Ctrl+W', '탭'],
  ['Ctrl+B', '탐색기'],
  ['Ctrl+\\', '가르기'],
  ['F5', '읽기'],
  ['Alt+F4', '창'],
  ['Tab', '초점'],
  ['Shift+Tab', '초점'],
  ['Ctrl+Tab', '탭']
];

function run() {
  console.log('Running reachability checks (TE-049)...');

  // ---------------------------------------------------------------
  // 1. 열두 가지에 눌러서 닿는 경로가 있다 (NFR-5)
  // ---------------------------------------------------------------
  for (const [name, markers] of MOUSE_PATHS) {
    const hit = markers.some((m) => shellSrc.includes(m));
    assert(hit, `'${name}'에 눌러서 도달하는 경로가 없다 (찾은 표시: ${markers.join(', ')})`);
  }
  console.log(`  열두 가지 각각에 눌러서 닿는 자리가 있다 (${MOUSE_PATHS.length}건)`);

  // 조합키로만 닿는 기능이 없다 — 예약한 키마다 대응하는 버튼이나 메뉴 항목이 있다
  const keyToMouse = {
    'F11': ["action: 'toggle-zen'", 'btn-win-zen'],
    'Ctrl+O': ["action: 'open-root'", 'btn-folder-open'],
    'Ctrl+W': ["action: 'close-tab'", 'tab-close'],
    'Ctrl+B': ["action: 'toggle-sidebar'", 'btn-rail-explorer'],
    'Ctrl+\\': ["action: 'split-editor'", 'split-button'],
    'F5': ["action: 'refresh'", 'btn-tree-refresh'],
    'F6': ["action: 'move-tab'"]
  };
  for (const [key, markers] of Object.entries(keyToMouse)) {
    assert(
      markers.some((m) => shellSrc.includes(m)),
      `${key}로만 닿는 기능이 있으면 안 된다 — 눌러서 닿는 자리가 없다`
    );
  }
  console.log('  예약한 조합키마다 눌러서 닿는 자리가 함께 있다');

  // ---------------------------------------------------------------
  // 2. 껍데기가 실제로 그 열한 가지만 예약한다 (FR-25)
  // ---------------------------------------------------------------
  const reserved = new Set();
  if (/e\.key === 'F11'/.test(appJs)) reserved.add('F11');
  if (/e\.key === 'Escape'/.test(appJs)) reserved.add('Esc');
  for (const [pattern, name] of [
    [/ctrlKey[^\n]*'o' \|\| e\.key === 'O'/, 'Ctrl+O'],
    [/ctrlKey[^\n]*'w' \|\| e\.key === 'W'/, 'Ctrl+W'],
    [/ctrlKey[^\n]*'b' \|\| e\.key === 'B'/, 'Ctrl+B'],
    [/ctrlKey[^\n]*e\.key === '\\\\\\\\'/, 'Ctrl+\\']
  ]) {
    if (pattern.test(appJs)) reserved.add(name);
  }
  if (/e\.key === 'F5'/.test(appJs)) reserved.add('F5');
  if (/ctrlKey[^\n]*e\.key === 'Tab'/.test(appJs)) { reserved.add('Ctrl+Tab'); reserved.add('Ctrl+Shift+Tab'); }
  if (/!e\.ctrlKey[^\n]*e\.key === 'Tab'/.test(appJs)) { reserved.add('Tab'); reserved.add('Shift+Tab'); }
  assert(reserved.size >= 8, `껍데기가 예약한 것으로 확인된 키가 너무 적다: ${[...reserved].join(', ')}`);

  // 목록 밖의 Ctrl 조합을 새로 예약하지 않는다
  const ctrlKeys = [...appJs.matchAll(/e\.ctrlKey[^\n]*?e\.key === '(\w|\\\\)'/g)].map((m) => m[1].toLowerCase());
  const allowed = new Set(['o', 'w', 'b', '\\\\', 'tab']);
  for (const k of ctrlKeys) {
    assert(allowed.has(k), `FR-25 목록 밖의 Ctrl 조합을 예약했다: Ctrl+${k}`);
  }
  console.log(`  껍데기가 예약한 Ctrl 조합이 목록 안에 있다 (${[...new Set(ctrlKeys)].join(', ')})`);

  // ---------------------------------------------------------------
  // 3. 갈래별 안내 문서의 조합키 표가 FR-25와 어긋나지 않는다
  // ---------------------------------------------------------------
  for (const host of ['host_pywebview', 'host_electron']) {
    const doc = read(host, 'README.md');
    assert(/조합키|단축키/.test(doc), `${host}/README.md에 조합키 표가 없다`);
    for (const [key] of SHORTCUTS) {
      assert(
        doc.includes(key),
        `${host}/README.md의 표에 ${key}가 빠졌다`
      );
    }
    // 목록 밖의 조합키를 문서가 약속하면 안 된다
    const documented = [...doc.matchAll(/`(Ctrl\+[\w\\]+|Alt\+F4|Shift\+Tab|F\d+|Esc)`/g)].map((m) => m[1]);
    const known = new Set([...SHORTCUTS.map(([k]) => k), 'Ctrl+Shift+Tab', 'F6']);
    for (const d of documented) {
      assert(known.has(d), `${host}/README.md가 FR-25 목록 밖의 조합키를 약속한다: ${d}`);
    }
    console.log(`  ${host}/README.md의 조합키 표가 FR-25와 어긋난 항목 0건`);
  }

  // 두 갈래의 표가 서로 같다
  const pyDoc = read('host_pywebview', 'README.md');
  const elDoc = read('host_electron', 'README.md');
  const tableOf = (doc) => (doc.match(/^\|.*$/gm) || []).filter((l) => /Ctrl|F\d|Esc|Tab/.test(l)).join('\n');
  assert.strictEqual(tableOf(pyDoc), tableOf(elDoc), '두 갈래의 조합키 표가 서로 다르다');
  console.log('  두 갈래의 조합키 표가 서로 같다');

  console.log('All reachability checks (TE-049) passed successfully!');
}

run();
