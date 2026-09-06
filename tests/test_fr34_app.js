// tests/test_fr34_app.js — Phase 9 (TE-045)
// 실물 앱(markdown_browser)의 요구 셋을 껍데기 수정 0줄로 충족하는지 판정한다 (FR-34, FR-27, FR-9, FR-5)
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const TabModel = require('../shell/tab_model.js');
const SlotRegistry = require('../shell/slot_registry.js');
const TreeExplorer = require('../shell/tree.js');
const appFR34 = require('./fixture_app_fr34.js');

const { TabManager, KindRegistry } = TabModel;
const { TreeModel } = TreeExplorer;
const ROOT = path.join(__dirname, '..');
const SHELL_DIR = path.join(ROOT, 'shell');

// 브릿지 흉내 — call_domain으로 시작 인자를 돌려준다 (계약의 도메인 묶음)
class MockBridge {
  constructor(fsMap, startupTarget) {
    this.fsMap = fsMap;
    this.startupTarget = startupTarget || null;
    this.domainCalls = [];
    this.readCalls = [];
  }

  async list_children(relativePath) {
    return { ok: true, value: this.fsMap[relativePath] || [] };
  }

  async call_domain(target) {
    this.domainCalls.push(target);
    if (target === 'startup_target' && this.startupTarget) {
      return { ok: true, value: this.startupTarget };
    }
    return { ok: false, error: { code: 'UNSUPPORTED_TARGET', message: '' } };
  }
}

// 버튼을 얹을 최소 DOM 흉내
function createFakeElement(tagName) {
  const el = {
    tagName: String(tagName || 'div').toUpperCase(),
    className: '',
    id: '',
    title: '',
    textContent: '',
    children: [],
    parentNode: null,
    _handlers: {},
    ownerDocument: null,
    appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      child.parentNode = null;
      return child;
    },
    addEventListener(type, fn) { (this._handlers[type] = this._handlers[type] || []).push(fn); },
    click() { for (const fn of this._handlers.click || []) fn({}); }
  };
  return el;
}

function createFakeDocument() {
  const registry = new Map();
  const doc = {
    createElement: (tag) => { const el = createFakeElement(tag); el.ownerDocument = doc; return el; },
    querySelector: (sel) => registry.get(sel) || null,
    getElementById: (id) => {
      for (const el of registry.values()) {
        const hit = (el.children || []).find((c) => c.id === id);
        if (hit) return hit;
      }
      return null;
    },
    __register: (sel, el) => registry.set(sel, el)
  };
  return doc;
}

// 껍데기의 'shell-rendered' 통보를 흉내내는 최소 window
function createFakeWindow() {
  const handlers = {};
  return {
    addEventListener: (type, fn) => { (handlers[type] = handlers[type] || []).push(fn); },
    dispatchEvent: (event) => {
      for (const fn of handlers[event.type] || []) fn(event);
      return true;
    }
  };
}

function snapshotShell() {
  const snapshot = {};
  for (const name of fs.readdirSync(SHELL_DIR)) {
    const p = path.join(SHELL_DIR, name);
    if (fs.statSync(p).isFile()) snapshot[name] = fs.readFileSync(p);
  }
  return snapshot;
}

function assertShellUnchanged(before, label) {
  const after = snapshotShell();
  const beforeNames = Object.keys(before).sort();
  const afterNames = Object.keys(after).sort();
  assert.deepStrictEqual(afterNames, beforeNames, `${label}: 껍데기 파일이 늘거나 줄지 않는다`);
  let changed = 0;
  for (const name of beforeNames) {
    if (!after[name].equals(before[name])) changed++;
  }
  assert.strictEqual(changed, 0, `${label}: 껍데기 코드의 변경 줄 수가 0이다`);
}

const FS_MAP = {
  '': [
    { name: 'docs', path: 'docs', is_dir: true },
    { name: 'README.md', path: 'README.md', is_dir: false },
    { name: 'notes.md', path: 'notes.md', is_dir: false },
    { name: 'build.log', path: 'build.log', is_dir: false },
    { name: 'index.js', path: 'index.js', is_dir: false }
  ],
  'docs': [
    { name: 'spec.md', path: 'docs/spec.md', is_dir: false },
    { name: 'diagram.png', path: 'docs/diagram.png', is_dir: false }
  ]
};

