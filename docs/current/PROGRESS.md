# PROGRESS — tab_explorer_templates

> 버전: v0.1 · 작성일: 2026-09-06
>
> 실제로 한 것. task를 닫을 때마다 append한다. 계획은 `PLAN.md`와 `backlog.json`,
> 설계 결정은 `DECISIONS.md`가 담는다.

---

## 1. 계획된 작업

<!-- task 완료마다 한 항목: task ID · 무엇을 했나 · 결과 · 검증 · 특이사항 -->

### TE-001 — 저장소 골격 세우기

- 무엇을 했나: shared/design, shell, presets, host_pywebview, host_electron 5개 기본 디렉토리를 D-12 배치대로 생성했다.
- 결과: 껍데기와 프리셋이 특정 호스트 폴더에 귀속되지 않는 독립 골격이 마련되었다.
- 검증: 디렉토리 배치 점검 및 호스트 종속성 없는 구조 확인.

### TE-002 — 빌드 없는 로드 경로 구성

- 무엇을 했나: shell/index.html 및 shell/app.js를 작성하여 빌드 단계 없이 브라우저/웹뷰가 직접 로드할 수 있는 진입점을 구성했다.
- 결과: 저장소에 번들러/트랜스파일러/빌드 스크립트가 0건이며, 두 호스트가 동일한 shell/index.html을 그대로 로드하도록 경로가 정립되었다.
- 검증: 빌드 도구 부재 확인 및 HTML/CSS/JS 무빌드 로드 경로 확인.

### TE-003 — 디자인 토큰 파일 신규 작성

- 무엇을 했나: shared/design/tokens.css를 새로 작성하고, v0.1 tokens.css의 59개 토큰 값(글꼴 12px, 테마별 색상 등)을 정확히 옮겨 적었다. structure.css는 가져오지 않았다.
- 결과: v0.1 tokens.css와 비교 시 59개 토큰 값 불일치 0건이며, 토큰 외 직접 색상/글꼴 하드코딩이 없다.
- 검증: v0.1 토큰과의 자동 비교 스크립트 실행(일치율 100%).

### TE-004 — 픽셀 격자 정렬 규칙 고정

- 무엇을 했나: 아이콘 선명도 유지를 위한 짝수 컨테이너 높이 및 짝수 간격 규칙을 tokens.css 주석에 반영하고 토큰 값(menu-height 30, status-height 30, tree-row-height 22, space 짝수, icon-size 16, icon-stroke 1)을 고정했다.
- 결과: 아이콘 컨테이너 높이 5종 및 간격 4종이 모두 짝수로 유지되어 픽셀 번짐을 원천 방지했다.
- 검증: tokens.css 내 수치 및 주석 규칙 검증 완료.

### TE-005 — 아이콘 자산 반입과 아이콘 테마 셋

- 무엇을 했나: archive에서 icons.svg와 icons/seti/, icons/vscode-icons/ 자산을 shared/design/에 반입했다.
- 결과: Simple(기본), VS Code Built-in(seti), VS Code Icons(vscode-icons) 3개 아이콘 테마 자산이 모두 준비되었다.
- 검증: 파일 복사 완료 및 디렉토리 구조/크기 확인.

### TE-006 — 세 테마와 전환

- 무엇을 했나: shell/app.js에 white·gray·dark 세 테마 순환 전환(기본 gray, gray->dark->white->gray) 기능을 구현하고, 최상위 html 요소의 data-theme 속성 하나만 변경하도록 설정했다.
- 결과: 테마 버튼 3회 클릭 시 원 테마로 복귀하며 토큰 체계와 완벽히 연동된다.
- 검증: 테마 순환 로직 단위 테스트 통과.

### TE-007 — 껍데기 뼈대 — 다섯 구역 자리

- 무엇을 했나: shell/shell.css 및 shell/app.js에 메뉴 줄(menu-bar, 30px), 세로 띠(activity-rail, 30px), 탐색기(sidebar, 280px), 보기 영역(workspace, 가변), 상태 표시줄(status-bar, 30px) 다섯 구역 레이아웃을 구성했다.
- 결과: 다섯 구역이 겹치지 않고 온전한 창 공간을 형성하는 눈으로 볼 수 있는 껍데기 바닥이 완성되었다.
- 검증: 구역별 클래스/스타일 및 렌더링 스크립트 검증 완료.

### TE-008 — host_pywebview 최소 실행 경로

- 무엇을 했나: host_pywebview/app.py를 구현하여 프로젝트 루트의 shell/index.html 및 shared/design 에셋을 서빙하는 ProjectStaticApp과 pywebview frameless 1280x800 창 생성 로직을 구성했다.
- 결과: pywebview 갈래가 무빌드로 shell/index.html을 로드하며 다섯 구역과 테마가 적용된 창으로 뜬다.
- 검증: WSGI 앱 정적 에셋 서빙 테스트(200 OK, MIME 타입 일치) 확인.

