// presets/folder/reference_view.js — 폴더 프리셋의 참조 보기 (FR-33)
//
// 그 폴더의 주소만 표시한다. 목록을 읽지 않는다 — 브릿지에 읽기 요청을 한 번도
// 보내지 않는다. 콘텐츠 영역에 파일 목록을 구현하지 않는다(그건 파일 관리자의 몫이다).
// 앱은 이 자리를 자기 보기로 갈아끼운다. 그때 껍데기는 한 줄도 바뀌지 않는다.
//
// 보기 제공자 자리(FR-7)의 계약: createView(container, tab) →
//   mount(container, ctx) · activate() · deactivate() · resize() · destroy()
(function (root) {
  'use strict';

  var referenceView = {
    kind: 'folder',

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

          var address = target.ownerDocument.createElement('div');
          address.className = 'reference-view-path';
          // 주소만 표시한다. 목록을 읽는 요청은 하지 않는다 (FR-33)
          address.textContent = (tab && tab.resource && tab.resource.path) || '';
          el.appendChild(address);

          target.appendChild(el);
        },

        activate: function () {
          if (el) el.classList.add('active');
        },

        deactivate: function () {
          if (el) el.classList.remove('active');
        },

        resize: function () {
          // 주소 한 줄이라 크기 변화에 따로 할 일이 없다
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
    root.PresetReferenceViews.folder = referenceView;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
