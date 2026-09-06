// tests/test_slots.js — Phase 5 단위 테스트 (Node)
// 다섯 자리 각각을 갈아끼우는 시험과 임의의 새 종류 검증 (FR-5 ~ FR-10)
const assert = require('assert');
const TabModel = require('../shell/tab_model.js');
const ViewLifecycle = require('../shell/view_lifecycle.js');
const SlotRegistry = require('../shell/slot_registry.js');

const { TabManager, DUPLICATE_POLICY } = TabModel;
const { ViewManager } = ViewLifecycle;

function run() {
  console.log('Running SlotRegistry tests (Phase 5)...');

  // 1. TE-023: 트리 항목 자리 (FR-5)
  // 아무것도 끼우지 않으면 받은 것을 그대로 표시
  const slots = new SlotRegistry();
  const sampleEntries = [
    { name: 'src', path: 'src', is_dir: true },
    { name: 'README.md', path: 'README.md', is_dir: false },
    { name: 'index.js', path: 'index.js', is_dir: false },
    { name: 'data.json', path: 'data.json', is_dir: false },
    { name: 'docs', path: 'docs', is_dir: true }
  ];

  assert.strictEqual(slots.filterTreeItems(sampleEntries).length, 5);

  // 자리 갈아끼우기 1: 확장자 하나(.md)만 남기는 필터
  slots.setTreeItemFilter((entries) => {
    return entries.filter((e) => e.is_dir || e.name.endsWith('.md'));
  });
  const mdFiltered = slots.filterTreeItems(sampleEntries);
  assert.strictEqual(mdFiltered.length, 3);
  assert.deepStrictEqual(
    mdFiltered.map((e) => e.name),
    ['src', 'README.md', 'docs']
  );

  // 자리 갈아끼우기 2: 폴더만 남기는 필터 (파일 행 0건)
  slots.setTreeItemFilter((entries) => entries.filter((e) => e.is_dir));
  const folderFiltered = slots.filterTreeItems(sampleEntries);
  assert.strictEqual(folderFiltered.length, 2);
  assert.deepStrictEqual(
    folderFiltered.map((e) => e.name),
    ['src', 'docs']
  );
  assert.strictEqual(folderFiltered.filter((e) => !e.is_dir).length, 0);

  // 2. TE-024: 행 선택 매핑 자리 (FR-6)
  // 자리 갈아끼우기 1: 파일 행에서만 탭 열림 (폴더 행은 null)
  slots.setRowSelectionMapper((entry) => {
    if (entry.is_dir) return null;
    return { kind: 'file_view', resource: { path: entry.path }, title: entry.name };
  });
  assert.strictEqual(slots.mapRowSelection({ name: 'src', is_dir: true }), null);
  assert.deepStrictEqual(slots.mapRowSelection({ name: 'main.js', path: 'main.js', is_dir: false }), {
    kind: 'file_view',
    resource: { path: 'main.js' },
    title: 'main.js'
  });

  // 자리 갈아끼우기 2: 폴더 행에서만 탭 열림 (파일 행은 null)
  slots.setRowSelectionMapper((entry) => {
    if (!entry.is_dir) return null;
    return { kind: 'folder_view', resource: { path: entry.path }, title: entry.name };
  });
  assert.strictEqual(slots.mapRowSelection({ name: 'main.js', is_dir: false }), null);
  assert.deepStrictEqual(slots.mapRowSelection({ name: 'src', path: 'src', is_dir: true }), {
    kind: 'folder_view',
    resource: { path: 'src' },
    title: 'src'
  });

  // 3. TE-025: 보기 제공자 자리 (FR-7)
  const tm = new TabManager();
  const vm = new ViewManager({
    tabManager: tm,
    providerResolver: (kind) => slots.getViewProvider(kind)
  });

  let viewACount = 0;
  let viewBCount = 0;
  class ViewA {
    constructor() {
      viewACount++;
      this.type = 'ViewA';
    }
  }
  class ViewB {
    constructor() {
      viewBCount++;
      this.type = 'ViewB';
    }
  }

  slots.registerViewProvider('kind_a', () => new ViewA());
  slots.registerViewProvider('kind_b', () => new ViewB());

  const tabA = tm.openTab({ kind: 'kind_a', title: 'Tab A' }).tab;
  const tabB = tm.openTab({ kind: 'kind_b', title: 'Tab B' }).tab;
  vm.activateView(tabA.id);
  vm.activateView(tabB.id);

  assert.strictEqual(vm.getViewInstance(tabA.id).type, 'ViewA');
  assert.strictEqual(vm.getViewInstance(tabB.id).type, 'ViewB');
  assert.strictEqual(viewACount, 1);
  assert.strictEqual(viewBCount, 1);

  // 등록되지 않은 종류로 탭 열기 (앱이 멈추지 않고 알림이 남음)
  let unregisteredNotice = null;
  slots.onUnregisteredKind((kind, tab) => {
    unregisteredNotice = { kind, tabId: tab.id };
  });

  // 등록되지 않은 kind_unregistered로 열기
  const tabUnreg = tm.openTab({ kind: 'kind_unregistered', title: 'Unregistered' }).tab;
  assert.doesNotThrow(() => {
    vm.activateView(tabUnreg.id);
  });
  const unregView = vm.getViewInstance(tabUnreg.id);
  assert.ok(unregView !== null, 'App must continue and provide safe fallback view');

  // 4. TE-026: 중복 정책 자리 (FR-8)
  // 4-1. 기존 탭 vs 항상 새 탭
  const tmReuse = new TabManager();
  const targetX = { path: 'shared/tokens.css' };

  // 기존 탭 정책
  const r1 = tmReuse.openTab({ kind: 'doc', resource: targetX, duplicatePolicy: DUPLICATE_POLICY.REUSE_EXISTING });
  const r2 = tmReuse.openTab({ kind: 'doc', resource: targetX, duplicatePolicy: DUPLICATE_POLICY.REUSE_EXISTING });
  assert.strictEqual(r1.isNew, true);
  assert.strictEqual(r2.isNew, false);
  assert.strictEqual(tmReuse.getAllTabs().length, 1);

  // 항상 새 탭 정책
  const tmNew = new TabManager();
  const n1 = tmNew.openTab({ kind: 'doc', resource: targetX, duplicatePolicy: DUPLICATE_POLICY.ALWAYS_NEW });
  const n2 = tmNew.openTab({ kind: 'doc', resource: targetX, duplicatePolicy: DUPLICATE_POLICY.ALWAYS_NEW });
  assert.strictEqual(n1.isNew, true);
  assert.strictEqual(n2.isNew, true);
  assert.strictEqual(tmNew.getAllTabs().length, 2);

  // 4-2. 가른 상태에서 판정 범위 (조각 vs 패널/워크스페이스)
  const tmSplit = new TabManager();
  // pane 1에 탭 열기
  const pane1Tab = tmSplit.openTab({ kind: 'doc', resource: targetX, paneId: 'pane-1' }).tab;
  assert.strictEqual(tmSplit.getAllTabs().length, 1);

  // pane 2에서 같은 리소스 열기: scope='pane' (조각 범위)
  const scopePaneRes = tmSplit.openTab({
    kind: 'doc',
    resource: targetX,
    paneId: 'pane-2',
    duplicatePolicy: { mode: DUPLICATE_POLICY.REUSE_EXISTING, scope: 'pane' }
  });
  // 조각 안에서는 중복이 없으므로 새 탭 생성 -> 총 2개
  assert.strictEqual(scopePaneRes.isNew, true);
  assert.strictEqual(tmSplit.getAllTabs().length, 2);

  // pane 3에서 같은 리소스 열기: scope='workspace' (패널/워크스페이스 전체 범위)
  const scopeWorkspaceRes = tmSplit.openTab({
    kind: 'doc',
    resource: targetX,
    paneId: 'pane-3',
    duplicatePolicy: { mode: DUPLICATE_POLICY.REUSE_EXISTING, scope: 'workspace' }
  });
  // 워크스페이스 전체에서 이미 열린 탭을 찾아 재사용 -> 새 탭 없음 -> 총 2개 유지
  assert.strictEqual(scopeWorkspaceRes.isNew, false);
  assert.strictEqual(scopeWorkspaceRes.tab.id, pane1Tab.id);
  assert.strictEqual(tmSplit.getAllTabs().length, 2);

  // 5. TE-027: 여는 경로 자리 (FR-9)
  // 트리를 거치지 않고 + 버튼/단축키 등으로 여는 경로 등록
  let treeCursorPosition = 5; // 트리 커서 상태 시뮬레이션
  slots.registerOpenRoute('plus_button_new_tab', (tabMgr, options) => {
    return tabMgr.openTab({
      kind: 'scratch_pad',
      title: options.title || 'Untitled',
      resource: { uuid: options.uuid || Date.now() },
      duplicatePolicy: DUPLICATE_POLICY.ALWAYS_NEW
    });
  });

  const tmRoute = new TabManager();
  const routeRes = slots.executeOpenRoute('plus_button_new_tab', tmRoute, { title: 'Quick Note', uuid: 'unique-1' });
  assert.ok(routeRes.tab);
  assert.strictEqual(routeRes.tab.title, 'Quick Note');

  // 트리를 거치지 않고 열어도 트리 커서가 움직이지 않음 (FR-19)
  assert.strictEqual(treeCursorPosition, 5);

  // 트리를 거치지 않고 연 탭도 고정, 반대쪽 이동, 닫기가 일반 탭과 동일하게 동작
  tmRoute.pinTab(routeRes.tab.id);
  assert.strictEqual(routeRes.tab.pinned, true);

  tmRoute.moveTabToPane(routeRes.tab.id, 'split_pane');
  assert.strictEqual(routeRes.tab.paneId, 'split_pane');

  const closeRes = tmRoute.closeTab(routeRes.tab.id);
  assert.strictEqual(closeRes.closedTab.id, routeRes.tab.id);
  assert.strictEqual(tmRoute.getAllTabs().length, 0);

  // 6. TE-028: 임의의 새 종류 붙이기 종합 검증 (FR-10)
  // 껍데기 코드 수정 0줄로 임의의 새 종류(arbitrary_spectrogram_xyz) 붙이기
  const unknownKind = 'arbitrary_spectrogram_xyz';
  let spectrogramViewCreated = false;

  class SpectrogramView {
    constructor(container, tab) {
      spectrogramViewCreated = true;
      this.tab = tab;
      this.active = false;
    }
    mount() {}
    activate() { this.active = true; }
    deactivate() { this.active = false; }
    destroy() {}
  }

  // 다섯 자리를 통해 등록
  slots.registerViewProvider(unknownKind, (c, t) => new SpectrogramView(c, t));
  slots.registerDuplicatePolicy(unknownKind, DUPLICATE_POLICY.REUSE_EXISTING);

  const tmUnknown = new TabManager();
  const vmUnknown = new ViewManager({
    tabManager: tmUnknown,
    providerResolver: (k) => slots.getViewProvider(k)
  });

  // 열기
  const unkTab = tmUnknown.openTab({
    kind: unknownKind,
    title: 'Spectrogram 1',
    resource: { channel: 1, freq: 44100 },
    preview: true
  }).tab;

  vmUnknown.activateView(unkTab.id);
  assert.strictEqual(spectrogramViewCreated, true);
  assert.strictEqual(unkTab.preview, true);

  // 고정
  tmUnknown.pinTab(unkTab.id);
  assert.strictEqual(unkTab.pinned, true);
  assert.strictEqual(unkTab.preview, false);

  // 패널 이동
  tmUnknown.moveTabToPane(unkTab.id, 'right_pane');
  assert.strictEqual(unkTab.paneId, 'right_pane');

  // 닫기
  tmUnknown.closeTab(unkTab.id);
  assert.strictEqual(tmUnknown.getAllTabs().length, 0);

  console.log('All SlotRegistry tests passed successfully!');
}

run();
