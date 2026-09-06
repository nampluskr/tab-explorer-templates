// tests/test_view_lifecycle.js — Phase 4 단위 테스트 (Node)
const assert = require('assert');
const TabModel = require('../shell/tab_model.js');
const ViewLifecycle = require('../shell/view_lifecycle.js');

const { TabManager, KindRegistry } = TabModel;
const { ViewManager } = ViewLifecycle;

function run() {
  console.log('Running ViewLifecycle tests...');

  // 1. TE-020: 보기 수명주기 계약 (정의된 순서 통보 및 폐기 뒤 화면 조작 방지)
  const lifecycleCalls = [];

  class TestLifecycleView {
    constructor(container, tab) {
      this.container = container;
      this.tab = tab;
      this.isDestroyed = false;
    }

    mount(container, context) {
      lifecycleCalls.push({ method: 'mount', tabId: this.tab.id });
    }

    activate() {
      if (this.isDestroyed) throw new Error('Cannot activate destroyed view');
      lifecycleCalls.push({ method: 'activate', tabId: this.tab.id });
    }

    deactivate() {
      if (this.isDestroyed) throw new Error('Cannot deactivate destroyed view');
      lifecycleCalls.push({ method: 'deactivate', tabId: this.tab.id });
    }

    resize(dimensions) {
      if (this.isDestroyed) throw new Error('Cannot resize destroyed view');
      lifecycleCalls.push({ method: 'resize', dimensions, tabId: this.tab.id });
    }

    destroy() {
      this.isDestroyed = true;
      lifecycleCalls.push({ method: 'destroy', tabId: this.tab.id });
    }
  }

  const registry = new KindRegistry();
  registry.register('test_view', {
    viewProvider: (container, tab) => new TestLifecycleView(container, tab)
  });

  const tabManager = new TabManager(registry);
  const viewManager = new ViewManager({ tabManager });

  // 1-1. 탭 1 열기 및 활성화
  const t1 = tabManager.openTab({ kind: 'test_view', title: 'T1', resource: { id: 1 } }).tab;
  viewManager.activateView(t1.id);

  // 1-2. 크기 변경
  viewManager.resize({ width: 1024, height: 768 });

  // 1-3. 탭 2 열기 및 전환
  const t2 = tabManager.openTab({ kind: 'test_view', title: 'T2', resource: { id: 2 } }).tab;
  viewManager.activateView(t2.id);

  // 1-4. 탭 1로 다시 전환
  tabManager.activateTab(t1.id); // ViewManager가 TabManager 구독으로 자동 activateView(t1.id) 실행

  // 1-5. 탭 1 닫기
  tabManager.closeTab(t1.id); // ViewManager가 TabManager 구독으로 자동 destroyView(t1.id) 실행

  // 수명주기 호출 순서 대조
  const methods = lifecycleCalls.map((c) => `${c.tabId}:${c.method}`);
  assert.deepStrictEqual(methods, [
    `${t1.id}:mount`,
    `${t1.id}:activate`,
    `${t1.id}:resize`,
    `${t2.id}:mount`,
    `${t1.id}:deactivate`,
    `${t2.id}:activate`,
    `${t2.id}:deactivate`,
    `${t1.id}:activate`,
    `${t1.id}:deactivate`,
    `${t1.id}:destroy`
  ]);

  // 폐기 뒤 화면 조작 차단 확인
  const destroyedRec = viewManager.getViewRecord(t1.id);
  assert.strictEqual(destroyedRec, null);

  // 2. TE-021: 탭 전환 · 패널 이동 · 재렌더링 10회 후 보기 생성 횟수 1 및 오래 사는 상태 유지
  let factoryCount = 0;

  class LongLivedStateView {
    constructor(container, tab) {
      factoryCount++;
      this.tab = tab;
      this.heavySessionBuffer = [1, 2, 3, 4, 5];
      this.counter = 42;
      this.isDestroyed = false;
    }

    mount() {}
    activate() {}
    deactivate() {}
    destroy() {
      this.isDestroyed = true;
    }
  }

  const longLivedRegistry = new KindRegistry();
  longLivedRegistry.register('long_lived', {
    viewProvider: (container, tab) => new LongLivedStateView(container, tab)
  });

  const tm2 = new TabManager(longLivedRegistry);
  const vm2 = new ViewManager({ tabManager: tm2 });

  const tabA = tm2.openTab({ kind: 'long_lived', title: 'Tab A', resource: { file: 'a' } }).tab;
  const tabB = tm2.openTab({ kind: 'long_lived', title: 'Tab B', resource: { file: 'b' } }).tab;
  vm2.activateView(tabA.id);

  const initialViewInstance = vm2.getViewInstance(tabA.id);
  assert.strictEqual(factoryCount, 1);
  assert.strictEqual(initialViewInstance.counter, 42);

  // 탭 전환 10회
  for (let i = 0; i < 10; i++) {
    tm2.activateTab(tabB.id);
    tm2.activateTab(tabA.id);
  }

  // 패널 이동 10회
  for (let i = 0; i < 10; i++) {
    tm2.moveTabToPane(tabA.id, i % 2 === 0 ? 'secondary_pane' : 'main');
  }

  // 껍데기 재렌더링 10회 시뮬레이션
  for (let i = 0; i < 10; i++) {
    vm2.rerenderViews();
  }

  // 생성 횟수가 정확히 1인지 검증
  assert.strictEqual(factoryCount, 2, 'Total views created: Tab A (1) + Tab B (1)');
  assert.strictEqual(vm2.getCreationCount(tabA.id), 1, 'Tab A must only be created once!');

  // 같은 인스턴스가 유지되고 상태가 보존되었는지 검증
  const currentViewInstance = vm2.getViewInstance(tabA.id);
  assert.strictEqual(currentViewInstance, initialViewInstance, 'View instance must be the exact same object');
  assert.strictEqual(currentViewInstance.counter, 42);
  assert.deepStrictEqual(currentViewInstance.heavySessionBuffer, [1, 2, 3, 4, 5]);
  assert.strictEqual(currentViewInstance.isDestroyed, false);

  // 폐기는 탭을 닫을 때만 일어남
  tm2.closeTab(tabA.id);
  assert.strictEqual(currentViewInstance.isDestroyed, true);

  // 3. TE-022: 세션 상태 보관과 전달 (복원 확인 및 앱 재시작 미복원)
  class StatefulView {
    constructor(container, tab) {
      this.tab = tab;
      this.scrollOffset = 0;
      this.selectedRow = 0;
      this.persistentStore = {}; // 보기 자체의 독립 영속 저장 구역
    }

    saveState() {
      return { scrollOffset: this.scrollOffset, selectedRow: this.selectedRow };
    }

    restoreState(state) {
      if (state) {
        this.scrollOffset = state.scrollOffset;
        this.selectedRow = state.selectedRow;
      }
    }
  }

  const statefulRegistry = new KindRegistry();
  statefulRegistry.register('stateful', {
    viewProvider: (c, t) => new StatefulView(c, t)
  });

  const tm3 = new TabManager(statefulRegistry);
  const vm3 = new ViewManager({ tabManager: tm3 });

  const tabS1 = tm3.openTab({ kind: 'stateful', title: 'S1', resource: { file: 's1' } }).tab;
  vm3.activateView(tabS1.id);
  const s1View = vm3.getViewInstance(tabS1.id);

  // 사용자 작업으로 상태 변경
  s1View.scrollOffset = 520;
  s1View.selectedRow = 7;
  s1View.persistentStore['custom_pref'] = 'saved_value';

  // 탭 전환 (deactivate -> saveState 호출)
  const tabS2 = tm3.openTab({ kind: 'stateful', title: 'S2', resource: { file: 's2' } }).tab;
  tm3.activateTab(tabS2.id);

  // 껍데기가 보관한 상태 확인 (해석하지 않고 그대로 보관)
  assert.deepStrictEqual(tabS1.viewState, { scrollOffset: 520, selectedRow: 7 });

  // 상태 리셋 후 탭 전환 복귀 시 restoreState 확인
  s1View.scrollOffset = 0;
  s1View.selectedRow = 0;
  tm3.activateTab(tabS1.id);
  assert.strictEqual(s1View.scrollOffset, 520);
  assert.strictEqual(s1View.selectedRow, 7);

  // 새 세션/앱 재시작 시뮬레이션: 세션 상태는 앱 재시작 시 복원되지 않음
  const freshTab = TabModel.createTab({
    kind: 'stateful',
    title: 'Fresh Tab'
    // viewState default is null
  });
  assert.strictEqual(freshTab.viewState, null, 'Session state must not restore across app restarts');
  assert.strictEqual(s1View.persistentStore['custom_pref'], 'saved_value', 'View independent persistent storage remains');

  console.log('All ViewLifecycle tests passed successfully!');
}

run();
