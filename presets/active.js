// presets/active.js — 어느 프리셋을 쓸지 고르는 한 곳 (FR-32)
//
// 프리셋을 바꾸려면 아래 ACTIVE_PRESET 한 줄만 고친다.
// 껍데기(shell/)는 프리셋의 이름을 알지 못하며 이 파일 하나만 읽는다 (FR-4).
//
//   'file'    파일과 폴더를 표시하고 파일 행에서 탭을 연다 (조각 안에서 중복 판정)
//   'folder'  폴더만 표시하고 폴더 행에서 탭을 연다 (패널 안에서 중복 판정)
//
// 새 프리셋을 더할 때도 껍데기는 그대로 두고 presets/ 아래에 폴더를 만든 뒤
// 이 값만 그 이름으로 바꾼다.
(function (root) {
  'use strict';

  var ACTIVE_PRESET = 'file';

  // 고른 프리셋의 소재만 이어 붙인다. 빌드 단계 없이 파서 단계에서 동기로 로드되므로
  // 껍데기의 app.js가 뜰 때는 이미 등록이 끝나 있다 (제약 3).
  if (typeof document !== 'undefined' && typeof document.write === 'function') {
    var base = '../presets/' + ACTIVE_PRESET + '/';
    var parts = ['reference_view.js', 'preset.js'];
    for (var i = 0; i < parts.length; i++) {
      document.write('<script src="' + base + parts[i] + '"><\/script>');
    }
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = ACTIVE_PRESET;
  } else {
    root.ACTIVE_PRESET = ACTIVE_PRESET;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this));
