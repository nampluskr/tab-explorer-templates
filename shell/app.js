// shell/app.js — 껍데기 뼈대 및 기본 인터랙션
(function () {
  'use strict';

  // 1. 테마 상태 및 관리 (TE-006)
  // white · gray · dark 셋이 있고 기본값은 gray. 순환: gray -> dark -> white -> gray
  const THEMES = ['gray', 'dark', 'white'];
  let currentThemeIndex = 0; // gray

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function cycleTheme() {
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const nextTheme = THEMES[currentThemeIndex];
    applyTheme(nextTheme);
    return nextTheme;
  }

  // 2. 다섯 구역 DOM 뼈대 렌더링 (TE-007)
  function renderShell() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    appEl.innerHTML = `
      <div class="shell-root" id="shell-root">
        <!-- 1. 메뉴 줄 (구역 1) -->
        <header class="menu-bar drag-region" id="menu-bar">
          <div class="menu-slot">
            <button class="menu-button" id="btn-menu-file" tabindex="-1">File</button>
          </div>
          <div class="menu-slot">
            <button class="menu-button" id="btn-menu-view" tabindex="-1">View</button>
          </div>
          <div class="menu-slot">
            <button class="menu-button" id="btn-menu-help" tabindex="-1">Help</button>
          </div>
          <div class="drag-region"></div>
          <div class="window-controls">
            <button class="window-btn" id="btn-win-min" title="최소화" tabindex="-1">
              <svg class="icon"><use href="../shared/design/icons.svg#icon-minimize"/></svg>
            </button>
            <button class="window-btn" id="btn-win-max" title="최대화" tabindex="-1">
              <svg class="icon"><use href="../shared/design/icons.svg#icon-maximize"/></svg>
            </button>
            <button class="window-btn" id="btn-win-close" title="닫기" tabindex="-1">
              <svg class="icon"><use href="../shared/design/icons.svg#icon-close"/></svg>
            </button>
          </div>
        </header>

        <!-- 본체 구역: 세로 띠 + 탐색기 + 보기 영역 -->
        <div class="shell-body" id="shell-body">
          <!-- 2. 세로 띠 (구역 2) -->
          <nav class="activity-rail" id="activity-rail">
            <div class="rail-top">
              <button class="rail-btn active" id="btn-rail-explorer" title="탐색기 토글 (Ctrl+B)" tabindex="-1">
                <svg class="icon"><use href="../shared/design/icons.svg#icon-sidebar"/></svg>
              </button>
            </div>
            <div class="rail-bottom">
              <button class="rail-btn statusbar-toggle active" id="btn-rail-statusbar" title="상태 표시줄 토글" tabindex="-1">
                <svg class="icon"><use href="../shared/design/icons.svg#icon-sidebar"/></svg>
              </button>
            </div>
          </nav>

          <!-- 3. 탐색기 (구역 3) -->
          <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
              <span>EXPLORER</span>
              <div class="sidebar-actions">
                <button class="icon-btn" id="btn-folder-open" title="폴더 열기" tabindex="-1">
                  <svg class="icon"><use href="../shared/design/icons.svg#icon-open"/></svg>
                </button>
                <button class="icon-btn" id="btn-tree-refresh" title="새로 읽기" tabindex="-1">
                  <svg class="icon"><use href="../shared/design/icons.svg#icon-refresh"/></svg>
                </button>
                <button class="icon-btn" id="btn-collapse-all" title="모두 접기" tabindex="-1">
                  <svg class="icon"><use href="../shared/design/icons.svg#icon-collapse-all"/></svg>
                </button>
              </div>
            </div>
            <div class="sidebar-content" id="sidebar-content">
              <!-- 트리 영역 (Phase 6에서 채워짐) -->
            </div>
          </aside>

          <!-- 스플리터 -->
          <div class="splitter" id="splitter"></div>

          <!-- 4. 보기 영역 (구역 4) -->
          <main class="workspace" id="workspace">
            <div class="tab-bar-container" id="tab-bar-container"></div>
            <div class="view-container" id="view-container"></div>
          </main>
        </div>

        <!-- 5. 상태 표시줄 (구역 5) -->
        <footer class="status-bar" id="status-bar">
          <div class="status-left" id="status-left">
            <span id="status-message">Ready</span>
          </div>
          <div class="status-right" id="status-right">
            <span id="status-app-info">Explorer Templates v0.1 (2026-09-06) - Browser</span>
          </div>
        </footer>
      </div>
    `;

    // 이벤트 리스너 바인딩
    const statusbarToggleBtn = document.getElementById('btn-rail-statusbar');
    const shellRoot = document.getElementById('shell-root');
    if (statusbarToggleBtn && shellRoot) {
      statusbarToggleBtn.addEventListener('click', () => {
        shellRoot.classList.toggle('status-hidden');
        statusbarToggleBtn.classList.toggle('active', !shellRoot.classList.contains('status-hidden'));
      });
    }

    const explorerToggleBtn = document.getElementById('btn-rail-explorer');
    const sidebar = document.getElementById('sidebar');
    if (explorerToggleBtn && sidebar) {
      explorerToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        explorerToggleBtn.classList.toggle('active', !sidebar.classList.contains('collapsed'));
      });
    }

    syncRuntimeInfo();
    initSplitter();
    renderTree();
  }

  function initSplitter() {
    const splitter = document.getElementById('splitter');
    const sidebar = document.getElementById('sidebar');
    if (!splitter || !sidebar) return;

    splitter.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = sidebar.getBoundingClientRect().width;
      splitter.classList.add('dragging');

      const onPointerMove = (moveEvent) => {
        const newWidth = Math.max(140, startWidth + (moveEvent.clientX - startX));
        document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
      };

      const onPointerUp = () => {
        splitter.classList.remove('dragging');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });
  }

  function formatRuntimeText(runtime) {
    if (!runtime) return 'Explorer Templates v0.1 (2026-09-06) - Browser';
    const appName = runtime.app_name || 'Explorer Templates';
    const appVer = runtime.app_version || 'v0.1';
    const buildDate = runtime.build_date || new Date().toISOString().slice(0, 10);
    const hostName = runtime.runtime_name || 'Host';
    return `${appName} ${appVer} (${buildDate}) - ${hostName}`;
  }

  async function syncRuntimeInfo() {
    const infoEl = document.getElementById('status-app-info');
    if (!infoEl) return;

    if (window.bridge && typeof window.bridge.get_settings === 'function') {
      try {
        const res = await window.bridge.get_settings();
        if (res && res.ok && res.value && res.value.runtime) {
          infoEl.textContent = formatRuntimeText(res.value.runtime);
          return;
        }
      } catch (e) {
        console.warn('Failed to fetch runtime info from bridge', e);
      }
    }
    infoEl.textContent = formatRuntimeText(null);
  }

  // 갈아끼우는 자리 다섯 (Phase 5)
  const slotRegistry = (typeof window !== 'undefined' && window.SlotRegistry)
    ? new window.SlotRegistry()
    : null;

  // 탭 매니저 인스턴스 (Phase 3)
  const tabRegistry = (typeof window !== 'undefined' && window.TabModel) ? new window.TabModel.KindRegistry() : null;
  const tabManager = (typeof window !== 'undefined' && window.TabModel) ? new window.TabModel.TabManager(tabRegistry) : null;

  // 보기 수명주기 매니저 인스턴스 (Phase 4)
  const viewManager = (typeof window !== 'undefined' && window.ViewLifecycle && tabManager)
    ? new window.ViewLifecycle.ViewManager({
        tabManager,
        providerResolver: (kind) => (slotRegistry ? slotRegistry.getViewProvider(kind) : null)
      })
    : null;

  // 트리 모델 인스턴스 (Phase 6)
  const treeModel = (typeof window !== 'undefined' && window.TreeExplorer)
    ? new window.TreeExplorer.TreeModel({
        bridge: (typeof window !== 'undefined' && window.bridge) ? window.bridge : null,
        slots: slotRegistry,
        tabManager: tabManager,
        onRender: () => renderTree()
      })
    : null;

  function updateStatus() {
    const msgEl = document.getElementById('status-message');
    if (!msgEl) return;

    const activeTab = tabManager ? tabManager.getActiveTab() : null;
    if (activeTab && activeTab.resource) {
      msgEl.textContent = activeTab.resource.path || activeTab.title || 'Ready';
    } else if (treeModel && treeModel.cursorPath) {
      msgEl.textContent = treeModel.cursorPath;
    } else if (treeModel && treeModel.rootPath) {
      msgEl.textContent = treeModel.rootPath;
    } else {
      msgEl.textContent = 'Ready';
    }
  }

  function renderTree() {
    const container = document.getElementById('sidebar-content');
    if (!container || !treeModel || !window.TreeExplorer) return;

    container.innerHTML = `<div class="tree" id="tree-root" tabindex="0" role="tree" aria-label="Explorer Tree">${window.TreeExplorer.renderTreeHtml(treeModel)}</div>`;
    bindTreeEvents();
  }

  function bindTreeEvents() {
    const treeRoot = document.getElementById('tree-root');
    if (!treeRoot || !treeModel) return;

    treeRoot.addEventListener('keydown', async (e) => {
      await treeModel.handleKeyDown(e);
      updateStatus();
    });

    treeRoot.addEventListener('focus', () => {
      treeModel.isFocused = true;
    });

    treeRoot.addEventListener('blur', () => {
      treeModel.isFocused = false;
    });

    const rows = treeRoot.querySelectorAll('.tree-row');
    rows.forEach((row) => {
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const path = row.dataset.path;
        const isDir = row.dataset.dir === 'true';
        treeModel.setCursor(path);
        if (isDir) {
          treeModel.toggleExpand(path);
        } else {
          treeModel.openRowTab({
            path: path,
            name: row.querySelector('.tree-label')?.textContent || path,
            is_dir: false
          }, true);
          updateStatus();
        }
      });

      row.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const path = row.dataset.path;
        const isDir = row.dataset.dir === 'true';
        if (!isDir) {
          treeModel.openRowTab({
            path: path,
            name: row.querySelector('.tree-label')?.textContent || path,
            is_dir: false
          }, false);
          updateStatus();
        }
      });
    });

    // 머리글 버튼 3종 이벤트 바인딩 (FR-14, TE-029)
    const btnOpen = document.getElementById('btn-folder-open');
    if (btnOpen && !btnOpen.__bound) {
      btnOpen.__bound = true;
      btnOpen.addEventListener('click', async () => {
        if (window.bridge && typeof window.bridge.choose_root === 'function') {
          const res = await window.bridge.choose_root();
          if (res && res.ok && res.value) {
            await treeModel.setRoot(res.value);
            updateStatus();
          }
        }
      });
    }

    const btnRefresh = document.getElementById('btn-tree-refresh');
    if (btnRefresh && !btnRefresh.__bound) {
      btnRefresh.__bound = true;
      btnRefresh.addEventListener('click', async () => {
        if (treeModel) {
          await treeModel.refresh();
          updateStatus();
        }
      });
    }

    const btnCollapseAll = document.getElementById('btn-collapse-all');
    if (btnCollapseAll && !btnCollapseAll.__bound) {
      btnCollapseAll.__bound = true;
      btnCollapseAll.addEventListener('click', () => {
        if (treeModel) {
          treeModel.collapseAll();
        }
      });
    }
  }

  // 초기 실행
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme('gray');
    renderShell();
  });

  window.addEventListener('bridge-ready', () => {
    syncRuntimeInfo();
    if (treeModel && window.bridge) {
      treeModel.setBridge(window.bridge);
    }
  });

  // 외부(테스트 또는 브리지) 노출 API
  window.__shell = {
    getTheme: () => document.documentElement.getAttribute('data-theme'),
    setTheme: (t) => applyTheme(t),
    cycleTheme: cycleTheme,
    formatRuntimeText: formatRuntimeText,
    syncRuntimeInfo: syncRuntimeInfo,
    updateStatus: updateStatus,
    slots: slotRegistry,
    tabManager: tabManager,
    tabRegistry: tabRegistry,
    viewManager: viewManager,
    treeModel: treeModel,
    renderTree: renderTree,
    SlotRegistry: typeof window !== 'undefined' ? window.SlotRegistry : null,
    TabModel: typeof window !== 'undefined' ? window.TabModel : null,
    ViewLifecycle: typeof window !== 'undefined' ? window.ViewLifecycle : null,
    TreeExplorer: typeof window !== 'undefined' ? window.TreeExplorer : null,
    THEMES: THEMES
  };
})();