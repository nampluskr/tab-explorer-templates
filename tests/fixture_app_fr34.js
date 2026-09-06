// tests/fixture_app_fr34.js — FR-34의 요구 셋을 끼운 시험용 앱
//
// `markdown_browser`가 이미 갖춘 셋을 껍데기 수정 0줄로 충족하는지 보이는 것이 목적이다.
//
//   1. 확장자로 트리 항목 거르기      → 트리 항목 자리 (FR-5)
//   2. 트리를 거치지 않고 새 탭 열기   → 여는 경로 자리 (FR-9)
//   3. 파일 경로를 인자로 받아 시작    → 여는 경로 자리 + 연결 계층의 call_domain (FR-27)
//
// 셋 모두 갈아끼우는 자리와 계약 안에서만 이뤄진다. 이 파일은 앱의 코드이지
// 껍데기의 코드가 아니다 — 실제 앱이라면 자기 프리셋 폴더에 이만큼을 둔다.
(function (root) {
  'use strict';

  var KIND = 'markdown';
  var ALLOWED_EXTENSION = '.md';

  function baseName(path) {
    if (!path) return '';
    var normalized = String(path).replace(/[\\/]+$/, '');
    var cut = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));
    return cut >= 0 ? normalized.slice(cut + 1) : normalized;
  }

  function hasAllowedExtension(name) {
    return String(name || '').toLowerCase().slice(-ALLOWED_EXTENSION.length) === ALLOWED_EXTENSION;
  }

  var app = {
    id: 'fr34-demo',
    kind: KIND,
    allowedExtension: ALLOWED_EXTENSION,

    install: function (slots) {
      if (!slots) return;

      // 1. 확장자로 트리 항목 거르기 (FR-5)
      //    폴더는 남긴다 — 걸러 버리면 하위로 내려갈 수 없다.
      slots.setTreeItemFilter(function (entries) {
        if (!Array.isArray(entries)) return [];
        return entries.filter(function (entry) {
          if (!entry) return false;
          return entry.is_dir || hasAllowedExtension(entry.name);
        });
      });

      slots.setRowSelectionMapper(function (entry) {
        if (!entry || entry.is_dir) return null;
        return { kind: KIND, resource: { path: entry.path }, title: entry.name };
      });

      slots.registerDuplicatePolicy(KIND, { mode: 'reuse_existing', scope: 'pane' });

      slots.registerViewProvider(KIND, {
        createView: function (container, tab) {
          var el = null;
          return {
            mount: function (target) {
              var host = target || container;
              if (!host || !host.ownerDocument) return;
              el = host.ownerDocument.createElement('div');
              el.className = 'reference-view';
              el.textContent = (tab && tab.title) || '';
              host.appendChild(el);
            },
            activate: function () {},
            deactivate: function () {},
            resize: function () {},
            destroy: function () {
              if (el && el.parentNode) el.parentNode.removeChild(el);
              el = null;
            }
          };
        }
      });

      // 2. 트리를 거치지 않고 새 탭 열기 (FR-9)
      //    여는 경로 자리에 등록하면 트리 커서를 건드리지 않고 탭이 열린다.
      slots.registerOpenRoute('new-tab', function (tabManager, options) {
        if (!tabManager) return null;
        var target = (options && options.path) || 'untitled' + ALLOWED_EXTENSION;
        return tabManager.openTab({
          kind: KIND,
          resource: { path: target },
          title: (options && options.title) || baseName(target),
          preview: false,
          pinned: true
        });
      });

      // 3. 파일 경로를 인자로 받아 시작 (FR-27)
      //    연결 계층은 파일 인자를 루트로 삼지 않고 기본 동작으로 떨어진다.
      //    앱은 계약의 call_domain으로 그 인자를 직접 받아 자기 탭을 연다.
      slots.registerOpenRoute('startup-argument', function (tabManager, options) {
        var startupPath = options && options.startupPath;
        if (!tabManager || !startupPath) return null;
        if (!hasAllowedExtension(startupPath)) return null;
        return tabManager.openTab({
          kind: KIND,
          resource: { path: startupPath },
          title: baseName(startupPath),
          preview: false,
          pinned: true
        });
      });
    },

    // 껍데기가 다시 그릴 때마다 자기 버튼을 다시 붙인다.
    // 껍데기는 'shell-rendered'로 "다시 그렸다"만 알리고, 무엇을 붙일지는 앱이 정한다.
    keepNewTabButton: function (windowRef, documentRef, slots, tabManager, onOpened) {
      var self = this;
      var remount = function () {
        self.mountNewTabButton(documentRef, slots, tabManager, onOpened);
      };
      remount();
      if (windowRef && typeof windowRef.addEventListener === 'function') {
        windowRef.addEventListener('shell-rendered', function (event) {
          if (!event || !event.detail || event.detail.area === 'editor') remount();
        });
      }
      return remount;
    },

    // 앱이 자기 화면 요소를 더하는 자리. 껍데기의 마크업을 고치지 않고
    // 이미 그려진 화면에 자기 버튼 하나를 얹는다 (FR-9).
    mountNewTabButton: function (documentRef, slots, tabManager, onOpened) {
      if (!documentRef || !slots || !tabManager) return null;
      var bar = documentRef.querySelector('.tab-bar-actions');
      if (!bar) return null;
      if (documentRef.getElementById && documentRef.getElementById('btn-app-new-tab')) return null;

      var button = documentRef.createElement('button');
      button.className = 'icon-btn';
      button.id = 'btn-app-new-tab';
      button.title = 'New Tab';
      button.textContent = '+';
      button.addEventListener('click', function () {
        slots.executeOpenRoute('new-tab', tabManager, {});
        if (typeof onOpened === 'function') onOpened();
      });
      bar.appendChild(button);
      return button;
    },

    // 시작 인자는 계약의 call_domain으로만 받는다 — 껍데기는 이 호출을 알지 못한다.
    openStartupArgument: async function (bridge, slots, tabManager) {
      if (!bridge || typeof bridge.call_domain !== 'function') return null;
      var res = await bridge.call_domain('startup_target');
      if (!res || !res.ok || !res.value) return null;
      return slots.executeOpenRoute('startup-argument', tabManager, { startupPath: res.value });
    }
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = app;
  } else {
    root.AppFR34 = app;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
