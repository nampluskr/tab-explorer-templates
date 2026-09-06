// tests/test_presets.js — Phase 8 단위 테스트 (Node)
// 프리셋 둘과 참조 보기 둘을 판정한다 (TE-042 · TE-043 · TE-044, FR-32 · FR-33)
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const TabModel = require('../shell/tab_model.js');
const SlotRegistry = require('../shell/slot_registry.js');
const TreeExplorer = require('../shell/tree.js');

const { TabManager, KindRegistry } = TabModel;
const { TreeModel } = TreeExplorer;

const ROOT = path.join(__dirname, '..');

// 프리셋과 참조 보기를 브라우저와 같은 방식(전역 등록)으로 읽어 들인다
function loadPresets() {
  const scope = {};
  scope.PresetReferenceViews = {
    file: require('../presets/file/reference_view.js'),
    folder: require('../presets/folder/reference_view.js')
  };
  // preset.js는 root.PresetReferenceViews에서 자기 참조 보기를 찾는다.
  // Node에서는 module.exports 경로를 타므로 전역에 같은 이름으로 올려 준다.
  global.PresetReferenceViews = scope.PresetReferenceViews;

  return {
    file: require('../presets/file/preset.js'),
    folder: require('../presets/folder/preset.js')
  };
}

// 브릿지 흉내 — 읽기 요청 횟수를 센다 (FR-33 판정용)
class MockBridge {
  constructor(fsMap) {
    this.fsMap = fsMap;
    this.listCalls = [];
    this.readCalls = [];
  }

  async listDir(dirPath) {
    this.listCalls.push(dirPath);
    return { ok: true, entries: this.fsMap[dirPath] || [] };
  }

  async readFile(filePath) {
    this.readCalls.push(filePath);
    return { ok: true, content: 'SHOULD NOT BE READ' };
  }
}

// 보기를 붙일 최소 DOM 흉내
const fakeDocument = {
  createElement: (tagName) => createFakeElement(tagName)
};

function createFakeElement(tagName) {
  const doc = fakeDocument;
  const el = {
    tagName: String(tagName || 'div').toUpperCase(),
    style: {},
    className: '',
    textContent: '',
    children: [],
    parentNode: null,
    ownerDocument: doc,
    classList: {
      _set: new Set(),
      add(name) { this._set.add(name); },
      remove(name) { this._set.delete(name); },
      contains(name) { return this._set.has(name); }
    },
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      const i = this.children.indexOf(child);
      if (i >= 0) this.children.splice(i, 1);
      child.parentNode = null;
      return child;
    },
    withTag(tagName) {
      this.tagName = String(tagName).toUpperCase();
      return this;
    },
    // 자손을 훑어 텍스트를 모은다 (ViewManager가 만든 컨테이너가 섞여 들어와도 견딘다)
    collectText() {
      let out = this.textContent || '';
      for (const c of this.children || []) {
        out += typeof c.collectText === 'function'
          ? c.collectText()
          : (c.textContent || '') + (Array.isArray(c.children)
              ? c.children.map((g) => (g && g.textContent) || '').join('')
              : '');
      }
      return out;
    }
  };
  el.classList._set = new Set();
  return el;
}

const SAMPLE_ENTRIES = [
  { name: 'src', path: 'src', is_dir: true },
  { name: 'docs', path: 'docs', is_dir: true },
  { name: 'README.md', path: 'README.md', is_dir: false },
  { name: 'index.js', path: 'index.js', is_dir: false }
];

