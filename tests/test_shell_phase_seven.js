// tests/test_shell_phase_seven.js — Phase 7 화면 및 사용성 단위 테스트 (TE-035 ~ TE-040)
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const TabModel = require('../shell/tab_model.js');
const ViewLifecycle = require('../shell/view_lifecycle.js');
const SlotRegistry = require('../shell/slot_registry.js');
const { TreeModel } = require('../shell/tree.js');

const { KindRegistry, TabManager } = TabModel;
const { ViewManager } = ViewLifecycle;

console.log('--- Phase 7: Shell Screen and Usability Unit Tests ---');

// -------------------------------------------------------------
// 1. TE-037: 미리보기 탭과 고정 탭 (FR-23)
// -------------------------------------------------------------
console.log('1. TE-037: Preview tab replacement and pinning');
const registry = new KindRegistry();
const tabManager = new TabManager(registry);

// 1) 첫 번째 미리보기 탭 열기
const t1 = tabManager.openTab({
  kind: 'default',
  title: 'doc1.md',
  resource: { path: 'doc1.md' },
  preview: true
});
assert.strictEqual(tabManager.getAllTabs().length, 1, 'Should have 1 tab');
assert.strictEqual(t1.tab.preview, true, 't1 should be preview');
assert.strictEqual(t1.tab.pinned, false, 't1 should not be pinned');

// 2) 다른 대상을 미리보기로 열기 -> 기존 미리보기 탭을 대신하여 탭 수 1 유지
const t2 = tabManager.openTab({
  kind: 'default',
  title: 'doc2.md',
  resource: { path: 'doc2.md' },
  preview: true
});
assert.strictEqual(tabManager.getAllTabs().length, 1, 'Preview tab must replace existing preview, keeping tab count at 1');
assert.strictEqual(tabManager.getActiveTab().resource.path, 'doc2.md', 'Active tab must be the new preview');

// 3) 고정 탭 열기 (pinned: true)
const t3 = tabManager.openTab({
  kind: 'default',
  title: 'doc3.md',
  resource: { path: 'doc3.md' },
  preview: false,
  pinned: true
});
assert.strictEqual(tabManager.getAllTabs().length, 2, 'Opening pinned tab increases tab count to 2');

// 4) 기존 미리보기 탭을 고정(pinTab)으로 승격
tabManager.pinTab(t2.tab.id);
assert.strictEqual(t2.tab.pinned, true, 't2 should now be pinned');
assert.strictEqual(t2.tab.preview, false, 't2 should no longer be preview');

// 5) 트리를 거치지 않는 직접 열기(FR-9)에서도 동일한 규칙 적용
const directPreview1 = tabManager.openTab({
  kind: 'custom',
  title: 'direct1',
  resource: { id: 'd1' },
  preview: true
});
assert.strictEqual(tabManager.getAllTabs().length, 3, 'Now 3 tabs (2 pinned, 1 preview)');
assert.strictEqual(directPreview1.tab.preview, true);

const directPreview2 = tabManager.openTab({
  kind: 'custom',
  title: 'direct2',
  resource: { id: 'd2' },
  preview: true
});
assert.strictEqual(tabManager.getAllTabs().length, 3, 'Direct preview tab must also replace existing preview (tab count stays 3)');
assert.strictEqual(tabManager.getActiveTab().title, 'direct2');

// 6) TreeModel openRowTab 연동 검증: preview true vs false(고정 승격)
const tree = new TreeModel({ tabManager });
tree.openRowTab({ path: 'tree-item.txt', name: 'tree-item.txt', is_dir: false }, true);
const treeTab = tabManager.getActiveTab();
assert.strictEqual(treeTab.preview, true, 'Tree openRowTab with true must open preview');
assert.strictEqual(treeTab.pinned, false, 'Tree openRowTab with true must not be pinned');

// 더블클릭 연동 (false 전달 시 기존 미리보기 탭이 고정 탭으로 승격)
tree.openRowTab({ path: 'tree-item.txt', name: 'tree-item.txt', is_dir: false }, false);
assert.strictEqual(treeTab.preview, false, 'Tree openRowTab with false must promote preview to false');
assert.strictEqual(treeTab.pinned, true, 'Tree openRowTab with false must promote pinned to true');