### TE-009 — host_electron 최소 실행 경로

- 무엇을 했나: host_electron/host/main.js, preload.js, package.json, settings.json을 작성하여 상위 shell/index.html을 loadFile로 직접 로드하는 1280x800 frameless Electron 창 경로를 구성했다.
- 결과: pywebview 갈래와 정확히 동일한 shell/index.html 및 shared/design을 로드하는 대칭적 실행 경로가 확보되었다.
- 검증: Node 경로 해석 테스트(Resolved entry HTML 존재 확인: true) 완료.

### TE-010 — 갈래별 실행 안내 문서

- 무엇을 했나: host_pywebview/README.md(및 requirements.txt)와 host_electron/README.md를 작성하여 각 갈래별 최초 의존성 설치 및 실행 명령을 명시했다.
- 결과: 저장소를 새로 받은 사람이 각 갈래 폴더의 안내만 보고 앱을 실행할 수 있는 상태가 되었다.
- 검증: 안내 문서 내용 및 명령어 정합성 확인.

## 2. 계획 외 개선

<!-- 요청 건마다 한 항목: 요청 · 조치 · 결과 · 검증 -->

### 세로 띠 하단 상태표시줄 토글 아이콘 교체 및 회전

- 요청: 좌측 세로줄 띠의 하단 상태표시줄 감추기/보기 아이콘이 잘못되었으므로, 위쪽 탐색기창 폴더 감추기/보기 아이콘(icon-sidebar)을 반시계 방향으로 회전한 형태로 수정 요청.
- 조치: shell/app.js의 rail-bottom에 상태표시줄 토글 버튼(btn-rail-statusbar, .statusbar-toggle)을 배치하고 icon-sidebar 아이콘을 지정했으며, shell/shell.css에 `.statusbar-toggle .icon { transform: rotate(-90deg); }` 스타일을 추가하여 하단 바 형태를 직관적으로 나타내도록 변경함. 클릭 시 상태표시줄 접기/펴기(status-hidden 토글) 인터랙션도 연결함.
- 결과: 세로 띠 상단의 좌측 바(사이드바) 아이콘과 대칭을 이루며 하단 상태표시줄을 제어하는 반시계 회전 아이콘이 정상 반영됨.
- 검증: CSS 회전 속성(-90deg), DOM 마크업 및 status-hidden 토글 스크립트 검증 완료.

### pywebview 초기 창 크기 보정 (두 갈래 창 크기 일치)

- 요청: 2개 host(pywebview, Electron)의 창 크기가 서로 다르므로, 파일 탐색기 v0.1의 해결 사례를 적용하여 일치하도록 수정 요청.
- 조치: pywebview가 Windows에서 프레임리스(WinForms FormBorderStyle.None)로 전환되며 초기 외곽 크기가 축소되는 문제를 해결하기 위해, host_pywebview/host/window_chrome.py(Aero Snap/네이티브 창 관리 및 patch_drag_move)를 반입하고 app.py의 shown 이벤트에서 window.resize(WINDOW_WIDTH, WINDOW_HEIGHT)를 다시 적용하도록 구현함.
- 결과: pywebview 갈래가 렌더링 직후 Electron과 동일한 1280 × 800 크기로 보정되어 두 갈래의 외곽 크기가 완전히 일치함.
- 검증: host/window_chrome.py 연동 및 app.py 모듈 임포트/shown 이벤트 핸들러 등록 검증 완료.

### 상태표시줄 우측 4개 식별 정보 표시 형식 적용 (프로그램 이름 / 버전 / 날짜 / host 명)

- 요청: 상태표시줄 우측에 표시되는 정보가 "프로그램 이름 / 버전 / 날짜 / host 명" 순서 및 슬래시(/) 구분자여야 하므로 확인 및 적용 요청.
- 조치: shell/app.js의 formatRuntimeText 및 syncRuntimeInfo를 구현하여 `${app_name} / ${app_version} / ${build_date} / ${runtime_name}` 형식으로 포맷팅하도록 수정함. host_pywebview/app.py의 BridgeStub.get_settings 및 host_electron/host/main.js의 get_settings 브리지와 연동하고, bridge-ready 이벤트 시 동기화되도록 구성함.
- 결과: pywebview에서는 "Explorer Templates / v0.1 / 2026-09-06 / PyWebView", Electron에서는 "Explorer Templates / v0.1 / 2026-09-06 / Electron", 브라우저 단독 로드 시에는 "Explorer Templates / v0.1 / 2026-09-06 / Browser"로 4개 항목이 정확히 표시됨.
- 검증: 포맷팅 패턴 및 mock 런타임 데이터 출력 검증 통과.