function run() {
  console.log('Running Preset tests (Phase 8)...');
  const presets = loadPresets();

  // ---------------------------------------------------------------
  // TE-042. 파일 프리셋 (FR-32)
  // ---------------------------------------------------------------

  // 트리 항목 — 파일과 폴더를 모두 표시한다
  const fileSlots = new SlotRegistry();
  presets.file.install(fileSlots);

  const fileTreeItems = fileSlots.filterTreeItems(SAMPLE_ENTRIES);
  assert.strictEqual(fileTreeItems.length, 4, '파일 프리셋은 파일과 폴더를 모두 표시한다');
  assert.deepStrictEqual(
    fileTreeItems.map((e) => e.name),
    ['src', 'docs', 'README.md', 'index.js']
  );

  // 행 선택 매핑 — 파일 행 → 파일 탭, 폴더 행은 열지 않음
  const fileRowMapped = fileSlots.mapRowSelection({ name: 'README.md', path: 'README.md', is_dir: false });
  assert.deepStrictEqual(fileRowMapped, {
    kind: 'file',
    resource: { path: 'README.md' },
    title: 'README.md'
  }, '파일 행은 파일 탭으로 매핑된다');
  assert.strictEqual(
    fileSlots.mapRowSelection({ name: 'src', path: 'src', is_dir: true }),
    null,
    '파일 프리셋에서 폴더 행은 열지 않는다'
  );

  // 중복 정책 — 같은 주소면 기존 탭, 판정 범위는 조각 안
  const filePolicy = fileSlots.getDuplicatePolicy('file');
  assert.strictEqual(filePolicy.mode, 'reuse_existing');
  assert.strictEqual(filePolicy.scope, 'pane', '파일 프리셋은 조각 안에서 중복을 판정한다');

  // ---------------------------------------------------------------
  // TE-043. 폴더 프리셋 (FR-32)
  // ---------------------------------------------------------------

  const folderSlots = new SlotRegistry();
  presets.folder.install(folderSlots);

  // 트리 항목 — 폴더만 표시하고 파일 행이 0건이다
  const folderTreeItems = folderSlots.filterTreeItems(SAMPLE_ENTRIES);
  assert.strictEqual(folderTreeItems.length, 2, '폴더 프리셋은 폴더만 표시한다');
  assert.strictEqual(
    folderTreeItems.filter((e) => !e.is_dir).length,
    0,
    '폴더 프리셋에서 파일 행은 0건이다'
  );

  // 행 선택 매핑 — 폴더 행 → 폴더 탭, 파일 행은 열지 않음
  assert.deepStrictEqual(
    folderSlots.mapRowSelection({ name: 'src', path: 'src', is_dir: true }),
    { kind: 'folder', resource: { path: 'src' }, title: 'src' },
    '폴더 행은 폴더 탭으로 매핑된다'
  );
  assert.strictEqual(
    folderSlots.mapRowSelection({ name: 'README.md', path: 'README.md', is_dir: false }),
    null,
    '폴더 프리셋에서 파일 행은 열지 않는다'
  );

  // 중복 정책 — 판정 범위가 패널 안이다
  const folderPolicy = folderSlots.getDuplicatePolicy('folder');
  assert.strictEqual(folderPolicy.mode, 'reuse_existing');
  assert.strictEqual(folderPolicy.scope, 'panel', '폴더 프리셋은 패널 안에서 중복을 판정한다');

  // 두 프리셋의 판정 범위가 실제로 다른 결과를 낸다 (가른 상태에서).
  // 정책을 손으로 넣지 않고, 프리셋이 자리에 등록한 값이 껍데기의 어댑터를 거쳐
  // TabManager까지 닿는지를 그대로 판정한다 (FR-8 배선).
  function openTwiceAcrossPanes(preset, kind) {
    const slots = new SlotRegistry();
    preset.install(slots);
    const registry = SlotRegistry.createSlotBackedRegistry(slots, new KindRegistry());
    const tm = new TabManager(registry);
    tm.openTab({ kind: kind, resource: { path: 'same' }, paneId: 'main', title: 'same' });
    const second = tm.openTab({ kind: kind, resource: { path: 'same' }, paneId: 'pane-1', title: 'same' });
    return { isNew: second.isNew, total: tm.getAllTabs().length };
  }
  const paneScoped = openTwiceAcrossPanes(presets.file, 'file');
  const panelScoped = openTwiceAcrossPanes(presets.folder, 'folder');
  assert.strictEqual(paneScoped.isNew, true, '파일 프리셋(조각 판정)은 반대쪽 조각에 새 탭을 만든다');
  assert.strictEqual(paneScoped.total, 2);
  assert.strictEqual(panelScoped.isNew, false, '폴더 프리셋(패널 판정)은 반대쪽 조각의 기존 탭을 쓴다');
  assert.strictEqual(panelScoped.total, 1);

  // 어댑터가 없으면 자리에 넣은 정책이 닿지 않는다 — 위 판정이 배선을 실제로 탄다는 근거
  const bareSlots = new SlotRegistry();
  presets.folder.install(bareSlots);
  const bareTm = new TabManager(new KindRegistry());
  bareTm.openTab({ kind: 'folder', resource: { path: 'same' }, paneId: 'main', title: 'same' });
  const bareSecond = bareTm.openTab({ kind: 'folder', resource: { path: 'same' }, paneId: 'pane-1', title: 'same' });
  assert.strictEqual(
    bareSecond.isNew,
    true,
    '어댑터를 빼면 패널 판정이 닿지 않아 결과가 달라진다 (배선이 실제로 작동한다는 증거)'
  );

  // ---------------------------------------------------------------
  // 프리셋 교체 시 껍데기 코드 변경 줄 수가 0 (FR-32)
  // ---------------------------------------------------------------

  // 껍데기는 프리셋 이름도 종류 이름도 갖지 않는다.
  // shell/ 아래 전 파일을 훑는다 — index.html처럼 훑지 않던 파일에서 새어 나간 적이 있다.
  const shellFiles = fs.readdirSync(path.join(ROOT, 'shell'))
    .filter((f) => /\.(js|html|css)$/.test(f));
  assert(shellFiles.includes('index.html'), 'index.html도 검사 대상이다');
  for (const name of shellFiles) {
    const src = fs.readFileSync(path.join(ROOT, 'shell', name), 'utf8');
    for (const kindName of ['file', 'folder', 'terminal']) {
      const hits = src.match(new RegExp(`['"\`]${kindName}['"\`]`, 'gi')) || [];
      assert.strictEqual(
        hits.length,
        0,
        `shell/${name}에 종류 이름 문자열 '${kindName}'이 있으면 안 된다: ${hits}`
      );
    }
  }

  // 프리셋을 고르는 곳은 presets/active.js 한 곳뿐이고 shell/은 그 값을 갖지 않는다
  const activeSrc = fs.readFileSync(path.join(ROOT, 'presets', 'active.js'), 'utf8');
  assert(/ACTIVE_PRESET\s*=\s*'(file|folder)'/.test(activeSrc), 'active.js가 활성 프리셋을 고른다');
  const appSrc = fs.readFileSync(path.join(ROOT, 'shell', 'app.js'), 'utf8');
  assert(
    !/ACTIVE_PRESET\s*=\s*['"]/.test(appSrc),
    '껍데기는 어느 프리셋이 활성인지 정하지 않는다'
  );

  // 껍데기는 프리셋을 이름으로 부르지 않는다 — index.html이 거는 프리셋 소재는 한 곳뿐이다
  const indexSrc = fs.readFileSync(path.join(ROOT, 'shell', 'index.html'), 'utf8');
  const presetScripts = (indexSrc.match(/src="[^"]*presets\/[^"]*"/g) || []);
  assert.deepStrictEqual(
    presetScripts,
    ['src="../presets/active.js"'],
    '껍데기가 거는 프리셋 소재는 active.js 하나뿐이다 (경로에 종류 이름이 없다)'
  );

  // 프리셋 교체가 껍데기를 건드리지 않는다 — active.js를 실제로 뒤집어 shell/을 바이트 대조한다
  (function verifySwapTouchesNoShellCode() {
    const activePath = path.join(ROOT, 'presets', 'active.js');
    const original = fs.readFileSync(activePath, 'utf8');
    const currentId = /ACTIVE_PRESET\s*=\s*'(\w+)'/.exec(original)[1];
    const otherId = currentId === 'file' ? 'folder' : 'file';

    const shellDir = path.join(ROOT, 'shell');
    const snapshot = {};
    for (const f of fs.readdirSync(shellDir)) {
      const p = path.join(shellDir, f);
      if (fs.statSync(p).isFile()) snapshot[f] = fs.readFileSync(p);
    }

    try {
      fs.writeFileSync(
        activePath,
        original.replace(`ACTIVE_PRESET = '${currentId}'`, `ACTIVE_PRESET = '${otherId}'`),
        'utf8'
      );
      const swapped = fs.readFileSync(activePath, 'utf8');
      assert.strictEqual(
        /ACTIVE_PRESET\s*=\s*'(\w+)'/.exec(swapped)[1],
        otherId,
        '교체가 실제로 반영된다'
      );

      let changed = 0;
      for (const f of Object.keys(snapshot)) {
        if (!fs.readFileSync(path.join(shellDir, f)).equals(snapshot[f])) changed++;
      }
      assert.strictEqual(changed, 0, '프리셋을 바꿀 때 껍데기 코드의 변경 줄 수가 0이다');

      // 바뀐 이름표대로 다른 프리셋이 끼워진다 (껍데기의 installActivePreset이 하는 일)
      const swappedSlots = new SlotRegistry();
      presets[otherId].install(swappedSlots);
      const dirRow = { name: 'src', path: 'src', is_dir: true };
      const fileRow = { name: 'a.md', path: 'a.md', is_dir: false };
      if (otherId === 'folder') {
        assert.strictEqual(swappedSlots.mapRowSelection(fileRow), null);
        assert.strictEqual(swappedSlots.mapRowSelection(dirRow).kind, 'folder');
      } else {
        assert.strictEqual(swappedSlots.mapRowSelection(dirRow), null);
        assert.strictEqual(swappedSlots.mapRowSelection(fileRow).kind, 'file');
      }
    } finally {
      fs.writeFileSync(activePath, original, 'utf8');
    }
    assert.strictEqual(
      fs.readFileSync(activePath, 'utf8'),
      original,
      '시험이 active.js를 원래대로 되돌린다'
    );
  })();

  // active.js가 이름표에서 소재 경로를 만든다 — 껍데기가 아니라 여기가 프리셋을 안다
  assert(
    /'\.\.\/presets\/'\s*\+\s*ACTIVE_PRESET/.test(activeSrc),
    'active.js가 고른 이름표로 프리셋 소재 경로를 만든다'
  );
  for (const id of ['file', 'folder']) {
    assert(presets[id] && typeof presets[id].install === 'function', `${id} 프리셋이 카탈로그에 있다`);
  }

  // 참조 보기가 껍데기에 더한 스타일은 토큰만 쓴다 (FR-28, 제약 7)
  // 색 · 글꼴 · 간격 수치를 이번 버전에서 새로 정하지 않는다
  (function verifyReferenceViewUsesTokensOnly() {
    const cssSrc = fs.readFileSync(path.join(ROOT, 'shell', 'shell.css'), 'utf8');
    const blocks = cssSrc.match(/\.reference-view[^{]*\{[^}]*\}/g) || [];
    assert(blocks.length > 0, '참조 보기 스타일이 있다');

    const tokenSrc = fs.readFileSync(path.join(ROOT, 'shared', 'design', 'tokens.css'), 'utf8');
    for (const block of blocks) {
      const declarations = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'))
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean);
      for (const decl of declarations) {
        const [prop, rawValue] = decl.split(':').map((s) => s && s.trim());
        if (!prop || !rawValue) continue;
        if (!/[0-9]/.test(rawValue)) continue; // 키워드 값은 대상이 아니다
        // FR-28이 토큰을 요구하는 것은 색 값 · 글꼴 이름 · 간격 수치다.
        // font-weight는 그 셋 중 어디에도 들지 않고 토큰도 없으며, 껍데기 전체가
        // 600 하나로 통일돼 있어 대상에서 뺀다.
        if (prop === 'font-weight') continue;
        const tokenNames = rawValue.match(/var\(\s*(--[\w-]+)\s*\)/g) || [];
        assert(
          tokenNames.length > 0,
          `참조 보기 스타일의 '${prop}: ${rawValue}'가 토큰을 거치지 않는다 (FR-28)`
        );
        for (const ref of tokenNames) {
          const name = /(--[\w-]+)/.exec(ref)[1];
          assert(
            tokenSrc.includes(name + ':'),
            `토큰 ${name}이 tokens.css에 없다 — 새로 정한 값이면 안 된다 (제약 7)`
          );
        }
      }
    }
  })();

  // 두 프리셋이 갈아끼우는 자리 밖의 껍데기 코드를 각자 갖고 있지 않다
  for (const presetId of ['file', 'folder']) {
    const src = fs.readFileSync(path.join(ROOT, 'presets', presetId, 'preset.js'), 'utf8');
    for (const forbidden of ['document.getElementById', 'renderShell', 'renderEditor', 'renderTree', 'addEventListener']) {
      assert(
        !src.includes(forbidden),
        `presets/${presetId}/preset.js가 껍데기 코드(${forbidden})를 갖고 있으면 안 된다`
      );
    }
  }

  // ---------------------------------------------------------------
  // 껍데기 배선 — 행 선택 매핑 자리가 실제로 불린다 (FR-6)
  // ---------------------------------------------------------------

  (async () => {
    // 파일 프리셋: 트리에서 파일 행을 고르면 파일 탭이 열리고, 폴더 행은 열리지 않는다
    const bridgeA = new MockBridge({ '': SAMPLE_ENTRIES, 'src': [] });
    const slotsA = new SlotRegistry();
    presets.file.install(slotsA);
    const tmA = new TabManager(new KindRegistry());
    const treeA = new TreeModel({ bridge: bridgeA, tabManager: tmA, slots: slotsA });
    await treeA.setRoot('D:\\workspace');

    treeA.openRowTab({ name: 'src', path: 'src', is_dir: true }, true);
    assert.strictEqual(tmA.getAllTabs().length, 0, '파일 프리셋에서 폴더 행은 탭을 열지 않는다');

    treeA.openRowTab({ name: 'README.md', path: 'README.md', is_dir: false }, true);
    assert.strictEqual(tmA.getAllTabs().length, 1, '파일 프리셋에서 파일 행은 탭을 연다');
    assert.strictEqual(tmA.getAllTabs()[0].kind, 'file');

    // 폴더 프리셋: 정확히 반대로 동작한다 (껍데기 코드는 그대로)
    const bridgeB = new MockBridge({ '': SAMPLE_ENTRIES, 'src': [] });
    const slotsB = new SlotRegistry();
    presets.folder.install(slotsB);
    const tmB = new TabManager(new KindRegistry());
    const treeB = new TreeModel({ bridge: bridgeB, tabManager: tmB, slots: slotsB });
    await treeB.setRoot('D:\\workspace');

    treeB.openRowTab({ name: 'README.md', path: 'README.md', is_dir: false }, true);
    assert.strictEqual(tmB.getAllTabs().length, 0, '폴더 프리셋에서 파일 행은 탭을 열지 않는다');

    treeB.openRowTab({ name: 'src', path: 'src', is_dir: true }, true);
    assert.strictEqual(tmB.getAllTabs().length, 1, '폴더 프리셋에서 폴더 행은 탭을 연다');
    assert.strictEqual(tmB.getAllTabs()[0].kind, 'folder');

    // 트리 항목 자리도 배선되어 있다 — 폴더 프리셋의 트리에 파일 행이 0건이다
    const visibleB = treeB.getVisibleRows().filter((r) => !r.isRoot);
    assert.strictEqual(
      visibleB.filter((r) => !r.is_dir).length,
      0,
      '폴더 프리셋의 트리에 파일 행이 0건이다'
    );

    // -------------------------------------------------------------
    // TE-044. 참조 보기 둘 (FR-33)
    // -------------------------------------------------------------

    // 파일 참조 보기 — 이름만 출력하고 내용을 읽는 요청을 한 번도 하지 않는다
    const fileProvider = slotsA.getViewProvider('file');
    assert(fileProvider, '파일 프리셋이 참조 보기를 보기 제공자 자리에 얹는다');

    const fileContainer = createFakeElement();
    const fileTab = { id: 't1', kind: 'file', title: 'README.md', resource: { path: 'D:\\workspace\\README.md' } };
    const fileView = fileProvider.createView(fileContainer, fileTab);
    fileView.mount(fileContainer, { tab: fileTab });

    const fileText = fileContainer.collectText();
    assert.strictEqual(fileText, 'README.md', '파일 참조 보기는 이름만 출력한다');
    assert(!fileText.includes('SHOULD NOT BE READ'), '파일 참조 보기는 내용을 출력하지 않는다');

    // 읽기 통로를 전역에 깔아 두고 손대는지 본다.
    // (bridgeA를 세는 것만으로는 보기가 그것을 쥔 적이 없어 언제나 참이 되는 단언이었다)
    const globalProbe = { readFile: 0, listDir: 0, fetch: 0 };
    const priorBridge = global.bridge;
    const priorFetch = global.fetch;
    global.bridge = {
      readFile: () => { globalProbe.readFile++; return Promise.resolve({ ok: true, content: 'LEAK' }); },
      listDir: () => { globalProbe.listDir++; return Promise.resolve({ ok: true, entries: [] }); }
    };
    global.fetch = () => { globalProbe.fetch++; return Promise.resolve({ text: () => Promise.resolve('LEAK') }); };
    try {
      const probeContainer = createFakeElement();
      const probeView = fileProvider.createView(probeContainer, fileTab);
      probeView.mount(probeContainer, { tab: fileTab });
      probeView.activate();
      probeView.resize();
      probeView.destroy();
    } finally {
      global.bridge = priorBridge;
      global.fetch = priorFetch;
    }
    assert.deepStrictEqual(
      globalProbe,
      { readFile: 0, listDir: 0, fetch: 0 },
      '파일 참조 보기는 수명주기 전 구간에서 내용을 읽는 요청을 한 번도 하지 않는다'
    );
    assert.strictEqual(bridgeA.readCalls.length, 0, '트리에 물린 브릿지에도 읽기 요청이 없다');

    // 수명주기 통보가 계약대로 받아진다
    fileView.activate();
    assert(fileContainer.children[0].classList.contains('active'));
    fileView.deactivate();
    assert(!fileContainer.children[0].classList.contains('active'));
    fileView.resize();
    fileView.destroy();
    assert.strictEqual(fileContainer.children.length, 0, '폐기하면 화면에서 사라진다');

    // 폐기 뒤에 화면을 고치려 하지 않는다
    fileView.mount(fileContainer, { tab: fileTab });
    assert.strictEqual(fileContainer.children.length, 0, '폐기 뒤 mount는 아무것도 하지 않는다');

    // 폴더 참조 보기 — 주소만 표시한다
    const folderProvider = slotsB.getViewProvider('folder');
    assert(folderProvider, '폴더 프리셋이 참조 보기를 보기 제공자 자리에 얹는다');

    const folderContainer = createFakeElement();
    const folderTab = { id: 't2', kind: 'folder', title: 'src', resource: { path: 'D:\\workspace\\src' } };
    const folderView = folderProvider.createView(folderContainer, folderTab);
    folderView.mount(folderContainer, { tab: folderTab });

    assert.strictEqual(
      folderContainer.collectText(),
      'D:\\workspace\\src',
      '폴더 참조 보기는 주소만 표시한다'
    );
    assert.strictEqual(bridgeB.readCalls.length, 0, '폴더 참조 보기는 내용을 읽는 요청을 하지 않는다');
    folderView.destroy();

    // 참조 보기를 다른 것으로 바꿀 때 껍데기 코드 변경 줄 수가 0 (FR-33)
    // 파일을 대조하는 대신, 껍데기가 보기를 찾는 그 경로(ViewManager의 providerResolver)로
    // 실제로 갈아끼운 보기가 화면에 나오는지를 판정한다.
    const ViewLifecycle = require('../shell/view_lifecycle.js');
    // ViewManager가 자기 컨테이너를 만들 때 쓰는 document를 흉내로 물려 준다
    const priorDocument = global.document;
    global.document = fakeDocument;

    const swapTm = new TabManager(new KindRegistry());
    const swapViews = new ViewLifecycle.ViewManager({
      tabManager: swapTm,
      providerResolver: (kind) => slotsA.getViewProvider(kind)
    });

    const openedFile = swapTm.openTab({ kind: 'file', resource: { path: 'a.md' }, title: 'a.md' });
    const parentBefore = createFakeElement();
    swapViews.activateView(openedFile.tab.id, parentBefore);
    assert(
      parentBefore.collectText().includes('a.md'),
      '갈아끼우기 전에는 프리셋의 참조 보기가 나온다'
    );

    let replacementMounted = 0;
    slotsA.registerViewProvider('file', {
      createView: () => ({
        mount: (el) => {
          replacementMounted++;
          const node = el.ownerDocument.createElement('div');
          node.textContent = 'REPLACED VIEW';
          el.appendChild(node);
        },
        activate: () => {},
        deactivate: () => {},
        resize: () => {},
        destroy: () => {}
      })
    });

    const openedAfter = swapTm.openTab({ kind: 'file', resource: { path: 'b.md' }, title: 'b.md' });
    const parentAfter = createFakeElement();
    swapViews.activateView(openedAfter.tab.id, parentAfter);
    assert.strictEqual(replacementMounted, 1, '갈아끼운 보기가 실제로 붙는다');
    assert(
      parentAfter.collectText().includes('REPLACED VIEW'),
      '껍데기를 고치지 않고 보기만 바꿔도 화면이 바뀐다'
    );
    global.document = priorDocument;

    // 참조 보기에 도메인 로직이 없다
    for (const presetId of ['file', 'folder']) {
      const src = fs.readFileSync(path.join(ROOT, 'presets', presetId, 'reference_view.js'), 'utf8');
      for (const forbidden of ['readFile', 'listDir', 'fetch(', 'bridge']) {
        assert(
          !src.includes(forbidden),
          `presets/${presetId}/reference_view.js가 읽기 통로(${forbidden})를 쓰면 안 된다`
        );
      }
    }

    console.log('All Preset tests (Phase 8) passed successfully!');
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

run();