console.log('  -> TE-037 passed');

// -------------------------------------------------------------
// 2. TE-038: 보기 영역 가르기와 탭 이동 (FR-24, FR-12)
// -------------------------------------------------------------
console.log('2. TE-038: Split editor, pane limits, and tab move preserving view instances');

// 1) 보기 수명주기 매니저와 연결
let viewCreateCount = 0;
const viewManager = new ViewManager({
  tabManager,
  providerResolver: () => ({
    createView: (container, tab) => {
      viewCreateCount += 1;
      return {
        mount: () => {},
        activate: () => {},
        deactivate: () => {},
        resize: () => {},
        destroy: () => {}
      };
    }
  })
});

// 초기 상태: 단일 조각
assert.strictEqual(tabManager.getPanes().length, 1, 'Initially 1 pane');

// 2) 가르기 (splitActivePane)
const splitOk = tabManager.splitActivePane();
assert.strictEqual(splitOk, true, 'splitActivePane must succeed');
assert.strictEqual(tabManager.getPanes().length, 2, 'Should now have 2 panes');

// 3) 셋 이상으로 갈리지 않는다 (FR-24)
const splitThird = tabManager.splitActivePane();
assert.strictEqual(splitThird, false, 'Must not split into 3 or more panes');
assert.strictEqual(tabManager.getPanes().length, 2, 'Pane count remains capped at 2');

// 4) 탭을 반대쪽 조각으로 이동 (moveTabToPane)
const [paneA, paneB] = tabManager.getPanes();
const tabToMove = tabManager.getTabsByPane(paneB)[0];
assert(tabToMove, 'There should be a tab in paneB');

const moveOk = tabManager.moveTabToPane(tabToMove.id, paneA);
assert.strictEqual(moveOk, true, 'moveTabToPane must succeed');
assert.strictEqual(tabToMove.paneId, paneA, 'tab should now belong to paneA');

// 5) 조각의 탭을 모두 닫으면 가르기가 풀린다 (FR-24)
// paneB의 남은 탭을 모두 닫기
const remainingPaneB = tabManager.getTabsByPane(paneB);
remainingPaneB.forEach(t => tabManager.closeTab(t.id));

assert.strictEqual(tabManager.getPanes().length, 1, 'When all tabs in a pane are closed, split must automatically collapse to 1 pane');
assert.strictEqual(tabManager.getPanes()[0], paneA, 'Remaining pane must be paneA');

console.log('  -> TE-038 passed');

// -------------------------------------------------------------
// 3. TE-039: 조합키 열한 가지와 메뉴 (FR-25, FR-22)
// -------------------------------------------------------------
console.log('3. TE-039: 11 reserved shortcuts in shell/app.js');
const appJs = fs.readFileSync(path.join(__dirname, '../shell/app.js'), 'utf-8');

const expectedShortcuts = [
  'F11',       // Zen 모드
  'Escape',    // 메뉴 닫기 / Zen 해제
  'Ctrl+O',    // 루트 열기
  'Ctrl+W',    // 활성 탭 닫기
  'Ctrl+B',    // 사이드바 토글
  'Ctrl+\\',   // 에디터 분할
  'F5',        // 새로 읽기
  'F6',        // 탭 반대쪽 조각 이동
  'Tab',       // 초점 순환
  'Shift+Tab', // 초점 역순환
  'Ctrl+Tab'   // 탭 순환
];

for (const sc of expectedShortcuts) {
  assert(appJs.includes(sc), `app.js must handle or reference shortcut ${sc}`);
}

console.log('  -> TE-039 passed');

// -------------------------------------------------------------
// 4. TE-040: 설정 보존 (FR-26)
// -------------------------------------------------------------
console.log('4. TE-040: Shell settings persistence excluding open tabs');

// save_settings 및 get_settings 로직 검증
// 1) 탭 정보(tabs, open_tabs 등)를 설정 객체에 넣지 않는지 검증 (FR-26: 앱 재시작 시 탭 0개)
assert(!appJs.includes('open_tabs:'), 'app.js must not persist open tabs');
assert(!appJs.includes('tabs: tabManager'), 'app.js must not persist tab objects');

