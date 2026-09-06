// presets/folder/preset.js — 폴더 프리셋 (FR-32)
//
// 갈아끼우는 자리 다섯 중 셋을 미리 채워 둔다.
//
//   트리 항목      폴더만 표시한다
//   행 선택 매핑   폴더 행 → 폴더 탭 (파일 행은 열지 않음)
//   중복 정책      같은 주소면 기존 탭, 판정 범위는 패널 안
//
// 판정 범위가 파일 프리셋과 다른 이유는 좌우 패널에서 서로 다른 폴더를 여는 앱이
// 같은 폴더를 양쪽에 두 번 열지 않아야 하기 때문이다 (BRIEF 4절, D-7).
(function (root) {
  'use strict';

  var KIND = 'folder';

  var preset = {
    id: 'folder',
    kind: KIND,

    install: function (slots) {
      if (!slots) return;

      // 1. 트리 항목 자리 (FR-5) — 폴더만 남긴다
      slots.setTreeItemFilter(function (entries) {
        if (!Array.isArray(entries)) return [];
        return entries.filter(function (entry) {
          return entry && entry.is_dir;
        });
      });

      // 2. 행 선택 매핑 자리 (FR-6) — 폴더 행에서만 탭을 연다
      slots.setRowSelectionMapper(function (entry) {
        if (!entry || !entry.is_dir) return null;
        return {
          kind: KIND,
          resource: { path: entry.path },
          title: entry.name
        };
      });

      // 3. 중복 정책 자리 (FR-8) — 같은 주소면 기존 탭을 쓰고, 판정은 패널 안에서 한다
      slots.registerDuplicatePolicy(KIND, {
        mode: 'reuse_existing',
        scope: 'panel'
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
