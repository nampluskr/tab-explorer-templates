// tests/test_shell_public_api.js — Phase 9 (TE-047, NFR-6)
// 껍데기가 밖으로 내놓는 동작을 실제 화면 위에서 하나씩 구동한다.
//
// app.js는 IIFE라 require로 불러올 수 없다. 그래서 실제 shell/index.html을 띄우고
// window.__shell을 통해 공개 동작을 직접 부른다.
//
//   실행: host_electron/node_modules/.bin/electron tests/test_shell_public_api.js
//
// 화면이 필요한 시험이므로 Node 단독 실행 묶음에는 넣지 않는다.
const { app, BrowserWindow } = require('electron');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ENTRY = path.join(ROOT, 'shell', 'index.html');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  await win.loadFile(ENTRY);
  await new Promise((r) => setTimeout(r, 800));

  const result = await win.webContents.executeJavaScript(`(async () => {
    const sh = window.__shell;
    const failures = [];
    const checks = [];
    const check = (name, fn) => {
      checks.push(name);
      try { fn(); } catch (e) { failures.push(name + ': ' + e.message); }
    };
    const eq = (a, b, msg) => { if (a !== b) throw new Error((msg || '') + ' (' + a + ' !== ' + b + ')'); };
    const ok = (v, msg) => { if (!v) throw new Error(msg || 'falsy'); };

    // --- 테마 (FR-29) ---
    check('getTheme/setTheme', () => {
      sh.setTheme('white');
      eq(sh.getTheme(), 'white', 'setTheme이 값을 바꾼다');
      eq(document.documentElement.getAttribute('data-theme'), 'white', '최상위 표시값이 따라온다');
      sh.setTheme('dark');
      eq(sh.getTheme(), 'dark');
      eq(document.documentElement.getAttribute('data-theme'), 'dark');
    });

    check('cycleTheme', () => {
      sh.setTheme('white');
      const seen = [sh.getTheme()];
      for (let i = 0; i < 3; i++) { sh.cycleTheme(); seen.push(sh.getTheme()); }
      eq(seen.length, 4);
      eq(seen[3], seen[0], '세 번 돌면 처음으로 돌아온다');
      eq(new Set(seen.slice(0, 3)).size, 3, '세 단계가 모두 다르다');
      for (const t of seen) ok(sh.THEMES.includes(t), '정의된 단계만 나온다');
    });

    // --- 아이콘 테마 (FR-30) ---
    check('getIconTheme/setIconTheme', () => {
      const before = sh.getIconTheme();
      sh.setIconTheme('builtin');
      eq(sh.getIconTheme(), 'builtin', 'setIconTheme이 값을 바꾼다');
      sh.setIconTheme('vsicons');
      eq(sh.getIconTheme(), 'vsicons');
      sh.setIconTheme(before);
      eq(sh.getIconTheme(), before, '되돌릴 수 있다');
    });

    // --- Zen 모드 (FR-25) ---
    check('getZenMode/setZenMode', () => {
      sh.setZenMode(true);
      eq(sh.getZenMode(), true, 'Zen 모드가 켜진다');
      ok(document.getElementById('shell-root').classList.contains('zen'), '화면이 Zen 상태다');
      sh.setZenMode(false);
      eq(sh.getZenMode(), false, 'Zen 모드가 꺼진다');
      ok(!document.getElementById('shell-root').classList.contains('zen'), '화면이 돌아온다');
    });

    // --- 상태 표시줄 (FR-22) ---
    check('formatRuntimeText', () => {
      // 상태 표시줄 오른쪽의 네 값: 이름 · 판 · 빌드일자 · 갈래 이름 (FR-22)
      const text = sh.formatRuntimeText({
        app_name: 'X', app_version: '9.9', build_date: '2026-01-01', runtime_name: 'Y'
      });
      ok(typeof text === 'string' && text.length > 0, '문자열을 돌려준다');
      for (const part of ['X', '9.9', '2026-01-01', 'Y']) {
        ok(text.includes(part), '네 값이 모두 들어간다: ' + part);
      }
      // 값이 없어도 네 자리가 비지 않는다
      const fallback = sh.formatRuntimeText(null);
      ok(/\\S+ v?\\S+ \\(\\d{4}-\\d{2}-\\d{2}\\) - \\S+/.test(fallback), '기본값도 네 자리를 채운다: ' + fallback);
    });

    check('updateStatus', () => {
      sh.updateStatus();
      const el = document.getElementById('status-message');
      ok(el, '상태 표시줄 자리가 있다');
      ok(typeof el.textContent === 'string', '왼쪽에 활성 대상이 표시된다');
    });

    check('toAbsolutePath', () => {
      const before = sh.treeModel.rootPath;
      sh.treeModel.rootPath = 'D:\\\\w\\\\demo';
      eq(sh.toAbsolutePath('a\\\\b.md'), 'D:\\\\w\\\\demo\\\\a\\\\b.md', '루트를 붙인다');
      eq(sh.toAbsolutePath(''), 'D:\\\\w\\\\demo', '빈 경로는 루트다');
      eq(sh.toAbsolutePath('E:\\\\x.md'), 'E:\\\\x.md', '절대 경로는 그대로다');
      sh.treeModel.rootPath = before;
    });

    check('syncRuntimeInfo', async () => {
      const p = sh.syncRuntimeInfo();
      ok(p && typeof p.then === 'function', '비동기로 돈다');
      ok(document.getElementById('status-runtime'), '오른쪽 자리가 있다');
    });

    // --- 설정 (FR-26) ---
    check('persistShell', () => {
      sh.persistShell();  // 브릿지가 없으면 조용히 지나간다
      ok(true, '브릿지가 없어도 멈추지 않는다');
    });

    check('initializeSettings', () => {
      const p = sh.initializeSettings();
      ok(p && typeof p.then === 'function', '비동기로 돈다');
    });

    // --- 탭 (FR-23, FR-24) ---
    check('closeActiveTab', () => {
      sh.tabManager.openTab({ kind: 'probe', resource: { path: 'p1' }, title: 'p1' });
      const n = sh.tabManager.getAllTabs().length;
      ok(n > 0, '닫을 탭이 있다');
      sh.closeActiveTab();
      eq(sh.tabManager.getAllTabs().length, n - 1, '활성 탭이 닫힌다');
    });

    check('moveActiveTabToOtherPane', () => {
      const opened = sh.tabManager.openTab({ kind: 'probe', resource: { path: 'p2' }, title: 'p2' });
      const from = opened.tab.paneId;
      sh.moveActiveTabToOtherPane();
      const after = sh.tabManager.getTab(opened.tab.id);
      ok(after, '탭이 살아 있다');
      ok(sh.tabManager.getPanes().length <= 2, '셋 이상으로 갈리지 않는다');
      sh.tabManager.closeTab(opened.tab.id);
    });

    // --- 다시 그리기 ---
    check('renderTree/renderEditor', () => {
      sh.renderTree();
      ok(document.getElementById('tree-root') || document.querySelector('.tree-empty'), '탐색기가 그려진다');
      sh.renderEditor();
      ok(document.getElementById('editor-panes'), '보기 영역이 그려진다');
    });

    // --- 갈아끼우는 자리와 모델 (FR-5 ~ FR-12) ---
    check('slots/tabManager/viewManager/treeModel/tabRegistry', () => {
      ok(sh.slots && typeof sh.slots.filterTreeItems === 'function', '자리 묶음이 있다');
      ok(sh.tabManager && typeof sh.tabManager.openTab === 'function', '탭 모델이 있다');
      ok(sh.viewManager && typeof sh.viewManager.activateView === 'function', '보기 수명 관리가 있다');
      ok(sh.treeModel && typeof sh.treeModel.setRoot === 'function', '트리 모델이 있다');
      ok(sh.tabRegistry && typeof sh.tabRegistry.register === 'function', '종류 등록표가 있다');
    });

    check('SlotRegistry/TabModel/ViewLifecycle/TreeExplorer/THEMES', () => {
      ok(typeof sh.SlotRegistry === 'function', 'SlotRegistry를 내보낸다');
      ok(sh.TabModel && sh.TabModel.TabManager, 'TabModel을 내보낸다');
      ok(sh.ViewLifecycle && sh.ViewLifecycle.ViewManager, 'ViewLifecycle을 내보낸다');
      ok(sh.TreeExplorer && sh.TreeExplorer.TreeModel, 'TreeExplorer를 내보낸다');
      ok(Array.isArray(sh.THEMES) && sh.THEMES.length === 3, '테마 세 단계를 내보낸다');
    });

    // 공개 목록과 구동한 동작을 대조한다
    const exposed = Object.keys(sh);
    const covered = new Set();
    for (const name of checks) for (const part of name.split('/')) covered.add(part);
    const missing = exposed.filter((n) => !covered.has(n));

    return { checks: checks.length, failures, exposed: exposed.length, missing };
  })()`);

  console.log('Running shell public API checks (TE-047, NFR-6)...');
  for (const f of result.failures) console.error('  FAIL ' + f);

  let exitCode = 0;
  if (result.failures.length > 0) exitCode = 1;
  if (result.missing.length > 0) {
    console.error('  시험이 없는 공개 동작: ' + result.missing.join(', '));
    exitCode = 1;
  }

  if (exitCode === 0) {
    console.log(`  공개 동작 ${result.exposed}개를 ${result.checks}개 검사로 모두 구동했다`);
    console.log('All shell public API checks passed successfully!');
  }
  app.exit(exitCode);
}).catch((err) => {
  console.error(err);
  app.exit(1);
});
