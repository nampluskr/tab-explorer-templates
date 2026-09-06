// tests/test_tree.js — 탐색기 및 트리 모델/동작 테스트 (Phase 6, TE-029 ~ TE-034)
const assert = require('assert');
const path = require('path');
const fs = require('fs');

const { TreeModel, renderTreeHtml, escapeHtml, getBaseName, getParentPath } = require('../shell/tree.js');
const { KindRegistry, TabManager } = require('../shell/tab_model.js');
const SlotRegistry = require('../shell/slot_registry.js');

console.log('--- Phase 6: Tree and Explorer Unit Tests ---');

// Mock Bridge for tests
class MockBridge {
  constructor(fsStructure = {}) {
    this.fsStructure = fsStructure; // path -> Array<entry>
    this.callLog = [];
  }

  async set_root(rootPath) {
    this.callLog.push({ method: 'set_root', path: rootPath });
    return { ok: true, value: rootPath };
  }

  async list_children(subpath) {
    this.callLog.push({ method: 'list_children', path: subpath });
    const items = this.fsStructure[subpath] || [];
    return { ok: true, value: items };
  }

  async choose_root() {
    this.callLog.push({ method: 'choose_root' });
    return { ok: true, value: 'D:\\mock\\workspace' };
  }
}

// -------------------------------------------------------------
// 1. TE-029: 탐색기 머리글과 폭 조절 (FR-14, FR-15)
// -------------------------------------------------------------
console.log('1. TE-029: Explorer header and resize logic');

// 머리글 마크업 검증: EXPLORER 텍스트와 3개 버튼 존재, 더보기 버튼 부재
const appJsSource = fs.readFileSync(path.join(__dirname, '../shell/app.js'), 'utf-8');
assert(appJsSource.includes('EXPLORER'), 'Header must contain EXPLORER label');
assert(appJsSource.includes('id="btn-folder-open"'), 'Header must contain btn-folder-open');
assert(appJsSource.includes('id="btn-tree-refresh"'), 'Header must contain btn-tree-refresh');
assert(appJsSource.includes('id="btn-collapse-all"'), 'Header must contain btn-collapse-all');
assert(!appJsSource.includes('더보기') && !appJsSource.includes('btn-more'), 'Header must NOT contain more button');

// 폭 조절 및 최소 폭 140px 보장 로직
assert(appJsSource.includes('Math.max(140'), 'Resize splitter must clamp width to at least 140px');

// 접힘 시 CSS 검증 (shell.css)
const cssSource = fs.readFileSync(path.join(__dirname, '../shell/shell.css'), 'utf-8');
assert(cssSource.includes('.sidebar.collapsed'), 'shell.css must define collapsed sidebar');
assert(cssSource.includes('.sidebar.collapsed + .splitter'), 'shell.css must hide splitter when collapsed');
console.log('  -> TE-029 passed');

// -------------------------------------------------------------
// 2. TE-030: 트리 겉모습과 정렬 (FR-16 아홉 항목)
// -------------------------------------------------------------
console.log('2. TE-030: Tree visual appearance and alignment');

// FR-16 1~9항목 CSS 및 렌더러 검증
assert(cssSource.includes('--tree-row-height'), 'Row height token must be used');
assert(cssSource.includes('--tree-indent'), 'Indent token must be used');
assert(cssSource.includes('.twistie::before'), '5x5 twistie styling must be present');
assert(cssSource.includes('transform: rotate(45deg)'), 'Twistie rotation must be present for expanded');
assert(cssSource.includes('visibility: hidden'), 'Twistie must be hidden for leaf items');
assert(cssSource.includes('outline: 1px solid var(--color-focus-ring)'), 'Focus ring must be drawn inside on tree focus');
assert(cssSource.includes('text-overflow: ellipsis'), 'Label must truncate with ellipsis on overflow');
assert(cssSource.includes('color: var(--color-muted)'), 'Leaf item text must use muted color');

// HTML 이스케이프 및 특수문자 미해석 (항목 5)
const escaped = escapeHtml('<script>&"test"</script>');
assert.strictEqual(escaped, '&lt;script&gt;&amp;&quot;test&quot;&lt;/script&gt;', 'HTML chars must be escaped');

