// presets/file/preset.js — 파일 프리셋 (FR-32)
//
// 갈아끼우는 자리 다섯 중 셋을 미리 채워 둔다.
//
//   트리 항목      파일과 폴더를 모두 표시한다
//   행 선택 매핑   파일 행 → 파일 탭 (폴더 행은 열지 않음)
//   중복 정책      같은 주소면 기존 탭, 판정 범위는 조각 안
//
// 나머지 둘(보기 제공자 · 여는 경로)은 앱이 자기 것으로 채운다.
// 참조 보기는 reference_view.js가 보기 제공자 자리에 기본으로 얹는다 (FR-33).
(function (root) {
  'use strict';

  var KIND = 'file';

  var preset = {
    id: 'file',
    kind: KIND,

    install: function (slots) {
      if (!slots) return;

      // 1. 트리 항목 자리 (FR-5) — 파일과 폴더를 모두 표시한다
      slots.setTreeItemFilter(function (entries) {
        return Array.isArray(entries) ? entries.slice() : [];
      });

      // 2. 행 선택 매핑 자리 (FR-6) — 파일 행에서만 탭을 연다
      slots.setRowSelectionMapper(function (entry) {
        if (!entry || entry.is_dir) return null;
        return {
          kind: KIND,
          resource: { path: entry.path },
          title: entry.name
        };
      });

      // 3. 중복 정책 자리 (FR-8) — 같은 주소면 기존 탭을 쓰고, 판정은 조각 안에서 한다
      slots.registerDuplicatePolicy(KIND, {
        mode: 'reuse_existing',
        scope: 'pane'
      });

      // 참조 보기를 보기 제공자 자리에 기본으로 얹는다 (FR-33).
      // 앱은 이 등록만 자기 보기로 바꾼다 — 껍데기는 바뀌지 않는다.
      var views = (typeof root !== 'undefined' && root.PresetReferenceViews) || null;
      if (views && views[preset.id]) {
        slots.registerViewProvider(KIND, views[preset.id]);
      }
    }
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = preset;
  } else {
    root.Presets = root.Presets || {};
    root.Presets[preset.id] = preset;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