// 2) host_electron의 main.js에서 defaults 검증
const electronMainJs = fs.readFileSync(path.join(__dirname, '../host_electron/host/main.js'), 'utf-8');
assert(electronMainJs.includes('sidebar_width: 280'), 'Electron defaults must include sidebar_width 280');
assert(electronMainJs.includes('theme: "gray"'), 'Electron defaults must include gray theme');
assert(!electronMainJs.includes('tabs:'), 'Electron settings defaults must NOT include tabs');

// 3) host_pywebview의 bridge.py에서 settings 기본값 검증
const pyBridge = fs.readFileSync(path.join(__dirname, '../host_pywebview/host/bridge.py'), 'utf-8');
assert(!pyBridge.includes('"tabs":'), 'Pywebview settings must NOT persist open tabs');

console.log('  -> TE-040 passed');

// -------------------------------------------------------------
// 5. TE-035 & TE-036: 프레임리스 창 제어 및 팝오버 스타일
// -------------------------------------------------------------
console.log('5. TE-035 & TE-036: Frameless window controls and menu popover alignments');
const shellCss = fs.readFileSync(path.join(__dirname, '../shell/shell.css'), 'utf-8');

// drag-region 및 no-drag
assert(shellCss.includes('-webkit-app-region: drag'), 'shell.css must include draggable region');
assert(shellCss.includes('-webkit-app-region: no-drag'), 'shell.css must exclude buttons from drag');

// 팝오버가 자신이 속한 메뉴 버튼의 왼쪽 끝에 맞춰 열림 (left: 0, position: absolute)
assert(shellCss.includes('.menu-popover {'), 'shell.css must style menu-popover');
assert(shellCss.includes('left: 0;'), 'menu-popover must align to left: 0 of menu-slot');

// 상태 표시줄 우측 D-23 포맷
assert(appJs.includes('${appName} ${appVer} (${buildDate}) - ${hostName}'), 'D-23 runtime text format must be adhered');

// 탭 상단 모서리 라운딩 제외 (border-radius: 0)
assert(shellCss.includes('.tab {') && shellCss.includes('border-radius: 0;'), 'Tab border-radius must be 0 (rectangular)');

console.log('  -> TE-035 & TE-036 passed');

// -------------------------------------------------------------
// 6. TabManager on() method & Shell App initialization robustness
// -------------------------------------------------------------
console.log('6. TabManager on() event listener and readyState initialization');
assert(typeof tabManager.on === 'function', 'TabManager must provide on() method as event alias');
let onEventCalled = false;
const unsub = tabManager.on('custom-test', (data) => {
  if (data && data.flag === 42) onEventCalled = true;
});
tabManager._emit('custom-test', { flag: 42 });
assert(onEventCalled, 'tabManager.on callback must be triggered on emitted event');
unsub();

// app.js must support both loading and complete readyStates
assert(appJs.includes("document.readyState === 'loading'"), 'app.js must check document.readyState');
assert(appJs.includes('initApp()'), 'app.js must call initApp immediately when document already ready');

console.log('  -> TabManager on() and readyState initialization passed');

// -------------------------------------------------------------
// 7. ViewManager mountView() method support
// -------------------------------------------------------------
console.log('7. ViewManager mountView() method support');
const vm = new ViewManager({ tabManager });
assert(typeof vm.mountView === 'function', 'ViewManager must provide mountView() method');
const dummyEl = {
  appendChild: () => {},
  removeChild: () => {},
  children: [],
  style: {}
};
const dummyTab = { id: 'dummy-tab-1', kind: 'default', title: 'Dummy' };
const mountedRec = vm.mountView(dummyEl, dummyTab);
assert(mountedRec !== null, 'mountView should return view record');
assert.strictEqual(mountedRec.isActive, true, 'mounted view must be active');
vm.dispose();

console.log('  -> ViewManager mountView() passed');

console.log('\nAll Phase 7 Shell unit tests passed successfully!');
