// tests/test_tab_model.js — Phase 3 단위 테스트 (Node)
const assert = require('assert');
const TabModel = require('../shell/tab_model.js');
const {
  generateTabId,
  createTab,
  KindRegistry,
  TabManager,
  DUPLICATE_POLICY,
  serializeResources,
  deserializeResources
} = TabModel;

function run() {
  console.log('Running TabModel tests...');

  // 1. TE-016: 탭 모델 4요소 (종류 · 식별값 · 대상 설명 · 보기 상태)
  const tab1 = createTab({
    kind: 'custom_graph',
    title: 'Graph 1',
    resource: { nodeCount: 10, source: 'network.json' },
    viewState: { zoom: 1.5, scrollX: 100 }
  });
  assert.strictEqual(typeof tab1.id, 'string', 'tab.id must be a string');
  assert.strictEqual(tab1.kind, 'custom_graph', 'tab.kind must match');
  assert.deepStrictEqual(tab1.resource, { nodeCount: 10, source: 'network.json' }, 'tab.resource must match');
  assert.deepStrictEqual(tab1.viewState, { zoom: 1.5, scrollX: 100 }, 'tab.viewState must match');

  // 2. TE-016: 껍데기에 없던 임의의 종류 문자열 등록 시험 (껍데기 코드 수정 없이 통과)
  const registry = new KindRegistry();
  const arbitraryKind = 'completely_new_kind_xyz_999';
  registry.register(arbitraryKind, {
    duplicatePolicy: DUPLICATE_POLICY.REUSE_EXISTING
  });
  assert.strictEqual(registry.has(arbitraryKind), true);

  const manager = new TabManager(registry);
  const openRes = manager.openTab({
    kind: arbitraryKind,
    title: 'Arbitrary View',
    resource: { key: 'value' }
  });
  assert.strictEqual(openRes.isNew, true);
  assert.strictEqual(openRes.tab.kind, arbitraryKind);
  assert.strictEqual(manager.getAllTabs().length, 1);

  // 3. TE-017: 탭 식별값과 대상 주소 분리 (주소를 탭 식별값으로 그대로 쓰는 곳 0건)
  const targetAddress = 'C:/projects/tab_explorer/data/sample.dat';
  const tabWithAddress = manager.openTab({
    kind: 'sample_data',
    resource: { path: targetAddress, address: targetAddress }
  });
  assert.notStrictEqual(tabWithAddress.tab.id, targetAddress, 'tab.id must NEVER be the resource address');
  assert.notStrictEqual(tabWithAddress.tab.id, tabWithAddress.tab.resource.path);
  assert.ok(tabWithAddress.tab.id.startsWith('tab-'), 'tab.id should have generated prefix');

  // 4. TE-017: 같은 대상을 두 번 여는 시험 (중복 정책: 기존 탭이면 1, 항상 새 탭이면 2, 식별값 상이)
  const testManager = new TabManager();

  // 4-1. 중복 정책: 기존 탭 (REUSE_EXISTING)
  const targetA = { path: 'module/alpha.bin' };
  const res1 = testManager.openTab({
    kind: 'binary_view',
    title: 'Alpha',
    resource: targetA,
    duplicatePolicy: DUPLICATE_POLICY.REUSE_EXISTING
  });
  assert.strictEqual(res1.isNew, true);
  assert.strictEqual(testManager.getAllTabs().length, 1);

  const res2 = testManager.openTab({
    kind: 'binary_view',
    title: 'Alpha',
    resource: targetA,
    duplicatePolicy: DUPLICATE_POLICY.REUSE_EXISTING
  });
  assert.strictEqual(res2.isNew, false);
  assert.strictEqual(res2.tab.id, res1.tab.id);
  assert.strictEqual(testManager.getAllTabs().length, 1, 'Tab count must remain 1 for reuse_existing');

  // 4-2. 중복 정책: 항상 새 탭 (ALWAYS_NEW)
  const targetB = { endpoint: 'ws://localhost:8080' };
  const res3 = testManager.openTab({
    kind: 'stream_session',
    title: 'Session 1',
    resource: targetB,
    duplicatePolicy: DUPLICATE_POLICY.ALWAYS_NEW
  });
  assert.strictEqual(res3.isNew, true);
  assert.strictEqual(testManager.getAllTabs().length, 2);

  const res4 = testManager.openTab({
    kind: 'stream_session',
    title: 'Session 2',
    resource: targetB,
    duplicatePolicy: DUPLICATE_POLICY.ALWAYS_NEW
  });
  assert.strictEqual(res4.isNew, true);
  assert.strictEqual(testManager.getAllTabs().length, 3);
  assert.notStrictEqual(res3.tab.id, res4.tab.id, 'New tabs must have distinct IDs');

  // 5. TE-018: 대상 설명의 직렬화 왕복 (손실 없이 통과)
  const allTabs = testManager.getAllTabs();
  const jsonStr = serializeResources(allTabs);
  assert.strictEqual(typeof jsonStr, 'string');
  const restored = deserializeResources(jsonStr);
  assert.strictEqual(restored.length, allTabs.length);
  for (let i = 0; i < allTabs.length; i++) {
    assert.strictEqual(restored[i].id, allTabs[i].id);
    assert.strictEqual(restored[i].kind, allTabs[i].kind);
    assert.strictEqual(restored[i].title, allTabs[i].title);
    assert.deepStrictEqual(restored[i].resource, allTabs[i].resource);
  }

  // 6. TE-019: 종류를 모르는 열기 · 닫기 · 이동 경로
  const opManager = new TabManager();
  const t1 = opManager.openTab({ kind: 'kind_a', title: 'A', resource: { id: 1 } }).tab;
  const t2 = opManager.openTab({ kind: 'kind_b', title: 'B', resource: { id: 2 } }).tab;
  assert.strictEqual(opManager.getActiveTab().id, t2.id);

  // 전환
  opManager.activateTab(t1.id);
  assert.strictEqual(opManager.getActiveTab().id, t1.id);

  // 패널 이동
  opManager.moveTabToPane(t1.id, 'secondary_pane');
  assert.strictEqual(t1.paneId, 'secondary_pane');
  assert.strictEqual(opManager.getTabsByPane('secondary_pane').length, 1);
  assert.strictEqual(opManager.getTabsByPane('main').length, 1);

  // 닫기
  const closeRes = opManager.closeTab(t2.id);
  assert.strictEqual(closeRes.closedTab.id, t2.id);
  assert.strictEqual(opManager.getTabsByPane('main').length, 0);

  console.log('All TabModel tests passed successfully!');
}

run();
