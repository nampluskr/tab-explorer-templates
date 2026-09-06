// presets/file/reference_view.js — 파일 프리셋의 참조 보기 (FR-33)
//
// 고른 파일의 이름만 출력한다. 내용은 읽지 않는다 — 브릿지에 읽기 요청을 한 번도
// 보내지 않는다. 도메인 로직(마크다운 렌더링 · 신호 분석 등)은 담지 않는다.
// 앱은 이 자리를 자기 보기로 갈아끼운다. 그때 껍데기는 한 줄도 바뀌지 않는다.
//
// 보기 제공자 자리(FR-7)의 계약: createView(container, tab) →
//   mount(container, ctx) · activate() · deactivate() · resize() · destroy()
(function (root) {
  'use strict';

  function getBaseName(path) {
    if (!path) return '';
    var normalized = String(path).replace(/[\\/]+$/, '');
    var cut = Math.max(normalized.lastIndexOf('/'), normalized.lastIndexOf('\\'));
    return cut >= 0 ? normalized.slice(cut + 1) : normalized;
  }

  var referenceView = {
    kind: 'file',

    createView: function (container, tab) {
      var el = null;
      var destroyed = false;

      return {
        mount: function (mountTarget) {
          if (destroyed) return;
          var target = mountTarget || container;
          if (!target || !target.ownerDocument) return;

          el = target.ownerDocument.createElement('div');
          el.className = 'reference-view';

          var label = target.ownerDocument.createElement('div');
          label.className = 'reference-view-name';
          // 이름만 출력한다. 내용을 읽는 요청은 하지 않는다 (FR-33)
          label.textContent = (tab && tab.title)
            || getBaseName(tab && tab.resource && tab.resource.path);
          el.appendChild(label);

          target.appendChild(el);
        },

        activate: function () {
          if (el) el.classList.add('active');
        },

        deactivate: function () {
          if (el) el.classList.remove('active');
        },

        resize: function () {
          // 이름 한 줄이라 크기 변화에 따로 할 일이 없다
        },

        destroy: function () {
          destroyed = true;
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
          el = null;
        }
      };
    }
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = referenceView;
  } else {
    root.PresetReferenceViews = root.PresetReferenceViews || {};
    root.PresetReferenceViews.file = referenceView;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