// 렌더링 결과 확인
const mockFs = {
  '': [
    { name: 'docs', path: 'docs', is_dir: true },
    { name: 'README.md', path: 'README.md', is_dir: false },
    { name: 'very_long_name_exceeding_container_width_with_gyp_descenders.txt', path: 'long.txt', is_dir: false }
  ],
  'docs': [
    { name: 'spec.md', path: 'docs/spec.md', is_dir: false }
  ]
};

const bridge = new MockBridge(mockFs);
const tabRegistry = new KindRegistry();
const tabManager = new TabManager(tabRegistry);
const slots = new SlotRegistry();
const tree = new TreeModel({ bridge, tabManager, slots });

(async () => {
  await tree.setRoot('D:\\workspace');

  let html = renderTreeHtml(tree);
  assert(html.includes('data-path=""'), 'Root row must be rendered');
  assert(html.includes('data-path="docs"'), 'docs row must be rendered');
  assert(html.includes('data-path="README.md"'), 'README.md row must be rendered');
  assert(html.includes('class="tree-row directory'), 'Directory rows must have directory class');
  assert(html.includes('class="tree-row leaf'), 'Leaf rows must have leaf class');
  console.log('  -> TE-030 passed');

  // -------------------------------------------------------------
  // 3. TE-031: 트리 지연 로딩과 기억 (FR-17)
  // -------------------------------------------------------------
  console.log('3. TE-031: Tree lazy loading and cache memory');

  // 초기 루트 선택 직후: list_children은 오직 root('') 1회만 호출되어야 함
  const initialCalls = bridge.callLog.filter(c => c.method === 'list_children');
  assert.strictEqual(initialCalls.length, 1, 'Only root children must be fetched initially');
  assert.strictEqual(initialCalls[0].path, '', 'Initial read must be for root ("")');

  // 접혀있는 docs 폴더의 자식 읽기 요청은 아직 0건이어야 함
  assert(!bridge.callLog.some(c => c.path === 'docs'), 'Unexpanded docs must not trigger list_children');

  // 폴더 펼치기
  await tree.toggleExpand('docs');
  const docsCalls = bridge.callLog.filter(c => c.method === 'list_children' && c.path === 'docs');
  assert.strictEqual(docsCalls.length, 1, 'Expanding docs must trigger exactly 1 list_children');

  // 폴더 접었다가 다시 펼치기: 기억(캐시)을 사용하므로 추가 호출 0건이어야 함
  await tree.toggleExpand('docs'); // 접기
  assert(!tree.expanded.has('docs'), 'docs must be collapsed');
  await tree.toggleExpand('docs'); // 다시 펼치기
  assert(tree.expanded.has('docs'), 'docs must be expanded again');

  const docsCallsAfterToggle = bridge.callLog.filter(c => c.method === 'list_children' && c.path === 'docs');
  assert.strictEqual(docsCallsAfterToggle.length, 1, 'Re-expanding must NOT trigger list_children (cache reused)');

  // 새로 읽기(refresh): 기억을 버리고 다시 읽되, 펼침 상태(docs)는 유지되어야 함
  await tree.refresh();
  assert(tree.expanded.has('docs'), 'Expanded state must be preserved after refresh');
  const docsCallsAfterRefresh = bridge.callLog.filter(c => c.method === 'list_children' && c.path === 'docs');
  assert.strictEqual(docsCallsAfterRefresh.length, 2, 'Refresh must re-fetch children for expanded directories');

  console.log('  -> TE-031 passed');

  // -------------------------------------------------------------
  // 4. TE-032: 트리 탐색 키 여섯 가지 (FR-18)
  // -------------------------------------------------------------
  console.log('4. TE-032: Six keyboard navigation keys');

  // 초기 커서 설정 (Home 키 동작과 동일)
  await tree.handleKeyDown({ key: 'Home', preventDefault: () => {} });
  assert.strictEqual(tree.cursorPath, '', 'Home key must move cursor to top root row');

  // 방향키 아래(ArrowDown)로 10번 지나가기: 탭이 하나도 생기거나 바뀌지 않아야 함! (중요 판정 조건)
  const initialTabCount = tabManager.getAllTabs().length;
  for (let i = 0; i < 10; i++) {
    await tree.handleKeyDown({ key: 'ArrowDown', preventDefault: () => {} });
  }
  const tabCountAfterArrows = tabManager.getAllTabs().length;
  assert.strictEqual(tabCountAfterArrows, initialTabCount, 'ArrowDown must NOT create or change any tabs');

  // End 키: 맨 끝 행으로 이동 (탭 불변)
  await tree.handleKeyDown({ key: 'End', preventDefault: () => {} });
  const visibleRows = tree.getVisibleRows();
  assert.strictEqual(tree.cursorPath, visibleRows[visibleRows.length - 1].path, 'End key must move cursor to last visible row');
  assert.strictEqual(tabManager.getAllTabs().length, initialTabCount, 'End key must NOT create or change any tabs');

  // ArrowUp 키: 위로 이동
  const lastIndex = visibleRows.length - 1;
  await tree.handleKeyDown({ key: 'ArrowUp', preventDefault: () => {} });
  assert.strictEqual(tree.cursorPath, visibleRows[lastIndex - 1].path, 'ArrowUp must move cursor up 1 row');

  // Enter 키: 단말 행에서 누르면 탭 열림
  tree.setCursor('README.md');
  await tree.handleKeyDown({ key: 'Enter', preventDefault: () => {} });
  assert.strictEqual(tabManager.getAllTabs().length, 1, 'Enter on leaf item must open a tab');
  const openedTab = tabManager.getActiveTab();
  assert.strictEqual(openedTab.resource.path, 'README.md', 'Opened tab must match cursor item');

  // ArrowLeft / ArrowRight 키:
  // docs(폴더)로 커서 이동
  tree.setCursor('docs');
  // 이미 펼쳐진 상태에서 ArrowLeft 누르면 접혀야 함
  assert(tree.expanded.has('docs'), 'docs should currently be expanded');
  await tree.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
  assert(!tree.expanded.has('docs'), 'ArrowLeft on expanded dir must collapse it');

  // 접힌 상태에서 ArrowLeft 누르면 부모로 올라가야 함 (docs의 부모는 '')
  await tree.handleKeyDown({ key: 'ArrowLeft', preventDefault: () => {} });
  assert.strictEqual(tree.cursorPath, '', 'ArrowLeft on collapsed dir must jump to parent');

  // 다시 docs로 가서 ArrowRight 누르면 펼쳐져야 함
  tree.setCursor('docs');
  await tree.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} });
  assert(tree.expanded.has('docs'), 'ArrowRight on collapsed dir must expand it');

  console.log('  -> TE-032 passed');

  // -------------------------------------------------------------
  // 5. TE-033: 트리 커서와 활성 탭 분리 (FR-19)
  // -------------------------------------------------------------
  console.log('5. TE-033: Disconnection of tree cursor and active tab');

  // 두 번째 탭 열기 (long.txt)
  tree.openRowTab({ path: 'long.txt', name: 'long.txt', is_dir: false });
  assert.strictEqual(tabManager.getAllTabs().length, 2, 'Should have 2 open tabs');

  // 탭을 README.md로 전환
  const readmeTab = tabManager.getAllTabs().find(t => t.resource.path === 'README.md');
  tabManager.activateTab(readmeTab.id);
  assert.strictEqual(tabManager.getActiveTab().resource.path, 'README.md');

  // 탭을 바꿨어도 트리 커서는 docs에 그대로 남아 있어야 함 (FR-19)
  assert.strictEqual(tree.cursorPath, 'docs', 'Tree cursor must NOT follow tab changes');

  // 접힌 폴더를 만들고 탭 전환 시 저절로 펼쳐지지 않는지 확인
  tree.expanded.delete('docs');
  assert(!tree.expanded.has('docs'));
  tabManager.activateTab(tabManager.getAllTabs()[1].id);
  assert(!tree.expanded.has('docs'), 'Tab switch must NOT auto-expand collapsed folders');

  console.log('  -> TE-033 passed');

  console.log('\nAll Phase 6 Node unit tests passed successfully!');
})().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