async function run() {
  console.log('Running FR-34 test app checks (TE-045)...');

  // 앱을 만들기 전 껍데기 상태를 떠 둔다
  const shellBefore = snapshotShell();

  const slots = new SlotRegistry();
  const registry = SlotRegistry.createSlotBackedRegistry(slots, new KindRegistry());
  const tabManager = new TabManager(registry);
  appFR34.install(slots);

  // ---------------------------------------------------------------
  // 1. 확장자로 트리 항목 거르기 (FR-5)
  // ---------------------------------------------------------------
  const bridge = new MockBridge(FS_MAP, 'notes.md');
  const tree = new TreeModel({ bridge, tabManager, slots });
  await tree.setRoot('D:\\workspace');

  const topRows = tree.getVisibleRows().filter((r) => !r.isRoot);
  const topNames = topRows.map((r) => r.name).sort();
  assert.deepStrictEqual(
    topNames,
    ['README.md', 'docs', 'notes.md'],
    '확장자에 맞는 파일과 폴더만 남는다'
  );
  assert.strictEqual(
    topRows.filter((r) => !r.is_dir && !r.name.endsWith('.md')).length,
    0,
    '.md가 아닌 파일 행이 0건이다'
  );

  // 폴더를 펼쳐도 같은 규칙이 걸린다 — 폴더를 남긴 덕분에 하위로 내려갈 수 있다
  await tree.toggleExpand('docs');
  const docsRows = tree.getVisibleRows().filter((r) => r.path.indexOf('docs/') === 0);
  assert.deepStrictEqual(
    docsRows.map((r) => r.name),
    ['spec.md'],
    '하위 폴더에서도 확장자 필터가 걸린다'
  );

  // ---------------------------------------------------------------
  // 2. 트리를 거치지 않고 새 탭 열기 (FR-9)
  // ---------------------------------------------------------------
  const cursorBefore = tree.cursorPath;
  const expandedBefore = Array.from(tree.expanded).sort();

  const doc = createFakeDocument();
  const barEl = createFakeElement('div');
  barEl.ownerDocument = doc;
  doc.__register('.tab-bar-actions', barEl);

  let openedNotifications = 0;
  const fakeWindow = createFakeWindow();
  appFR34.keepNewTabButton(fakeWindow, doc, slots, tabManager, () => { openedNotifications++; });
  const button = doc.getElementById('btn-app-new-tab');
  assert(button, '앱이 껍데기 마크업을 고치지 않고 자기 버튼을 얹는다');
  assert.strictEqual(barEl.children.length, 1, '버튼이 탭 줄에 붙는다');

  // 껍데기가 다시 그리면 화면을 통째로 새로 만든다. 앱의 버튼이 살아남아야 한다 (FR-9)
  barEl.children.length = 0; // renderEditor()의 innerHTML 교체를 흉내낸다
  assert.strictEqual(doc.getElementById('btn-app-new-tab'), null, '다시 그리면 앱의 버튼이 사라진다');
  fakeWindow.dispatchEvent({ type: 'shell-rendered', detail: { area: 'editor' } });
  const remounted = doc.getElementById('btn-app-new-tab');
  assert(remounted, '껍데기의 다시 그림 통보를 받아 앱이 자기 버튼을 되붙인다');
  assert.strictEqual(barEl.children.length, 1, '되붙일 때 버튼이 늘어나지 않는다');

  // 통보를 한 번 더 받아도 버튼이 겹쳐 쌓이지 않는다
  fakeWindow.dispatchEvent({ type: 'shell-rendered', detail: { area: 'editor' } });
  assert.strictEqual(barEl.children.length, 1, '통보가 반복돼도 버튼은 하나다');

  assert.strictEqual(tabManager.getAllTabs().length, 0, '아직 열린 탭이 없다');
  button.click();
  assert.strictEqual(tabManager.getAllTabs().length, 1, '버튼을 눌러 탭이 열린다');
  assert.strictEqual(openedNotifications, 1, '앱이 자기 후속 처리를 이어받는다');

  // 그 탭을 열 때 트리 커서가 움직이지 않는다 (FR-19)
  assert.strictEqual(tree.cursorPath, cursorBefore, '트리 커서가 움직이지 않는다');
  assert.deepStrictEqual(Array.from(tree.expanded).sort(), expandedBefore, '펼침 상태도 그대로다');

  // 위 단언이 "움직일 수 있는데 안 움직였다"인지 확인한다.
  // 커서가 바뀌지 않는 값이면 위 대조는 아무것도 판정하지 못한다.
  tree.setCursor('notes.md');
  assert.strictEqual(tree.cursorPath, 'notes.md', '커서는 움직일 수 있는 값이다');
  const cursorMoved = tree.cursorPath;
  // 이미 열린 것과 같은 대상으로 열어 탭 수는 그대로 두고 커서만 본다
  slots.executeOpenRoute('new-tab', tabManager, { path: tabManager.getAllTabs()[0].resource.path });
  assert.strictEqual(tree.cursorPath, cursorMoved, '여는 경로로 연 뒤에도 커서는 그 자리에 있다');
  tree.setCursor(cursorBefore);

  // 트리로 연 탭과 같은 규칙으로 다뤄진다 — 중복 정책 · 고정 · 닫기 · 패널 이동
  const routeTab = tabManager.getAllTabs()[0];
  slots.executeOpenRoute('new-tab', tabManager, { path: routeTab.resource.path });
  assert.strictEqual(tabManager.getAllTabs().length, 1, '중복 정책이 트리로 연 탭과 같게 걸린다');

  tabManager.pinTab(routeTab.id);
  assert.strictEqual(tabManager.getTab(routeTab.id).pinned, true, '고정이 동작한다');

  tabManager.moveTabToPane(routeTab.id, 'pane-1');
  assert.strictEqual(tabManager.getTab(routeTab.id).paneId, 'pane-1', '반대쪽 패널 이동이 동작한다');

  tabManager.closeTab(routeTab.id);
  assert.strictEqual(tabManager.getTab(routeTab.id), null, '닫기가 동작한다');

  // ---------------------------------------------------------------
  // 3. 파일 경로를 인자로 받아 시작 (FR-27)
  // ---------------------------------------------------------------
  const startupResult = await appFR34.openStartupArgument(bridge, slots, tabManager);
  assert(startupResult, '시작 인자로 받은 파일의 탭이 열린다');
  assert.deepStrictEqual(bridge.domainCalls, ['startup_target'], '계약의 call_domain으로만 인자를 받는다');

  const startupTab = tabManager.getAllTabs()[0];
  assert.strictEqual(startupTab.resource.path, 'notes.md', '인자로 받은 파일이 대상이다');
  assert.strictEqual(startupTab.title, 'notes.md');
  assert.strictEqual(startupTab.pinned, true, '시작 탭은 고정으로 열린다');
  assert.strictEqual(tree.cursorPath, cursorBefore, '시작 탭을 열어도 트리 커서가 움직이지 않는다');

  // 확장자에 맞지 않는 인자는 열지 않는다 (앱의 판단이지 껍데기의 판단이 아니다)
  const otherBridge = new MockBridge(FS_MAP, 'build.log');
  const rejected = await appFR34.openStartupArgument(otherBridge, slots, tabManager);
  assert.strictEqual(rejected, null, '앱이 받아들이지 않는 인자는 탭을 만들지 않는다');

  // 인자가 없으면 아무 일도 일어나지 않고 앱은 계속 돈다
  const emptyBridge = new MockBridge(FS_MAP, null);
  assert.strictEqual(await appFR34.openStartupArgument(emptyBridge, slots, tabManager), null);

  // ---------------------------------------------------------------
  // 셋을 만드는 동안 껍데기 코드의 변경 줄 수가 0 (FR-34)
  // ---------------------------------------------------------------
  assertShellUnchanged(shellBefore, '시험용 앱을 만드는 동안');

  // 껍데기가 다시 그린 뒤 실제로 통보를 보낸다 — 위 되붙임이 기댈 곳이다
  const shellAppSrc = shellBefore['app.js'].toString('utf8');
  assert(
    /new CustomEvent\('shell-rendered'/.test(shellAppSrc),
    '껍데기가 shell-rendered 통보를 보낸다'
  );
  assert(
    /bindEditorEvents\(\);\s*\n\s*mountActiveViews\(\);[\s\S]*?notifyRendered\('editor'\);\s*\n  }/.test(shellAppSrc),
    'renderEditor가 끝날 때 통보한다'
  );
  assert(
    /notifyRendered\('tree'\);/.test(shellAppSrc),
    'renderTree가 끝날 때도 통보한다'
  );

  // 앱의 코드는 껍데기 밖에 있다
  const appSrc = fs.readFileSync(path.join(__dirname, 'fixture_app_fr34.js'), 'utf8');
  assert(
    !appSrc.includes('shell/'),
    '앱이 껍데기 파일을 직접 건드리지 않는다'
  );
  // 껍데기는 이 앱도, 그 종류도, 그 확장자도 알지 못한다
  for (const name of Object.keys(shellBefore)) {
    const src = shellBefore[name].toString('utf8');
    for (const leak of ['markdown', 'AppFR34', 'startup_target', '.md']) {
      assert(
        !src.includes(leak),
        `shell/${name}에 앱의 것('${leak}')이 새어 들어가면 안 된다`
      );
    }
  }

  console.log('All FR-34 test app checks (TE-045) passed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
