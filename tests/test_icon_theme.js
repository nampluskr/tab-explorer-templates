// tests/test_icon_theme.js — Phase 9 (계획 외 개선, FR-30)
// 파일 타입 아이콘 테마 셋이 실제로 다르게 그려지는지 판정한다.
//
// 해석기는 shared/design에 있고 껍데기는 확장자 규칙을 알지 못한다.
// 시험은 자료를 직접 물려 주어 네트워크 없이 판정한다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const IconTheme = require('../shared/design/icon_theme.js');
const TreeExplorer = require('../shell/tree.js');

const ROOT = path.join(__dirname, '..');
const { renderTreeHtml } = TreeExplorer;

const SETI = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared', 'design', 'icons', 'seti', 'theme.json'), 'utf8'));
const VSICONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'shared', 'design', 'icons', 'vscode-icons', 'theme.json'), 'utf8'));

const ENTRIES = [
  { name: 'src', is_dir: true, expanded: false },
  { name: 'src', is_dir: true, expanded: true },
  { name: 'README.md', is_dir: false },
  { name: 'app.py', is_dir: false },
  { name: 'index.js', is_dir: false }
];

function run() {
  console.log('Running icon theme checks (FR-30)...');

  // ---------------------------------------------------------------
  // 1. 세 테마를 고를 수 있다
  // ---------------------------------------------------------------
  assert.deepStrictEqual(IconTheme.THEMES, ['simple', 'builtin', 'vsicons'], '세 단계가 정의돼 있다');

  const appJs = fs.readFileSync(path.join(ROOT, 'shell', 'app.js'), 'utf8');
  for (const name of IconTheme.THEMES) {
    assert(appJs.includes(`set-icon-theme:${name}`), `메뉴에서 ${name}을 고를 수 있다`);
  }

  // ---------------------------------------------------------------
  // 2. 자료가 없으면 기본 한 벌로 떨어지고 앱은 계속 돈다
  // ---------------------------------------------------------------
  IconTheme.__reset();
  for (const theme of IconTheme.THEMES) {
    for (const entry of ENTRIES) {
      const d = IconTheme.resolve(theme, entry);
      assert.strictEqual(d.render, 'symbol', `${theme}: 자료가 없으면 심볼로 떨어진다`);
      assert(d.href.includes('icons.svg#icon-'), '아이콘 파일의 심볼을 가리킨다');
    }
  }
  // 알지 못하는 이름을 줘도 멈추지 않는다
  assert.strictEqual(IconTheme.resolve('없는테마', ENTRIES[2]).render, 'symbol', '모르는 테마는 기본으로 떨어진다');
  assert.strictEqual(IconTheme.resolve('simple', null).render, 'symbol', '항목이 없어도 멈추지 않는다');

  // ---------------------------------------------------------------
  // 3. 자료를 물리면 세 테마가 서로 다르게 그려진다
  // ---------------------------------------------------------------
  IconTheme.__setData('builtin', SETI);
  IconTheme.__setData('vsicons', VSICONS);

  const simple = ENTRIES.map((e) => IconTheme.resolve('simple', e));
  const builtin = ENTRIES.map((e) => IconTheme.resolve('builtin', e));
  const vsicons = ENTRIES.map((e) => IconTheme.resolve('vsicons', e));

  assert(simple.every((d) => d.render === 'symbol'), 'Simple은 심볼 한 벌을 쓴다');
  assert(builtin.every((d) => d.render === 'glyph'), 'VS Code Built-in은 글꼴 글리프를 쓴다');
  assert(vsicons.every((d) => d.render === 'image'), 'VS Code Icons는 SVG 파일을 쓴다');

  // ---------------------------------------------------------------
  // 4. 파일 타입마다 다른 아이콘이 나온다 — 이것이 없으면 고른 의미가 없다
  // ---------------------------------------------------------------
  const mdIdx = 2, pyIdx = 3, jsIdx = 4;
  assert.notStrictEqual(builtin[mdIdx].char, builtin[pyIdx].char, 'Built-in: md와 py가 다른 글리프다');
  assert.notStrictEqual(builtin[pyIdx].char, builtin[jsIdx].char, 'Built-in: py와 js가 다른 글리프다');

  assert.notStrictEqual(vsicons[mdIdx].src, vsicons[pyIdx].src, 'VS Code Icons: md와 py가 다른 파일이다');
  assert.notStrictEqual(vsicons[pyIdx].src, vsicons[jsIdx].src, 'VS Code Icons: py와 js가 다른 파일이다');
  assert(/markdown/.test(vsicons[mdIdx].src), 'md가 markdown 아이콘을 가리킨다: ' + vsicons[mdIdx].src);
  assert(/python/.test(vsicons[pyIdx].src), 'py가 python 아이콘을 가리킨다: ' + vsicons[pyIdx].src);

  // 가리키는 SVG 파일이 실제로 있다
  for (const d of vsicons) {
    const rel = d.src.replace('../shared/design/', '');
    assert(
      fs.existsSync(path.join(ROOT, 'shared', 'design', rel)),
      `가리키는 아이콘 파일이 있다: ${d.src}`
    );
  }

  // 폴더는 펼침 여부로 갈린다
  assert.notStrictEqual(vsicons[0].src, vsicons[1].src, 'VS Code Icons: 접힌 폴더와 펼친 폴더가 다르다');
  assert.notStrictEqual(builtin[0].char, builtin[1].char, 'Built-in: 접힌 폴더와 펼친 폴더가 다르다');
  assert.notStrictEqual(simple[0].href, simple[1].href, 'Simple: 접힌 폴더와 펼친 폴더가 다르다');

  // ---------------------------------------------------------------
  // 5. 트리가 서술값대로 그린다
  // ---------------------------------------------------------------
  const model = {
    cursorPath: '',
    getVisibleRows: () => [
      { path: '', name: 'demo', is_dir: true, depth: 0, isRoot: true, isExpanded: true },
      { path: 'README.md', name: 'README.md', is_dir: false, depth: 1, isExpanded: false }
    ]
  };

  globalThis.IconTheme = IconTheme;
  const htmlSimple = renderTreeHtml(model, 'simple');
  const htmlBuiltin = renderTreeHtml(model, 'builtin');
  const htmlVsicons = renderTreeHtml(model, 'vsicons');

  assert(/<svg class="tree-icon"[^>]*><use href="[^"]*icons\.svg#/.test(htmlSimple), 'Simple은 심볼을 그린다');
  assert(/<span class="tree-icon glyph-icon seti-icon"/.test(htmlBuiltin), 'Built-in은 글리프를 그린다');
  assert(/<img class="tree-icon" src="[^"]*vscode-icons\/icons\//.test(htmlVsicons), 'VS Code Icons는 그림을 그린다');
  // 어느 테마에서도 아이콘 자리의 클래스가 같아 크기와 정렬이 유지된다 (FR-31)
  for (const html of [htmlSimple, htmlBuiltin, htmlVsicons]) {
    const icons = html.match(/class="tree-icon[^"]*"/g) || [];
    assert.strictEqual(icons.length, 2, '행마다 아이콘이 하나씩 그려진다');
  }

  // ---------------------------------------------------------------
  // 6. 껍데기는 확장자 규칙을 알지 못한다 (FR-4, 제약 5)
  // ---------------------------------------------------------------
  const treeSrc = fs.readFileSync(path.join(ROOT, 'shell', 'tree.js'), 'utf8');
  for (const src of [appJs, treeSrc]) {
    assert(!/fileExtensions|languageIds|iconDefinitions/.test(src), '껍데기가 테마 자료 구조를 알지 못한다');
    assert(!/\.md|\.py|\.js['"]/.test(src.replace(/\.js'|\.js"/g, '')), '껍데기가 확장자를 알지 못한다');
  }
  const resolverSrc = fs.readFileSync(path.join(ROOT, 'shared', 'design', 'icon_theme.js'), 'utf8');
  assert(/fileExtensions/.test(resolverSrc), '해석기가 그 규칙을 갖는다');

  // 스타일이 세 종류를 모두 받는다
  const cssSrc = fs.readFileSync(path.join(ROOT, 'shell', 'shell.css'), 'utf8');
  assert(/@font-face[\s\S]*?font-family:\s*"seti"/.test(cssSrc), 'seti 글꼴이 선언돼 있다');
  assert(/@font-face[\s\S]*?font-family:\s*"codicon"/.test(cssSrc), 'codicon 글꼴이 선언돼 있다');
  assert(/img\.tree-icon/.test(cssSrc), '그림 아이콘 스타일이 있다');

  IconTheme.__reset();
  delete globalThis.IconTheme;

  console.log('All icon theme checks (FR-30) passed successfully!');
}

run();
