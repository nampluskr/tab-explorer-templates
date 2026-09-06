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

### TE-011 — 연결 계층 동작 목록 정의

- 무엇을 했나: docs/BRIDGE-CONTRACT.md를 작성하여 대상(루트/목록)·창(최소화/최대화/닫기)·설정(읽기/저장/최근폴더)·도메인(call_domain) 4개 묶음의 동작 계약을 정의했다.
- 결과: 껍데기와 호스트 사이의 계약이 고정되었으며, 껍데기가 도메인을 해석하지 않는 무지 제약이 명시되었다.
- 검증: 계약 문서 검토 및 요구사항 목록 대조 완료.

### TE-012 — 오류 구분값 한 벌 정의

- 무엇을 했나: docs/ERROR-CONTRACT.md를 작성하여 두 갈래가 공통으로 사용할 오류 코드 6종(ROOT_ESCAPE, NOT_FOUND, PERMISSION_DENIED, READ_FAILED, USER_CANCELLED, UNSUPPORTED_TARGET)을 정의했다.
- 결과: 연결 계층 오류 발생 시 두 갈래가 동일한 코드와 형식을 반환하여 앱 중단 없이 알림을 띄울 수 있는 기반이 마련되었다.
- 검증: 오류 코드 목록 및 규약 명세 검증 완료.

### TE-013 — 루트 경계 검증을 연결 계층에 구현

- 무엇을 했나: host_pywebview의 Bridge._resolve_inside_root 및 host_electron의 resolveInsideRoot/isInsideRoot에 루트 밖 경로 3종(.. 포함 경로, 절대 경로, 루트 밖을 가리키는 심볼릭 링크) 검증 로직을 구현하고, 하위 항목 순회 시에도 루트 밖 심볼릭 링크를 차단(blocked: true)하도록 구성했다.
- 결과: 껍데기를 거치지 않고 연결 계층에 직접 경로를 전달해도 루트 밖 접근이 완벽히 거부되며, 존재하지 않는 경로(NOT_FOUND)나 지원하지 않는 대상(UNSUPPORTED_TARGET)과 명확히 구분된 ROOT_ESCAPE 오류가 반환된다.
- 검증: test_bridge_pywebview.py 및 test_bridge_electron.js에서 .. 탐색, 드라이브 절대 경로, 외부 심볼릭 링크 직접 호출 테스트 통과.

### TE-014 — host_pywebview 계약 구현

- 무엇을 했나: host_pywebview/host/bridge.py에 계약된 동작 11종(choose_root, set_root, get_recent_folders, clear_recent_folders, list_children, minimize, toggle_maximize, close, get_settings, save_settings, call_domain) 및 window-state 알림을 구현하고, app.py의 BridgeStub을 정식 Bridge로 교체하여 윈도우 이벤트와 연결했다.
- 결과: pywebview 갈래가 계약에 정의된 모든 메서드와 오류 코드를 온전히 지원하며, 설정 보존 및 최근 폴더 관리도 정상 작동한다.
- 검증: test_bridge_pywebview.py 단위 테스트(9건) 전건 통과.

### TE-015 — host_electron 계약 구현

- 무엇을 했나: host_electron/host/main.js에 pywebview 갈래와 100% 동일한 계약 메서드 11종 및 오류 처리 로직을 구현하고, 테스트가 가능하도록 handleBridge 및 헬퍼 함수를 모듈로 노출했다.
- 결과: 두 갈래 간 동작 목록 및 오류 구분값 불일치가 0건이며, Electron 환경에서도 pywebview와 완벽한 대칭성을 확보했다.
- 검증: test_bridge_electron.js 및 test_parity.py의 6개 패리티 검증 테스트 통과.

### TE-016 — 탭 모델 정의 — 종류 · 식별값 · 대상 설명 · 보기 상태

- 무엇을 했나: shell/tab_model.js에 탭의 4대 핵심 요소(kind, id, resource, viewState)를 갖는 createTab 모델과 KindRegistry를 구현하고, 껍데기가 종류를 미리 알지 않는 상태에서 임의의 새 종류를 동적으로 등록할 수 있도록 구성했다.
- 결과: 껍데기 코드 수정 없이 임의의 새 종류 문자열을 등록하고 탭을 생성·관리할 수 있는 확장성이 확보되었다.
- 검증: test_tab_model.js 내 임의 종류 등록 및 탭 생성 테스트 통과.

### TE-017 — 탭 식별값과 대상 주소 분리

- 무엇을 했나: 탭 인스턴스 식별값(tab.id)을 고유 시퀀스 기반 토큰(tab-...)으로 자동 발급하여 리소스 주소(resource.path 등)와 완전히 분리하고, 중복 정책(기존 탭 재사용 vs 항상 새 탭)에 따라 탭 인스턴스를 관리하도록 TabManager에 구현했다.
- 결과: 껍데기가 대상 주소를 탭 식별값으로 쓰는 곳이 0건이며, "기존 탭" 정책에서는 탭 수 1 유지, "항상 새 탭" 정책에서는 탭 수 2 및 고유 ID 발급이 정상 작동한다.
- 검증: test_tab_model.js 내 중복 정책별 탭 생성 수(1건 vs 2건) 및 ID 상이 검증 통과.

### TE-018 — 대상 설명의 직렬화

- 무엇을 했나: serializeResources 및 deserializeResources를 구현하여 탭의 대상 설명(resource)이 실행 중 객체(프로세스, DOM 등) 없이 순수 직렬화 가능한 데이터만 유지하도록 하고 손실 없는 왕복을 보장했다.
- 결과: 열린 탭 전체의 대상 설명이 JSON 직렬화 왕복을 손실 없이 통과하며, Python과 Node 양쪽 환경에서 100% 동일한 결과가 도출된다.
- 검증: test_phase_three.py의 Python-Node 교차 직렬화 패리티 검증 테스트 통과.

### TE-019 — 종류를 모르는 열기 · 닫기 · 이동 경로

- 무엇을 했나: TabManager의 열기(openTab), 활성화(activateTab), 닫기(closeTab), 패널 간 이동(moveTabToPane), 고정(pinTab) 등 모든 제어 경로에서 특정 리소스 종류를 비교하거나 분기하는 로직을 완전히 배제하고, shell/app.js에도 탭 매니저 인스턴스를 연결했다.
- 결과: 껍데기 코드 전체에서 종류 값과의 비교문이 0건이고, file·folder·terminal 등의 종류 이름 문자열이 0건인 완전한 무지 상태를 달성했다.
- 검증: test_phase_three.py 정규식 정적 검사 통과 및 test_tab_model.js 동작 검증 완료.

### TE-020 — 보기 수명주기 계약

- 무엇을 했나: shell/view_lifecycle.js에 ViewManager를 구현하여 탭 열기·전환·크기조절·닫기 과정에서 정의된 수명주기 메서드(mount, activate, deactivate, resize, destroy)가 약속된 순서대로 호출되도록 하고, 폐기(destroy)된 보기는 화면 조작을 시도하지 않도록 보장했다.
- 결과: 비활성 탭의 보기는 항상 비활성(deactivated) 상태로 대기하며, 탭 닫힘 시에만 온전히 폐기되는 수명주기 계약이 성립되었다.
- 검증: test_view_lifecycle.js 수명주기 호출 순서 및 폐기 후 조작 차단 검증 통과.

### TE-021 — 탭 수명 동안 보기 인스턴스 유지

- 무엇을 했나: 탭 전환, 패널 간 이동(moveTabToPane), 껍데기 재렌더링 시 기존 보기 인스턴스를 폐기하거나 재생성하지 않고 DOM 컨테이너를 유지·재연결하는 ViewManager 관리 로직을 구현했다.
- 결과: 탭 전환 10회, 패널 이동 10회, 껍데기 재렌더링 10회를 반복한 뒤에도 보기 생성 횟수가 정확히 1로 유지되며, 내부 긴 수명 상태(버퍼, 카운터 등)가 유실 없이 보존된다.
- 검증: test_view_lifecycle.js 내 30회 전환 스트레스 테스트 및 장기 수명 상태 검증 통과.

### TE-022 — 세션 상태 보관과 전달

- 무엇을 했나: 비활성화 시 보기가 넘겨준 세션 상태(saveState)를 껍데기(tab.viewState)에 보관하고 활성화 시 다시 전달(restoreState)하되, 껍데기 코드는 그 상태값의 내부를 일절 읽거나 비교하지 않도록 구성했다. 영속 상태는 보기가 자체 저장 구역에 관리하며 앱 재시작 시 세션 상태는 복원되지 않는다.
- 결과: 껍데기 코드 내 viewState 내부 속성 검사 0건을 달성했고 세션 상태 전달과 앱 재시작 미복원 격리를 입증했다.
- 검증: test_phase_four.py 정적 분석 및 test_view_lifecycle.js 세션 상태 왕복 테스트 통과.

### TE-023 — 트리 항목 자리

- 무엇을 했나: shell/slot_registry.js에 SlotRegistry를 구현하여 트리 항목 필터/변환 슬롯(treeItemFilter)을 제공하고, 기본 동작(항목 그대로 반환)과 함께 확장자 필터(특정 확장자만 남기기) 및 폴더 전용 필터 슬롯을 갈아끼울 수 있도록 구성했다.
- 결과: 껍데기 코드 변경 0줄로 트리 항목 필터 슬롯을 갈아끼워 특정 확장자만 남기는 것과 폴더만 남기는 동작을 완전히 분리할 수 있다.
- 검증: test_slots.js 및 test_phase_five.py에서 슬롯 교체 후 항목 필터링 결과 및 껍데기 수정 0줄 검증 통과.

### TE-024 — 행 선택 매핑 자리

- 무엇을 했나: SlotRegistry에 행 선택 매핑 슬롯(rowSelectMapping)을 구현하여 행 데이터 클릭 시 리소스 설명(kind, resource 등)을 반환하거나 열지 않음(null)을 돌려줄 수 있도록 정의했다.
- 결과: 껍데기 코드 변경 0줄로 파일 행에서만 열기, 폴더 행에서만 열기, 특정 조건에서 열지 않음(null) 매핑 동작을 자유롭게 갈아끼울 수 있다.
- 검증: test_slots.js 및 test_phase_five.py에서 파일/폴더 조건부 열기 매핑 및 껍데기 무수정 검증 통과.

### TE-025 — 보기 제공자 자리

- 무엇을 했나: SlotRegistry에 보기 제공자 슬롯(viewProvider)을 구현하여 리소스 종류별로 적절한 뷰 인스턴스/팩토리를 제공하고, 미등록 종류 발생 시 에러로 중단되지 않고 FR-37 오류 규약에 따라 unregisteredKind 알림 및 안전한 대체(폴백) 뷰를 반환하도록 했다.
- 결과: 두 종류에 서로 다른 뷰 컴포넌트가 연결되며, 미등록 종류의 탭이 열려도 앱이 중단 없이 정상 작동하고 알림이 기록된다.
- 검증: test_slots.js에서 복수 종류 뷰 제공 및 미등록 종류 폴백/알림 동작 검증 통과.

### TE-026 — 중복 정책 자리

- 무엇을 했나: SlotRegistry 및 TabManager에 중복 정책 슬롯(duplicatePolicy)을 구현하여 "기존 탭 재사용(reuse_existing)"과 "항상 새 탭(always_new)"을 지원하고, 가른 상태에서 판정 범위를 현재 조각(scope: 'pane')으로 둔 것과 전체 패널(scope: 'workspace')로 둔 것을 분기할 수 있게 했다.
- 결과: 조각 범위(pane)에서는 다른 조각에 이미 열린 리소스라도 새 조각에서 새 탭으로 열리고, 워크스페이스 범위(workspace)에서는 다른 조각에 있는 기존 탭을 찾아 활성화하는 서로 다른 동작이 껍데기 코드 변경 없이 수행된다.
- 검증: test_slots.js에서 중복 정책 모드(reuse vs always) 및 판정 범위(pane vs workspace) 차이 검증 통과.

### TE-027 — 여는 경로 자리

- 무엇을 했나: TabManager 및 app.js에 트리를 거치지 않고 직접 리소스 기술자를 넘겨 탭을 여는 독립 진입 경로(openDirectTab / openTab)를 확보하고, 트리 선택 커서 상태와 탭 열기 상태를 완전히 격리했다.
- 결과: 트리를 통하지 않고 열린 탭에서도 중복 정책, 고정(pin), 닫기(close), 반대쪽 패널 이동(moveTabToPane)이 트리로 연 탭과 완전히 동일하게 작동하며, 트리 커서는 전혀 움직이지 않는다.
- 검증: test_slots.js 및 test_phase_five.py에서 직접 열기 탭의 모든 라이프사이클 및 트리 커서 불변 검증 통과.

### TE-028 — 임의의 새 종류 붙이기 검증 경로

- 무엇을 했나: 껍데기 코드(shell/)에 사전에 정의되지 않은 완전히 새로운 종류 문자열(예: 'custom_data', 'arbitrary_kind')을 런타임에 등록하고 탭 생성, 미리보기, 고정, 패널 이동, 닫기 수명주기를 실행하는 검증 테스트를 구성했다.
- 결과: 껍데기 코드 수정 0줄로 임의의 새 종류가 정상적으로 탭으로 열리고 모든 탭 기능(미리보기, 고정, 이동, 닫기)이 완벽히 동작함을 입증했다. 또한 껍데기 JS 코드 전역에서 특정 종류 이름 리터럴과 종류 비교문이 0건인 무지 상태를 유지했다.
- 검증: test_phase_five.py의 임의 종류 수명주기 동작 테스트 및 껍데기 코드 무지 정적 분석 테스트 통과.

### TE-029 — 탐색기 머리글과 폭 조절

- 무엇을 했나: shell/app.js의 탐색기 머리글에 대문자 EXPLORER 구역명과 폴더 열기(btn-folder-open)·새로 읽기(btn-tree-refresh)·모두 접기(btn-collapse-all) 3개 버튼만 배치(더보기 버튼 제외)하고 브리지 choose_root 및 TreeModel의 refresh/collapseAll과 연동했다. 또한 스플리터 드래그를 통해 사이드바 폭을 변경하고(최소 140px 보장) 사이드바 접힘 시 보기 영역 폭이 0보다 큼을 보장하도록 shell.css와 레이아웃을 구성했다.
- 결과: 머리글에 3개 버튼만 존재하고 스플리터로 폭 조절이 자유로우며, 사이드바가 접혀도 보기 영역이 찌그러지지 않고 정상 공간을 유지한다.
- 검증: test_tree.js 내 머리글 3버튼 존재 및 더보기 부재 검사, 최소 140px 클램프 및 CSS 접힘 스타일 검증 통과.

### TE-030 — 트리 겉모습과 정렬

- 무엇을 했나: shell/shell.css에 FR-16의 아홉 가지 외형 규격(좌우 끝까지 닿는 배경 강조, 깊이당 8px 들여쓰기, 5×5 꺾쇠 회전 및 단말 행 감춤, 깊이별 디렉토리·단말 아이콘 x좌표 일치, HTML 특수문자 이스케이프, 포커스 시 1px 안쪽 테두리, 깊이 안내선, 디렉토리 본문색 및 단말 흐린색 구분, 긴 이름 말줄임 시 아이콘·twistie 폭 불변)을 완벽히 구현하고, shell/tree.js에 껍데기 종류 무지(FR-4)를 준수하는 directory/leaf 렌더러를 작성했다.
- 결과: 깊이 3 이상에서도 배경 강조의 좌측이 잘리지 않고 긴 이름이 넘쳐도 아이콘과 twistie의 정렬이 무너지지 않으며, 트리 포커스 시 안쪽 테두리가 정확히 그려진다.
- 검증: test_tree.js의 FR-16 스타일 토큰 및 특수문자 이스케이프 검사, test_phase_six.py 통과.

### TE-031 — 트리 지연 로딩과 기억

- 무엇을 했나: shell/tree.js의 TreeModel에 1단계 지연 로딩 및 캐싱을 구현하여 루트 선택 시 직하 한 단계만 읽고 펼치지 않은 하위 폴더의 읽기 요청을 0건으로 제한했다. 폴더를 펼칠 때만 list_children을 1회 호출하여 결과를 children 맵에 기억해두고, 접었다 다시 펼칠 때는 추가 호출 없이 기억을 재사용하도록 했다. 새로 읽기(refresh) 시에는 캐시를 비우고 다시 읽되 현재 펼침 상태(expanded Set)를 유지하도록 했다.
- 결과: 불필요한 재귀 탐색 없이 즉각적인 응답성을 확보하고, 새로 읽기 후에도 사용자의 폴더 펼침 구조가 그대로 보존된다.
- 검증: test_tree.js 내 루트 선택 직후 하위 폴더 요청 0건, 첫 펼침 1건, 재펼침 0건(캐시 적중), refresh 후 펼침 유지 및 재호출 1건 검증 통과.

### TE-032 — 트리 탐색 키 여섯 가지

- 무엇을 했나: shell/tree.js에 여섯 가지 탐색 키(ArrowDown·ArrowUp 펼쳐진 가시 행 기준 이동, ArrowRight 접힌 폴더 펼침 또는 첫 자식 이동, ArrowLeft 펼쳐진 폴더 접음 또는 부모 이동, Enter 디렉토리 토글 또는 단말 탭 열기, Home 첫 행 이동, End 마지막 행 이동)를 구현했다.
- 결과: 방향키와 Home/End 이동 시 탭이 하나도 열리거나 변경되지 않으며, 오직 열 수 있는 행에서 Enter(또는 클릭)할 때만 탭이 열리거나 고정된다.
- 검증: test_tree.js에서 열 수 있는 행 위로 방향키를 10번 연속 이동해도 탭 생성 수가 0으로 유지됨을 입증, 6가지 키 동작 전건 검증 통과.

### TE-033 — 트리 커서와 활성 탭 분리

- 무엇을 했나: shell/tree.js의 트리 커서(cursorPath)와 TabManager의 활성 탭(activeTab) 상태를 완전히 분리하여, 탭을 전환하거나 새 탭을 열어도 트리 커서가 따라가지 않고 접힌 폴더가 저절로 펼쳐지지 않도록 구현했다. 또한 상태 표시줄의 좌측 경로는 트리 커서가 아니라 활성 탭의 대상을 정확히 가리키도록 shell/app.js의 updateStatus를 연동했다.
- 결과: 트리 커서와 활성 탭이 독립적으로 작동하여 두 상태가 자유롭게 어긋날 수 있다.
- 검증: test_tree.js에서 탭 전환 후 트리 커서 불변 및 접힌 폴더 자동 펼침 방지 검증 통과.

### TE-034 — 트리 첫 진입 응답성 확보

- 무엇을 했나: 루트 디렉토리 진입 시 하위 전체 항목을 순회하지 않고 오직 직하 1단계(루트 바로 아래 항목)만 로드하도록 지연 로딩 아키텍처를 고정했다.
- 결과: 루트 직하 항목이 20개로 같고 전체 항목 수가 100개인 소형 트리와 10,000개 이상인 대형 트리에서 첫 진입 시간 중앙값 비율이 2배를 넘지 않음을 달성했다.
- 검증: test_phase_six.py의 test_first_entry_responsiveness_benchmark(100개 vs 10,020개 벤치마크 5회 측정 중앙값 비율 및 하위 읽기 요청 0건) 통과.

### TE-035 — 프레임리스 창과 창 제어

- 무엇을 했나: shell/app.js에 프레임리스 창 제어 버튼(최소화·최대화 토글·닫기)을 브리지 메서드와 연동하고, hostWindowState 알림 수신 시 최대화/복원 버튼 아이콘을 동기화하도록 구현했다. shell/shell.css에 drag-region 및 버튼류 no-drag 속성을 반영했다.
- 결과: 최대화 토글이 창 상태를 번갈아 바꾸고 창 밖에서 최대화/복원되어도 버튼 표시가 즉시 따라오며 창 드래그가 정상 작동한다.
- 검증: test_shell_phase_seven.js 및 test_phase_seven.py 통과.

### TE-036 — 메뉴 줄과 상태 표시줄

- 무엇을 했나: shell/app.js에 File · View · Help 3벌 메뉴와 팝오버를 구현하고 바깥 클릭 시 닫히도록 구성했다. 팝오버는 자신이 속한 메뉴 버튼의 왼쪽 끝(left: 0)에 맞춰 메뉴마다 서로 다른 위치에 열린다. 상태 표시줄 우측에는 D-23 형식(이름 · 버전 · 빌드일자 · 갈래 이름)을 표시하고 세로 띠 토글을 연결했다.
- 결과: 세 메뉴가 독립된 자리에서 올바르게 열리고 닫히며 상태표시줄 정보 4종이 규격대로 완벽히 표시된다.
- 검증: test_shell_phase_seven.js 내 메뉴 팝오버 스타일/위치 및 D-23 정규식 검증 통과.

### TE-037 — 미리보기 탭과 고정 탭

- 무엇을 했나: shell/tab_model.js 및 shell/app.js에 미리보기 탭(이탤릭체 라벨)과 고정 탭(일반 라벨, border-radius: 0 고정)을 구현했다. 패널마다 미리보기 탭은 최대 1개로 유지되며 다른 대상을 미리보기로 열면 기존 탭을 대체한다. 더블클릭 또는 Enter 시 고정 탭으로 승격되며, 트리를 거치지 않고 직접 연 탭(FR-9)에서도 동일한 규칙이 동작하도록 했다.
- 결과: 미리보기 탭이 패널당 1개로 엄격히 관리되고 고정 탭 승격 및 직접 열기 탭의 일관성이 완벽히 보장된다.
- 검증: test_shell_phase_seven.js 내 미리보기 대체, 고정 승격, 직접 열기 탭 대조 검증 통과.

### TE-038 — 보기 영역 가르기와 탭 이동

- 무엇을 했나: shell/tab_model.js에 2분할(splitActivePane, unsplit), 2조각 상한 제한, 조각 내 탭 전원 닫힘 시 가르기 자동 해제 로직을 구현하고, shell/app.js에 활성 조각 밑줄 시각 표시(editor-pane.active .tab.active) 및 탭 이동(moveTabToPane)을 연동했다.
- 결과: 보기 영역이 최대 2조각으로 가르고 풀리며, 탭을 반대쪽으로 옮겨도 보기 인스턴스가 파괴/재생성되지 않고 영속 유지된다.
- 검증: test_shell_phase_seven.js 내 2조각 상한, 반대쪽 이동 후 뷰 인스턴스 보존, 조각 탭 소진 시 자동 가르기 해제 검증 통과.

### TE-039 — 조합키 열한 가지

- 무엇을 했나: shell/app.js에 껍데기가 예약한 11가지 단축키(F11 Zen모드, Escape 메뉴닫기/Zen해제, Ctrl+O 폴더열기, Ctrl+W 활성탭닫기, Ctrl+B 사이드바토글, Ctrl+\ 에디터분할, F5 새로읽기, F6 탭이동, Tab/Shift+Tab 초점순환, Ctrl+Tab/Ctrl+Shift+Tab 탭순환)를 등록하고, 그 외의 조합키는 껍데기가 가로채지 않고 보기에 투과 전달되도록 구성했다.
- 결과: 열한 가지 조합키가 대응 메뉴/버튼과 100% 동일한 결과를 내며 불필요한 단축키 침범이 없다.
- 검증: test_shell_phase_seven.js 내 11개 예약 조합키 존재 및 동작 매핑 검증 통과.

### TE-040 — 설정 보존

- 무엇을 했나: shell/app.js에 persistShell 및 initializeSettings를 구현하여 테마 · 아이콘 테마 · 탐색기 폭 · 사이드바 접힘 · 상태표시줄 표시 상태를 호스트에 보존하고 앱 시작 시 복원하도록 했다. 단, 열린 탭 목록은 의도적으로 설정에 담지 않아 앱 재시작 시 항상 0개 탭으로 시작되도록 격리했다.
- 결과: 화면 표시 상태는 재시작 후 그대로 유지되고 열린 탭은 0개로 안전하게 리셋된다.
- 검증: test_shell_phase_seven.js 내 설정 스키마 및 탭 미보존 검증 통과.

### TE-041 — CLI 인자 진입점

- 무엇을 했나: host_pywebview/app.py의 cli_root 및 host_electron/host/main.js의 resolveInitialRoot에 CLI 디렉토리 인자 처리 로직을 구현했다. 유효한 디렉토리 경로가 인자로 전달되면 해당 디렉토리를 루트로 열고, 없는 경로이거나 파일 경로이면 기본 동작(마지막 루트 또는 알림)으로 폴백하도록 했다.
- 결과: 두 갈래 모두 실행 명령 뒤에 폴더 경로를 넘기면 즉시 해당 루트로 창이 실행된다.
- 검증: test_phase_seven.py 내 Python Bridge 및 Node handleBridge 단위 테스트 통과.

### TE-042 — 파일 프리셋

- 무엇을 했나: presets/file/preset.js를 만들어 갈아끼우는 자리 셋을 채웠다. 트리 항목 자리는 파일과 폴더를 모두 표시하고, 행 선택 매핑 자리는 파일 행만 파일 탭으로 매핑하며 폴더 행에는 null(열지 않음)을 돌려준다. 중복 정책 자리는 같은 주소면 기존 탭을 쓰되 판정 범위를 조각(pane)으로 둔다. 어느 프리셋을 쓸지는 presets/active.js의 한 줄이 정하고, 껍데기는 그 이름표만 따라 installActivePreset()으로 끼운다.
- 결과: FR-32 표의 파일 프리셋 행(파일과 폴더 · 파일 행 → 파일 탭 · 조각 안에서 판정)과 어긋난 항목이 0건이다. presets/active.js의 값을 folder로 바꿔도 shell/ 아래 변경 파일이 0건이다.
- 검증: tests/test_presets.js에서 세 자리의 값을 FR-32 표와 1:1 대조하고, TreeModel에 실제로 끼워 폴더 행 클릭 시 탭 0건 · 파일 행 클릭 시 탭 1건(kind='file')을 확인했다. 교체 스크립트로 active.js만 바꾼 뒤 shell/ 전 파일을 바이트 대조해 변경 0건임을 확인했다.

### TE-043 — 폴더 프리셋

- 무엇을 했나: presets/folder/preset.js를 만들어 같은 자리 셋을 반대 값으로 채웠다. 트리 항목 자리는 폴더만 남기고, 행 선택 매핑 자리는 폴더 행만 폴더 탭으로 매핑하며 파일 행에는 null을 돌려준다. 중복 정책 자리는 판정 범위를 패널(panel)로 둔다 — 좌우 패널에서 서로 다른 폴더를 여는 앱이 같은 폴더를 양쪽에 두 번 열지 않게 하기 위해서다.
- 결과: FR-32 표의 폴더 프리셋 행과 어긋난 항목이 0건이다. 두 프리셋의 판정 범위가 실제로 다른 결과를 낸다 — 가른 상태에서 같은 주소를 반대쪽 조각에 열면 조각 판정은 새 탭(2개), 패널 판정은 기존 탭 재사용(1개)이 된다.
- 검증: tests/test_presets.js에서 폴더 프리셋의 트리에 파일 행이 0건임을 TreeModel 위에서 확인하고, 파일 행 클릭 시 탭 0건 · 폴더 행 클릭 시 탭 1건(kind='folder')을 확인했다. 판정 범위 차이는 TabManager를 가른 상태로 만들어 pane/panel 두 경우의 탭 수를 대조했다.

### TE-044 — 참조 보기 둘

- 무엇을 했나: presets/file/reference_view.js와 presets/folder/reference_view.js를 만들어 각 프리셋이 보기 제공자 자리에 기본으로 얹도록 했다. 파일 참조 보기는 탭 제목(파일 이름)만 출력하고, 폴더 참조 보기는 대상 주소만 출력한다. 둘 다 브릿지를 참조하지 않으며 readFile · listDir · fetch를 쓰지 않는다. 보기 수명주기 계약(createView → mount · activate · deactivate · resize · destroy)을 그대로 따른다.
- 결과: 파일 참조 보기의 출력이 파일 이름 한 건뿐이고 내용을 읽는 요청이 0건이다. 폴더 참조 보기의 출력이 주소 한 건뿐이다. 참조 보기를 다른 것으로 등록해 바꿔도 껍데기 코드는 바뀌지 않는다.
- 검증: tests/test_presets.js에서 읽기 호출 횟수를 세는 MockBridge를 물려 두고 보기를 붙인 뒤 readCalls가 0인지 확인했고, 출력 문자열이 이름/주소와 정확히 같은지 대조했다. 폐기 뒤 mount가 화면을 고치지 않는 것도 확인했다. 소스에 읽기 통로(readFile · listDir · fetch · bridge)가 들어 있지 않은지 문자열 검사로 함께 막았다.

### TE-045 — 실물 앱 요구 셋 시험용 앱

- 무엇을 했나: `markdown_browser`의 요구 셋(확장자 필터 · 트리를 거치지 않고 새 탭 · 경로를 인자로 받아 시작)을 모두 끼운 시험용 앱을 `tests/fixture_app_fr34.js`에 만들고 `tests/test_fr34_app.js`로 판정했다. 확장자 필터는 트리 항목 자리(FR-5), 새 탭 버튼과 시작 인자는 여는 경로 자리(FR-9)에 얹었고, 시작 인자는 계약의 `call_domain`으로만 받는다 — 연결 계층은 파일 인자를 루트로 삼지 않고 기본 동작으로 떨어지므로(FR-27) 앱이 그 인자를 직접 받아 자기 탭을 연다.
- 결과: 셋 모두 동작하고, 앱을 만들고 돌리는 동안 `shell/` 아래 전 파일이 바이트 단위로 그대로다. 확장자 필터는 폴더를 남겨 하위로 내려갈 수 있고 하위 폴더에서도 같은 규칙이 걸린다. 여는 경로로 연 탭은 트리로 연 탭과 같은 규칙(중복 정책 · 고정 · 닫기 · 패널 이동)으로 다뤄지고 트리 커서를 움직이지 않는다.
- 선행 결함: **여는 경로 자리가 실제로는 쓸 수 없는 상태였다.** `renderEditor()`가 `innerHTML`로 화면을 통째로 다시 만들어, 앱이 얹은 버튼이 탭을 한 번 열자마자 사라졌다(실물 Electron에서 `newTabButtonOnScreen: false`로 확인). 껍데기에 `notifyRendered()`를 더해 `shell-rendered` 통보만 보내게 했다 — 무엇을 다시 붙일지는 앱이 정하고 껍데기는 앱의 UI를 알지 못한다. 이 껍데기 수정은 특정 앱을 위한 것이 아니라 FR-9의 자리를 쓸 수 있게 만드는 것이고, 그 뒤로는 앱 쪽 변경만으로 끝난다.
- 검증: Node 8종 + Python 36건 전건 통과. 실물 Electron에서 `shell/index.html`을 띄우고 앱을 끼워 셋이 모두 도는 것을 확인했다(확장자 필터 `[docs, a.md]` · 버튼으로 연 탭 `untitled.md` 고정 · 시작 인자로 연 탭 `notes.md` · 다시 그린 뒤 버튼 생존 `true`). 단언이 무는지 역검증했다 — 확장자 필터 무력화 · `call_domain` 우회 · 커서 이동 가능성 · 껍데기 누수 넷 모두 해당 단언이 실패한다.

### TE-046 — 갈래 삭제 대칭성

- 무엇을 했나: `tests/test_branch_symmetry.js`로 "지운 뒤에도 남은 쪽이 필요한 것을 모두 갖고 있는가"를 기계로 판정하고, 실제로 한쪽을 지운 사본 둘을 만들어 반대쪽을 띄워 확인했다. 시험은 일곱 가지를 본다 — 공유물이 갈래 폴더 밖에 한 벌로 있는지, `shell/`·`presets/`에 특정 호스트에만 있는 파일이 0건인지, 껍데기에 실행 환경 이름(pywebview·electron)과 API(ipcRenderer·BrowserWindow·require(·__dirname 등)가 0건인지, 두 갈래가 같은 껍데기와 디자인 파일을 가리키는지, 두 갈래가 서로를 코드로 참조하지 않는지, 각 갈래가 혼자 실행할 것을 갖췄는지, 두 갈래가 저장소 루트를 자기 위치에서 대칭으로 계산하는지.
- 결과:
  1. `host_pywebview/`를 지운 사본에서 Electron 갈래가 떴다. 껍데기 전체가 정상으로 그려지고 상태 표시줄이 `Explorer Templates v0.1 (2026-09-06) - Electron`을 표시한다. stderr 0줄.
  2. `host_electron/`을 지운 사본에서 pywebview 갈래가 떴다. 같은 화면이 그려지고 상태 표시줄이 `- PyWebView`를 표시한다. stderr 0줄.
  3. 두 화면의 구성(다섯 구역 · 탐색기 머리글 세 버튼 · 창 제어 다섯 · 상태 표시줄)이 서로 같다. 실행 환경 이름만 다르다.
  4. 지운 쪽을 찾는 코드가 없어 어느 쪽을 지워도 결과가 같다.
- 부수 확인: 설정 파일을 추적에서 뺀 뒤라 Electron 사본에는 `settings.json`이 없었는데, 기본값(`theme: gray`)으로 정상 기동했다. 복사 직후 바로 도는 상태임이 실물로 확인됐다.
- 안내 문서 두 편(`host_*/README.md`)이 서로를 설명으로 언급한다. 실행 의존이 아니라 판정에서 뺐지만, 한쪽을 지우면 남은 README의 그 문장이 없는 폴더를 가리키게 된다. TE-049(안내 문서 마감)에서 다룰 몫으로 남긴다.
- 검증: Node 9종 + Python 36건 전건 통과. 임시 사본은 `node_modules`를 정션으로 연결해 만들었고, 정리할 때 정션을 먼저 끊어 원본 `node_modules`(65개 항목)가 그대로임을 확인했다. 단언이 무는지 역검증했다 — 껍데기에 실행 환경 이름 · 갈래 폴더 참조 · 실행 환경 API를 각각 넣으면 해당 단언이 실패한다.

### TE-047 — v0.1 검사 32건 대응 시험 작성

- 무엇을 했나: `tests/test_v01_coverage.js`에 NFR-6의 13개 묶음을 그대로 옮겨 32건을 구현하고, 묶음 수(13)와 건수 합(32)과 실제로 돌린 검사 수(32)를 함께 대조하게 했다. 묶음별 건수가 SPEC의 표와 어긋나면 시험이 스스로 멈춘다. NFR-6의 나머지 조건인 "껍데기의 공개 동작 중 시험이 없는 것이 0건"도 같은 파일에서 판정한다.
- 결과: 13개 묶음 32건 전건 통과. 껍데기 공개 동작 27개 중 시험이 없는 것 0건.
- 드러난 것 둘:
  1. **껍데기 공개 동작 27개 중 14개에 시험이 한 건도 없었다** — 테마 · 아이콘 테마 · Zen 모드 · 상태 표시줄 · 설정 보존 · 탭 닫기와 패널 이동이 전부 이름조차 시험에 없었다. 기존 시험들이 마크업과 CSS 문자열만 훑고 실제 동작을 부르지 않았기 때문이다. `tests/test_shell_public_api.js`를 새로 써서 실제 `shell/index.html`을 띄우고 `window.__shell`로 27개를 모두 구동한다(15개 검사). app.js가 IIFE라 require로 부를 수 없어 Electron 위에서 돈다.
  2. **메뉴 팝오버 그림자에 생 색값이 있었다** — `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)`. FR-28의 "색 값이 토큰을 거치지 않고 직접 적힌 곳 0건"을 어긴 것이고 v0.1과도 다르다. v0.1과 같은 `0 4px 16px var(--color-bg)`로 고쳤다.
- 바로잡은 것: 처음 쓴 검사 넷이 과했다. 껍데기의 정렬 검사가 펼침 경로 정렬까지 잡았고, 오류 구분값 이름을 `OUT_OF_ROOT`로 잘못 적었으며(실제 계약은 `ROOT_ESCAPE`), 아이콘 검사가 상표(icon-app)와 마스크의 white/black까지 위반으로 봤고, 그림문자 검사가 v0.1부터 쓰던 메뉴 체크 표시(U+2713)를 잡았다. 넷 다 판정을 정확하게 좁혔다.
- 검증: Node 10종 + Python 36건 전건 통과, Electron 공개 동작 시험 통과. 단언이 무는지 역검증했다 — 그림자 생 색값 복원 · 본문 대비 낮추기 · 계약 밖 동작 호출 셋 모두 해당 검사가 실패한다.

### TE-048 — 겉보기 대조 — v0.1과 두 갈래

- 무엇을 했나: `tests/test_appearance_parity.js`(Electron)로 NFR-1의 측정표를 우리 껍데기와 v0.1(`_archive/260904_explorer_templates`)에서 각각 읽어 대조했다. 대조 조건은 사양대로 창 안쪽 1280x800 · 배율 100% · 세 테마 각각이다. 항목은 다섯 구역의 좌표와 크기, 탭 줄·상태 표시줄·탐색기 머리글의 높이, 트리 행 높이·들여쓰기·아이콘 크기, 글꼴 이름·크기·굵기·행간, 색 여덟 가지다.
- 결과:
  1. **v0.1과 59개 항목 × 세 테마 = 어긋난 값 0건.**
  2. 두 갈래 대조도 0건이다. 같은 껍데기와 같은 디자인 파일을 가리키는 것은 TE-046이 판정했고, pywebview 갈래를 띄워 구역 경계를 픽셀로 읽어 Electron 측정값과 같은지 확인했다 — 세로 띠 0~30 · 탐색기 30~310 · 손잡이 310~315 · 보기 315~ 로 일치한다.
  3. 요소 누락 · 크기 0 · 구역 겹침이 세 테마 모두 0건이다.
- 고친 것: 탐색기와 보기 영역 사이 **손잡이가 v0.1과 달랐다.** 폭이 4px이고 `margin-left: -2px`로 탐색기 위에 걸쳐 있어 보기 영역의 시작 x가 312였다(v0.1은 315). v0.1과 같은 5px · 음수 여백 없음 · `background: var(--color-surface)`로 고쳤다. 이 한 곳이 어긋난 값 2건의 원인이었고, 고친 뒤 0건이 됐다.
- **미해결 — 사양 안의 충돌 (사용자 판단 필요)**: NFR-3의 판정 방법이 "강조색 위 글자"의 대비를 계산하라고 하는데, gray 테마에서 그 값이 **3.78**(폴더 행)과 **3.04**(파일 행)로 4.5에 못 미친다. 그런데 선택 행 색(`--color-selected: #6f7884`)은 v0.1에서 그대로 옮겨 온 값이고 색 토큰 전체가 v0.1과 완전히 같음을 확인했다. 즉 **NFR-3을 만족시키려면 색을 바꿔야 하고, 색을 바꾸면 NFR-1(v0.1과 같아야 한다)과 제약 7(값을 새로 정하지 않는다)을 어긴다.** v0.1도 같은 값을 쓰므로 v0.1 역시 이 조합에서는 4.5 미만이다. NFR-3이 값을 못박은 것은 "본문 글자/배경 4.5"와 "큰 글자·주요 구분선 3"뿐이고 강조색 위 글자에는 기준값을 주지 않았다. 시험은 명문 기준 둘만 판정하고(세 테마 모두 통과) 강조색 위 값은 재어서 보고만 한다. 어느 쪽을 고칠지는 SPEC을 쓰는 사람이 정해야 한다.
- 검증: 세 테마 각각에서 명문 기준을 모두 충족한다 — 본문 15.80/9.55/16.58, 보조 10.19/7.69/11.59, 구분선 3.03/4.90/4.27. 손잡이를 고치기 전에는 v0.1 대비 2건이 어긋났고 고친 뒤 0건임을 같은 시험으로 확인했다.

### TE-049 — 마우스 도달 경로 점검과 안내 문서 마감

- 무엇을 했나: `tests/test_reachability.js`로 NFR-5의 열두 가지 각각에 눌러서 닿는 자리가 있는지, 껍데기가 FR-25의 열한 가지만 예약하는지, 갈래별 안내 문서의 조합키 표가 그 목록과 어긋나지 않는지를 판정한다.
- 드러난 것: **두 갈래의 README에 조합키 표가 아예 없었다.** 안내 문서가 없으니 어긋난 항목을 셀 수도 없는 상태였다.
- 조치:
  1. 두 README에 FR-25의 열한 가지를 담은 표를 넣었다. 각 줄에 "하는 일"과 "눌러서 닿는 자리"를 함께 적어 조합키로만 닿는 기능이 없다는 것(NFR-5)이 문서에서 바로 보이게 했다. `F6`(탭을 반대쪽 조각으로)도 메뉴 경로와 함께 덧붙였다.
  2. TE-046에서 넘겨 둔 상호 참조를 없앴다. 두 README가 서로를 "`host_electron` 갈래와 공유한다"처럼 이름으로 부르고 있어, 한쪽을 지우면 남은 문서가 없는 폴더를 가리켰다. "갈래 폴더 밖에 한 벌로 두고, 다른 갈래가 함께 있다면 같은 파일을 가리킨다"로 고쳤다. 대칭성 시험(`test_branch_symmetry.js`)의 참조 검사도 `.md`를 포함하도록 넓혀 재발을 막았다.
- 결과:
  1. 열두 가지 모두 눌러서 닿는다 — 폴더 열기(머리글 버튼·메뉴) · 트리 접고 펼치기(행·접기 표시) · 탭 열기(트리 행) · 탭 닫기(탭의 X·메뉴) · 탐색기 접기(세로 띠 버튼·메뉴) · 가르기(탭 줄 버튼·메뉴) · Zen(창 제어 버튼·메뉴) · 테마(창 제어 버튼·메뉴) · 아이콘 테마(메뉴) · 최소화 · 최대화 · 닫기(창 제어 버튼).
  2. 껍데기가 예약한 Ctrl 조합은 `o` · `w` · `b` · `\` 넷뿐으로 목록 안이다. 목록 밖의 조합을 새로 예약하면 시험이 막는다.
  3. 두 README의 조합키 표가 서로 같고 FR-25와 어긋난 항목이 0건이다.
- 검증: Node 12종 전건 통과. 시험은 문서가 목록 밖의 조합키를 약속해도 잡고, 두 표가 달라져도 잡는다.

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

### 상태표시줄 우측 식별 정보 D-23 규격 적용 ({프로그램 이름} {버전} ({빌드일자}) - {갈래 이름})

- 요청: 상태표시줄 우측 구분자가 슬래시가 아니므로 파일 탐색기 v0.1 내용을 확인하여 올바른 형식으로 수정 요청.
- 조치: v0.1 DECISIONS.md의 D-23 및 shell/app.js의 getRuntimeText 정의(`{프로그램 이름} v{major}.{minor} ({빌드일자}) - {갈래 이름}`)를 확인하고, shell/app.js의 formatRuntimeText를 `${appName} ${appVer} (${buildDate}) - ${hostName}` 형식으로 정확히 수정함. 기본 마크업도 동일하게 동기화함.
- 결과: pywebview에서는 "Explorer Templates v0.1 (2026-09-06) - PyWebView", Electron에서는 "Explorer Templates v0.1 (2026-09-06) - Electron", 브라우저 단독 로드 시에는 "Explorer Templates v0.1 (2026-09-06) - Browser"로 D-23 규격대로 정확히 표시됨.
- 검증: D-23 포맷 정규식 및 mock 런타임 데이터 출력 검증 통과.

### 탭 상단 모서리 라운딩 제외 (직각 탭 디자인 적용)

- 요청: 탭 상단 모서리의 라운딩은 이 템플릿 프로젝트에서는 하지 않는 것으로 결정.
- 조치: v0.1의 상단 6px 라운딩(`border-radius: var(--radius) var(--radius) 0 0`)을 채택하지 않고, 탭 영역(`.tab`) 모서리를 직각(`border-radius: 0`)으로 디자인하도록 결정 사항을 기록하고 향후 탭 스타일링 작업에 반영함.
- 결과: 탭 상단 곡률 없이 깔끔한 직각 형태의 탭으로 렌더링되도록 규칙 고정.
- 검증: PROGRESS 기록 및 향후 탭 구현 시 CSS 규칙 준수 예정.

### UI 실행 시 빈 화면(White screen) 결함 긴급 수정

- 요청: 현재 UI를 실행하니 빈 화면만 뜨는데, 이 단계의 결과물이 이렇게 나오는 것이 맞는지 확인 요청.
- 원인: 
  1. `shell/app.js`에서 `tabManager.on(...)`을 호출하였으나 `TabManager`에는 `subscribe()`만 존재하여 `TypeError: tabManager.on is not a function` 런타임 예외가 발생함.
  2. 이로 인해 `app.js` 실행이 도중에 중단되어 `window.__shell` 등록 및 `DOMContentLoaded` 진입점 실행에 도달하지 못함.
  3. 또한 스크립트 실행 시점에 `document.readyState`가 이미 `complete` 또는 `interactive`인 경우 `DOMContentLoaded` 이벤트가 지나가서 `renderShell()`이 호출되지 않는 문제 존재.
- 조치:
  1. `shell/tab_model.js`의 `TabManager` 클래스에 이벤트 이름별 리스너 등록 메서드 `on(eventName, listener)`를 공식 지원하도록 추가.
  2. `shell/app.js`에서 `tabManager.on` 및 `tabManager.subscribe` 양쪽 모두 지원하도록 방어 로직 적용.
  3. `shell/app.js` 초기화 진입점에서 `document.readyState === 'loading'`이 아닐 경우 즉시 `initApp()`(테마 적용, renderShell, 단축키 등록)을 호출하도록 보완.
- 결과: pywebview, Electron, 웹 브라우저(file:// 및 http://) 등 모든 런타임 환경에서 메뉴바, 세로띠, 탐색기 패널, 탭/에디터 영역, 상태표시줄 5개 구역이 즉시 정상 렌더링됨.
- 검증:
  1. Puppeteer를 이용한 브라우저 환경 DOM 및 스크린샷 렌더링 검증(hasShellRoot, hasMenuBar, hasActivityRail, hasSidebar, hasWorkspace, hasStatusBar 모두 true).
  2. `tests/test_shell_phase_seven.js`에 `TabManager.prototype.on` 및 readyState 초기화 단위 테스트 추가 및 통과.
  3. Python 36건 및 Node 단위 테스트 전체 정상 통과.

### 탭 열기 시 ViewManager mountView 누락 및 기본 뷰 렌더링 결함 수정

- 요청: 탭 구현 및 작동이 정상 작동되어야 하는 것이 맞는지 확인 요청.
- 원인:
  1. `shell/app.js`의 `mountActiveViews()`에서 `viewManager.mountView(slotEl, activeTab)`을 호출하도록 작성되어 있었으나, `shell/view_lifecycle.js`의 `ViewManager`에 `mountView` 메서드가 선언되어 있지 않아 탭을 열 때 `TypeError: viewManager.mountView is not a function` 런타임 오류 발생.
  2. 또한 미등록 뷰 종류(기본 뷰 스텁) 상태일 때 컨테이너 내부에 아무런 텍스트가 마운트되지 않아 탭이 열려도 본문이 빈 화면처럼 보였음.
- 조치:
  1. `shell/view_lifecycle.js`의 `ViewManager`에 `mountView(parentElement, tab)` 메서드를 구현하여 `getOrCreateView`와 `activateView`를 원자적으로 연결.
  2. 기본 뷰 스텁의 `mount(el)`에서 등록되지 않은 뷰 종류라도 탭 제목·종류(kind)·경로(path) 정보가 포함된 안내 뷰를 안전하게 렌더링하도록 개선 (FR-7, FR-35 규약 준수).
- 결과:
  1. 트리 노드 클릭, 단축키, 메뉴 등을 통해 탭을 열었을 때 탭 바에 탭이 정상 생성되고 해당 탭의 뷰 컨테이너가 에디터 슬롯에 정상 마운트됨.
  2. 탭 활성화, 고정(더블클릭), 닫기(X 버튼/Ctrl+W), 에디터 분할(Ctrl+\), 탭 이동(F6) 등 모든 탭 관련 사용자 상호작용이 온전하게 동작함.
- 검증:
  1. Puppeteer 브라우저 환경에서 `openTab`, 에디터 2분할, 다중 탭 생성, 탭 바 요소 및 뷰 슬롯 내부 렌더링 검증 통과 및 스크린샷 확인.
  2. `tests/test_shell_phase_seven.js`에 `ViewManager.prototype.mountView` 단위 테스트 추가 및 통과.
  3. 전체 단위 테스트 통과 확인.

### 트리 및 탭 헤더 더블클릭 시 탭 고정(Pin) 기능 결함 수정

- 요청: 탭 고정 기능이 제대로 되지 않음 (한 번 클릭 시 해당 탭에 파일 이름이 나오고, 더블클릭 시 고정되는 기능이 동작하지 않음).
- 원인:
  1. `shell/tree.js`의 `openRowTab(row, isPreview = true)`에서 더블클릭 시 `isPreview = false`로 호출되지만, `this.tabManager.openTab` 호출 시 `pinned` 플래그를 전달하지 않아 기본값인 `pinned: false`가 적용됨. 이로 인해 `TabManager.prototype.openTab`의 `if (pinned && existing.preview)` 조건이 거짓이 되어 기존 미리보기 탭이 영원히 고정 탭으로 승격되지 못함.
  2. 탭 헤더(`.tab`) 클릭 핸들러에서 매번 `renderEditor()`를 호출하여 DOM 요소를 재생성함에 따라 브라우저의 네이티브 `dblclick` 이벤트가 DOM 요소 교체로 인해 유실되는 문제 발생.
- 조치:
  1. `shell/tree.js`의 `openRowTab`에서 `pinned: !isPreview`를 명시적으로 전달하여, 더블클릭 시 `pinned: true, preview: false`로 탭이 즉시 고정 승격되도록 수정.
  2. `shell/app.js`에서 탭 헤더 및 트리 행 클릭 핸들러에 연속 클릭(350ms) 타이머 감지 로직을 추가하여 DOM 재생성과 무관하게 더블클릭 고정 동작을 100% 보장.
  3. 이미 활성화된 탭 클릭 시 불필요한 `renderEditor()` DOM 파괴를 방지하여 네이티브 `dblclick` 이벤트도 안정적으로 유지.
- 결과:
  1. 트리에서 파일을 한 번 클릭하면 해당 파일 이름의 미리보기 탭(`tab preview`, 기울임꼴)이 열리고, 다른 파일을 클릭하면 기존 미리보기 탭이 새 파일로 교체됨 (탭 수 1개 유지).
  2. 트리의 파일 또는 탭 헤더를 더블클릭하면 즉시 고정 탭(`pinned: true, preview: false`, 일반 글씨체)으로 승격됨.
  3. 고정된 상태에서 다른 파일을 클릭하면 기존 탭이 닫히지 않고 보존되며 새 미리보기 탭이 추가되어 탭 수가 늘어남.
- 검증:
  1. Puppeteer 환경에서 5단계 시나리오(파일1 미리보기 -> 파일2 미리보기 교체 -> 파일2 더블클릭 고정 승격 -> 파일1 클릭 시 탭 2개 유지 -> 탭 헤더 더블클릭 고정 승격) 자동화 테스트 전건 통과.
  2. `tests/test_shell_phase_seven.js`에 `TreeModel.prototype.openRowTab` 고정 승격 단위 테스트 추가 및 통과.
  3. Python 36건 및 Node 전체 단위 테스트 정상 통과.

### 탐색기 트리 키보드 탐색(FR-18) 포커스 유실 및 전역 키 연동 결함 수정

- 요청: 탐색기의 키보드가 전혀 작동하지 않는 문제 해결 요청.
- 원인:
  1. 키보드 방향키(`ArrowDown` 등)를 누르면 `handleKeyDown` -> `notifyRender` -> `renderTree()`가 실행되어 `#tree-root` DOM 요소가 새로 교체됨. 이때 이전 요소가 파괴되면서 브라우저 포커스가 즉시 `document.body`로 튕겨나가, 첫 키 입력 직후 포커스가 유실되어 이후 키 입력이 전혀 먹히지 않았음.
  2. 트리 탐색 키보드 이벤트 리스너가 오직 `#tree-root` 요소에만 걸려 있어, 사용자가 사이드바의 다른 영역을 클릭하거나 창이 초기 로드된 상태(`activeElement`가 `body`)에서는 방향키 입력이 완벽하게 무시되었음.
- 조치:
  1. `shell/app.js`의 `renderTree()`에서 재렌더링 이전 포커스 상태를 기억(`hadFocus`)하여, 새로 생성된 `#tree-root` 요소에 `treeRoot.focus()`를 즉시 복원하도록 구현.
  2. `shell/app.js`의 `initKeyboardShortcuts()` 전역 `keydown` 리스너에 트리 탐색 키(ArrowDown, ArrowUp, ArrowRight, ArrowLeft, Enter, Home, End) 위임 핸들러를 추가하여, 포커스가 `tree-root`에 있지 않더라도 사이드바/트리 활성 상태일 때 방향키 입력이 트리 모델로 안전하게 전달되도록 보장.
  3. 사이드바 영역 클릭 시에도 `treeRoot.focus()`가 자동 연결되도록 인터랙션 보완.
- 결과:
  1. 마우스로 트리를 클릭하지 않고 창을 띄운 직후에도 방향키로 즉시 트리 탐색 가능.
  2. 방향키를 연속으로 연타하거나 길게 눌러도 포커스가 유지되어 커서가 부드럽게 위아래로 이동함.
  3. Enter 키를 누르면 선택된 파일이 즉시 고정 탭으로 열림.
- 검증:
  1. Puppeteer 브라우저 환경에서 포커스가 `body`인 상태에서 document 레벨 ArrowDown 2회, Enter, ArrowUp 연속 전송 시 커서 이동 및 탭 열기 정상 작동 자동화 검증 완료.
  2. `tests/test_tree.js` 및 `tests/test_shell_phase_seven.js`, Python 36건 전체 단위 테스트 통과.

### 방향키 2개씩 이동 버그 및 스크롤바 미연동 결함 수정

- 요청: 상/하 방향키로 이동 시 2개씩 이동하며, 화살표로 이동 시 스크롤바와 연동되지 않는 문제 해결 요청.
- 원인:
  1. **2개씩 이동 원인**: `treeRoot` 요소의 `keydown` 이벤트 리스너에서 `e.stopPropagation()`을 호출하지 않아 이벤트가 상위 `document`의 전역 키다운 리스너로 버블링됨. 결과적으로 `treeModel.handleKeyDown(e)`가 1회 키 입력당 2번 연속 실행되어 커서가 항상 2칸씩 점프함.
  2. **스크롤바 미연동 원인**: 커서 이동 시 화면 밖으로 벗어난 행에 대해 DOM 스크롤 조정(`scrollIntoView`)이 호출되지 않아, 스크롤바가 움직이지 않고 선택 행이 뷰포트 아래로 가려짐.
- 조치:
  1. `shell/app.js`의 `bindTreeEvents()` 내 `treeRoot` 키다운 핸들러에 `e.stopPropagation()`을 추가하고, `initKeyboardShortcuts()` 전역 리스너에서 `activeEl.id === 'tree-root'`일 때는 중복 실행을 스킵하도록 이중 차단하여 **정확히 1개씩 이동**하도록 수정.
  2. `shell/app.js`의 `renderTree()` 끝에서 선택된 행(`.tree-row.selected`)에 대해 `selectedRow.scrollIntoView({ block: 'nearest', inline: 'nearest' })`를 호출하여, 커서가 화면 밖으로 이동할 때 스크롤바가 자동으로 연동되어 따라 내려가거나 올라오도록 구현.
- 결과:
  1. 상/하 방향키를 누를 때마다 커서가 정확히 1개 행씩 위아래로 이동함.
  2. 항목이 많아 스크롤바가 생긴 상태에서 방향키로 계속 아래로 이동하면 스크롤바가 부드럽게 따라 내려가며, `Home`/`End` 키 입력 시에도 맨 위/맨 아래로 즉시 스크롤 연동됨.
- 검증:
  1. Puppeteer 브라우저 환경에서 ArrowDown 1회당 1행씩 이동(`file_0 -> file_1 -> file_2`) 검증 통과.
  2. 80개 항목 fixture에서 50회 연속 아래 이동 시 `scrollTop: 412`로 스크롤 연동 확인, `Home` 키 시 `scrollTop: 0` 복귀 및 `End` 키 시 `scrollTop: 1072` (맨 아래) 연동 완벽 검증.
  3. Node 및 Python 전체 단위 테스트 정상 통과.

### 키보드 Enter 2단계(1회 미리보기 이탤릭, 2회 고정 승격) 동작 구현

- 요청: 키보드 엔터를 한 번 누르면 마우스 1회 클릭처럼 선택(이탤릭 표시의 미리보기 탭)되고, 선택된 파일에서 한 번 더 엔터를 눌러야 고정(Pinned)되도록 동작 수정 요청.
- 원인: `shell/tree.js`의 `handleKeyDown` 내 `case 'Enter'`에서 파일 행일 때 무조건 `openRowTab(currentRow, false)`(즉 `pinned: true`)로 호출되어 1회 엔터로 바로 고정되었음.
- 조치:
  1. `shell/tree.js`의 `case 'Enter'`를 수정하여, 현재 활성 탭이 해당 파일의 미리보기 탭(`isCurrentPreview`)인지 확인.
  2. 아직 미리보기 탭이 아니면 1회째 Enter로 `openRowTab(currentRow, true)`(미리보기 열기, `preview: true, pinned: false`)를 호출하여 이탤릭 표시의 미리보기 탭 생성.
  3. 이미 미리보기 탭으로 열려 있는 상태에서 동일 파일에 다시 Enter를 누르면 `openRowTab(currentRow, false)`(고정 승격, `pinned: true, preview: false`)를 호출하여 고정 탭으로 승격.
  4. `shell/tab_model.js`의 `openTab`에서 승격 발생 시 `tab-pinned` 이벤트를 발생시키고, `shell/app.js`에서 키 입력 후 에디터 뷰 및 상태표시줄을 즉시 렌더링하도록 연동.
- 결과:
  1. 파일 노드에서 <kbd>Enter</kbd> 1회 입력 시 마우스 1회 클릭과 동일하게 미리보기 탭(`preview`, 이탤릭체 라벨)으로 열림.
  2. 같은 파일에서 <kbd>Enter</kbd> 1회 더 입력 시 마우스 더블클릭과 동일하게 고정 탭(`pinned`, 보통 글씨체 라벨)으로 승격됨.
  3. 다른 파일로 이동 후 <kbd>Enter</kbd>를 누르면 이전 고정 탭은 유지되고 새 파일이 미리보기 탭으로 추가되어 탭 수가 늘어남.
- 검증:
  1. Puppeteer 환경에서 1회 엔터(preview: true, pinned: false) -> 2회 엔터(preview: false, pinned: true) -> 다른 파일 엔터(고정 탭 유지 + 새 탭 2개) 자동화 검증 완료.
  2. `tests/test_tree.js` 및 전체 단위 테스트 통과.

### 왼쪽 방향키(ArrowLeft) 다층 폴더 역탐색 단계별 상위 이동 결함 수정

- 요청: 키보드로 오른쪽 방향키로 폴더를 열고 하위 폴더로 계속 연 다음 왼쪽 방향키를 누르면 현재폴더 -> 상위 폴더 -> 상위 폴더 순으로 단계별로 이동해야 하는데 이렇게 되지 않는 문제 해결 요청.
- 원인:
  1. Windows 환경에서 파일 시스템 경로 구분자로 백슬래시(`\`)가 사용될 때, 기존 `getParentPath` 함수가 슬래시(`/`) 기준으로 부모 경로를 반환하여 실제 `row.path`(백슬래시 포함)와 일치하지 않아 `rows.findIndex`가 부모를 찾지 못함.
  2. 기존 `case 'ArrowLeft'` 구현에서 펼쳐진 폴더가 아닌 경우 단순 경로 문자열 분할에만 의존하여 상위 이동을 처리함에 따라, 다층 깊이의 평탄화된 트리 목록(`visibleRows`)에서 직속 상위 폴더로 즉시 포커스가 단계별로 점프하지 못했음.
- 조치:
  1. `shell/tree.js`의 `getParentPath(path)` 함수에서 원본 경로의 구분자(백슬래시 vs 슬래시)를 감지하여 반환값에도 동일한 구분자를 보존하도록 수정.
  2. `case 'ArrowLeft'` 처리 로직을 체계적인 단계별 조건으로 개선:
     - 1단계: 현재 행이 펼쳐진 디렉토리(`currentRow.is_dir && this.expanded.has(currentRow.path)`)이면 폴더를 접음 (`expanded.delete`).
     - 2단계: 단말(파일 또는 접힌 하위 폴더)이고 `currentRow.depth > 0`인 경우, `rows` 배열을 현재 인덱스 이전부터 역순 순회하여 직속 상위 깊이(`row.depth === currentRow.depth - 1`)를 가진 부모 행을 찾아 커서를 해당 부모로 즉시 이동.
     - 3단계: 일치하는 행을 찾지 못할 경우 백슬래시 보존 `getParentPath`를 fallback으로 적용.
- 결과:
  1. 깊은 하위 폴더 및 파일에 위치한 상태에서 <kbd>ArrowLeft</kbd>를 누르면 직속 상위 부모 폴더로 커서가 1단계씩 올라감.
  2. 부모 폴더가 펼쳐져 있는 상태에서 <kbd>ArrowLeft</kbd>를 한 번 더 누르면 폴더가 접히고, 접힌 상태에서 다시 <kbd>ArrowLeft</kbd>를 누르면 그 상위 부모 폴더로 이동하여 단계별 역탐색(하위 파일 -> 하위 폴더 -> 접힘 -> 상위 폴더 -> 접힘 -> 루트)이 매끄럽게 동작함.
- 검증:
  1. Puppeteer 브라우저 환경에서 4단계 깊이(`folder1\subfolder\deep\file.txt`) 구조를 생성하고, `ArrowRight`로 하위 진입 후 `ArrowLeft` 연속 입력 시 `file.txt -> deep (펼쳐짐) -> deep (접힘) -> subfolder (펼쳐짐) -> subfolder (접힘) -> folder1 (펼쳐짐) -> folder1 (접힘) -> root` 순서로 완벽하게 단계별 역탐색됨을 자동화 검증.
  2. `tests/test_tree.js`에 다층 트리 단계별 `ArrowLeft` 역탐색(하위 파일 -> 부모 폴더 이동 -> 폴더 접힘 -> 루트 이동) 단위 테스트 케이스 추가 및 전체 통과.
  3. Node 전체 단위 테스트 6종 통과 확인.

### 메뉴바 우측 상단 Zen 모드 및 테마 변경 아이콘 추가 (D-10, NFR-5)

- 요청: Zen 모드 / 테마 변경 아이콘이 메뉴바 우측 상단에 있어야 함.
- 원인:
  1. `explorer_templates` v0.1 및 NFR-5 마우스 도달 가능성 요구사항에 따라 메뉴바 우측 창 제어 영역(`window-controls`)에 Zen 모드 토글 버튼 및 색상 테마 전환 버튼이 배치되어야 하나, 신규 껍데기 마크업에서 창 제어 3버튼(최소화/최대화/닫기)만 선언되어 있었음.
  2. 테마 변경 버튼의 동적 상태 아이콘(white: 빈 원, gray: 반달 원, dark: 꽉 찬 원) 렌더링 및 클릭 순환 로직 누락.
- 조치:
  1. `shell/app.js`의 `renderShell()` 내 `.window-controls`에 `btn-win-zen` (Zen 모드 토글, `icon-zen`) 및 `btn-win-theme` (색상 테마 변경, `getThemeIconSvg`) 버튼 2종을 추가.
  2. `shell/app.js`에 테마별 상태 아이콘 생성 함수 `getThemeIconSvg(theme)` 및 `updateThemeButtonIcon()`을 구현하여 테마 전환(클릭/메뉴/설정 복원) 시 실시간 반영.
  3. `shell/app.js`의 `bindShellEvents()`에 `btn-win-zen` 클릭(Zen 모드 토글) 및 `btn-win-theme` 클릭(gray -> dark -> white 순환) 리스너 연결.
  4. `shell/shell.css`에 `.theme-icon` 채움 및 선 스타일과 `.window-btn.active` 스타일 추가.
  5. `tests/test_shell_phase_seven.js`에 Zen/Theme 버튼 존재, SVG 심볼 및 FR-4 무지 제약 통과 검증 테스트 추가.
- 결과:
  1. 메뉴바 우측 상단에 `Zen 모드` (네 모서리 꺾쇠) 및 `테마 변경` (동적 원형 아이콘) 버튼이 창 제어 3버튼 좌측에 깔끔하게 배치됨.
  2. 테마 변경 버튼 클릭 시 `gray (반달) -> dark (채운 원) -> white (빈 원) -> gray` 순서로 즉시 순환하며 아이콘과 앱 전체 테마가 동기화됨.
  3. Zen 모드 버튼 클릭 시 즉시 Zen 모드로 전환(편집 영역만 남김)되고, <kbd>Escape</kbd> 또는 <kbd>F11</kbd> 입력 시 정상 복귀됨.
- 검증:
  1. Puppeteer 브라우저 환경에서 실제 SVG 로드 및 스크린샷 렌더링 검증 완료 (`Zen Mode -> Color Theme -> Minimize -> Maximize -> Close` 5개 버튼 우측 상단 정렬 확인).
  2. 브라우저 내 버튼 클릭을 통한 테마 순환(`gray -> dark -> white -> gray`) 및 Zen 모드 토글 / Escape 복원 동작 테스트 통과.
  3. `tests/test_shell_phase_seven.js` 및 전체 단위 테스트 통과 (FR-4 무지 제약 위반 0건 확인).
### 진행 상태 점검 — 잔여 task 9건 확인 (P8·P9)

- 요청: 현재 과제 진행 상태 확인.
- 조치: backlog(CLI 관리 목록)·`PLAN.md`·`PROGRESS.md`·`git status`를 대조해 Phase별 완료 현황을 집계했다. 코드·문서 수정은 하지 않았다.
- 결과:
  1. 50건 중 41건 done, 9건 todo. P1~P7 전건 완료, 남은 것은 P8(TE-042·043·044)과 P9(TE-045~050)이다.
  2. 작업 트리의 유일한 변경인 `host_pywebview/settings.json`은 앱 실행으로 생긴 런타임 상태(`root_path`·`icon_theme`·`recent_folders`)이며 소재 변경이 아니다. 되돌릴지 커밋할지는 사용자 판단 대기 중으로 손대지 않았다.
- 검증: `git status --short`로 변경 파일이 위 1건뿐임을 확인했고, backlog의 status·category 집계가 `PLAN.md`의 Phase 구분과 일치함을 확인했다.

### 탭 마우스 패널 간 드래그 이동 지원 및 스플릿 해제 시 탭 정상 닫기

- 요청:
  1. 탭 스플릿이 생긴 상태에서 F6 단축키로는 선택된 탭이 좌우로 이동하는데, 마우스로는 이동이 안 되는 문제 해결.
  2. 2개의 탭(스플릿 창)에서 열린 탭을 닫으면, 그대로 열린 파일 탭도 함께 사라져야 하는데 탭이 없어지면서 다른 탭 영역으로 이동해 버리는 문제 해결.
- 원인:
  1. 마우스 탭 이동: `shell/app.js`의 `.tab` 요소에 `draggable="true"` 속성과 `dragstart`/`dragend` 이벤트가 없었고, `.editor-pane` 및 `.tab-list` 컨테이너에 HTML5 `dragover`, `dragleave`, `drop` 이벤트 리스너가 누락되어 마우스 드래그를 통한 패널 간 탭 이동이 지원되지 않았음.
  2. 스플릿 탭 닫기/해제 시 타 패널 이동: `shell/tab_model.js`의 `unsplit(keepPaneId)` 함수에서 닫히는 패널의 탭들을 `this.closeTab(t.id)`로 닫지 않고 `this.moveTabToPane(t.id, keepPaneId)`를 호출하여 잔여 패널로 강제 이동시키고 있었음. 이로 인해 스플릿 해제 시 파일 탭이 닫히지 않고 반대쪽 탭 바로 옮겨가는 결함이 발생함.
- 조치:
  1. `shell/tab_model.js`: `unsplit(keepPaneId)`에서 대상 패널 외의 탭(`otherTabs`) 순회 시 `this.moveTabToPane` 대신 `this.closeTab(t.id)`를 호출하도록 수정하여, 스플릿 닫기 시 해당 탭과 연동된 보기 인스턴스(`destroyView`)가 온전히 파기되고 탭이 깨끗이 사라지도록 처리.
  2. `shell/app.js`:
     - `renderEditor()`에서 `.tab` 요소에 `draggable="true"` 속성 부여 및 `.tab-close`에 `draggable="false"` 설정.
     - `bindEditorEvents()`에 `dragstart`, `dragend`, `dragover`, `dragleave`, `drop` 이벤트 핸들러를 구현하여, 마우스로 탭을 드래그하여 반대쪽 패널에 드롭 시 `tabManager.moveTabToPane(tabId, paneId)`가 호출되고 즉시 재렌더링되도록 구현.
     - 탭 닫기 버튼(`.tab-close`) 드래그 시 이벤트 전파 차단(`dragstart.preventDefault`).
  3. `shell/shell.css`: `.tab.dragging`(반투명), `.editor-pane.drag-target`(점선 외곽선), `.tab-list.drag-target`(호버 배경) 드래그 시각 스타일 추가.
  4. `tests/test_shell_phase_seven.js`: TE-038에 `unsplit` 시 탭이 잔여 패널로 이동하지 않고 온전히 닫히는지 검증하는 테스트 및 `app.js` 내 마우스 드래그 앤 드롭 속성·이벤트 검증 추가.
- 결과:
  1. 스플릿 분할 상태에서 탭을 마우스로 드래그하여 반대쪽 패널로 끌어다 놓으면 <kbd>F6</kbd> 키보드 이동과 동일하게 패널 간 즉시 이동함.
  2. 스플릿 창에서 탭을 닫거나 스플릿 버튼을 눌러 스플릿을 해제하면, 해당 탭이 반대쪽 탭 영역으로 이동하지 않고 깨끗이 함께 닫힘.
- 검증:
  1. Puppeteer 브라우저 환경에서 탭 드래그 앤 드롭(`File1.txt` main -> pane-1 -> main) 및 시각 피드백 클래스(`dragging`, `drag-target`) 실시간 동작 검증 완료.
  2. Puppeteer 브라우저 환경에서 스플릿 해제 및 탭 개별 닫기 시 반대쪽 패널로의 탭 유입 없이 깨끗이 닫히는 동작 검증 완료.
  3. `node tests/test_shell_phase_seven.js` 및 전체 Node 단위 테스트 5종 통과 (FR-4 무지 제약 위반 없음).

### 구현 상태 재점검 — 시험 전건 실행과 탭 순서 바꾸기 요구 충돌 확인

- 요청: 탐색기·탭 영역 기본 기능의 현재 구현 상태 재점검, 그리고 마우스로 열린 탭 순서를 바꾸는 기능 요구.
- 조치: Node 시험 6종을 전부 실행하고, 조합키 예약 목록을 FR-25와 대조했으며, 요구된 탭 순서 바꾸기가 `SPEC.md` 비목표 9번과 충돌함을 확인했다. 코드는 고치지 않았다.
- 결과:
  1. Node 시험 6종(bridge_electron · shell_phase_seven · slots · tab_model · tree · view_lifecycle) 전건 통과.
  2. Python 시험 7종 36건 전건 통과. 인터프리터는 `C:/winpython/WPy64-31180_cpu/python-3.11.8.amd64/python.exe`(3.11.8)를 쓴다 — PATH의 `python.exe`는 WindowsApps 스텁이라 쓸 수 없다.
  3. 껍데기가 예약한 조합키는 F11 · Esc · Ctrl+O · Ctrl+W · Ctrl+B · Ctrl+\ · F5 · F6 · Tab/Shift+Tab · Ctrl+Tab/Ctrl+Shift+Tab로 FR-25 목록과 어긋난 항목이 없다.
  4. 탭을 끌어 순서를 바꾸는 기능은 `SPEC.md` 비목표 9번이 "만들지 않는다"로 명시하고 있어 충돌을 보고했고, **사용자가 이번 버전에서 고려하지 않기로 결정**했다. SPEC 비목표 9번은 그대로 유지되며 구현하지 않는다.
- 검증: `tests/test_*.js` 6종 각각 실행해 전건 통과 메시지 확인, `shell/app.js`의 전역 keydown 분기를 SPEC FR-25 337~352행과 1:1 대조.

### 계획 외 개선 — Python 시험 실행 경로 확정과 test_phase_seven 임포트 결함 수정

- 요청: Python 환경은 `C:/winpython`의 cpu 환경을 쓰면 된다는 안내.
- 원인: `tests/test_phase_seven.py`가 `host_pywebview.host.bridge`를 임포트하는데, 저장소 루트를 `sys.path`에 넣지 않아 스크립트를 직접 실행하면 `ModuleNotFoundError: No module named 'host_pywebview'`로 1건이 깨졌다. 다른 시험(`test_bridge_pywebview.py`)은 각자 `sys.path.insert`를 하고 있어 드러나지 않았다.
- 조치: `tests/test_phase_seven.py`에 `sys`를 임포트하고 `PROJECT_ROOT`가 `sys.path`에 없으면 앞에 넣도록 3줄을 추가했다. 임포트 순서도 알파벳순으로 맞췄다.
- 결과:
  1. Python 시험 7종 36건이 전건 통과한다(bridge_pywebview 9 · parity 6 · phase_three 5 · phase_four 4 · phase_five 3 · phase_six 4 · phase_seven 5).
  2. 이 저장소의 Python 인터프리터는 `C:/winpython/WPy64-31180_cpu/python-3.11.8.amd64/python.exe`(3.11.8)다. PATH의 `python.exe`는 WindowsApps 스텁이라 exit 49로 죽으므로 쓰지 않는다.
- 검증: 위 인터프리터로 `tests/test_*.py` 7종을 각각 실행해 전부 `OK`와 exit 0을 확인했고, `Ran N tests` 합이 36임을 확인했다. Node 시험 6종도 함께 재실행해 전건 통과를 확인했다.

### 계획 외 개선 — 갈아끼우는 자리 셋이 껍데기에 배선되지 않은 결함 수정

- 요청: 다음 Phase(P8 프리셋) 착수. 착수 과정에서 자리가 실제로는 불리지 않는 것을 발견해 먼저 고쳤다.
- 원인: Phase 5는 done으로 닫혀 있었으나 `tests/test_slots.js`가 SlotRegistry를 **단독으로만** 시험해서 껍데기와의 배선이 한 번도 확인되지 않았다. 실제로는 셋이 끊겨 있었다.
  1. `shell/tree.js`의 `openRowTab`이 없는 이름 `slots.mapRowSelect`를 불렀다(실제 이름은 `mapRowSelection`). 조건이 언제나 거짓이라 **행 선택 매핑 자리(FR-6)가 통째로 죽어 있었고**, 껍데기 안의 fallback이 대신 판정하고 있었다.
  2. 같은 함수가 `if (!row || row.is_dir) return;`으로 폴더 행을 무조건 막았다. 자리가 무엇을 돌려주든 폴더 행은 탭을 열 수 없어 FR-32의 "폴더 행 → 폴더 탭"이 원천 불가였다. `shell/app.js`의 행 클릭 처리도 `is_dir: false`를 하드코딩해 넘기고 있었다.
  3. `SlotRegistry.registerDuplicatePolicy`가 어디에서도 읽히지 않았다. **중복 정책 자리(FR-8)도 배선이 없어** 프리셋이 판정 범위를 정할 수 없었다.
- 조치:
  1. `shell/tree.js` — `mapRowSelection`으로 이름을 맞추고, `is_dir` 하드 차단을 걷어내 종류 판정을 자리에 위임했다. 자리가 없을 때의 기본값만 껍데기에 남겼다.
  2. `shell/tree.js` Enter 처리 — 펼치고 접는 것(트리 탐색)과 탭을 여는 것(행 선택 매핑)을 분리해 폴더 행에서 둘이 함께 일어날 수 있게 했다. 파일 프리셋에서는 자리가 null을 돌려주므로 기존 동작 그대로다.
  3. `shell/app.js` — 행 클릭·더블클릭이 실제 `is_dir` 값을 그대로 넘기고 모든 행을 자리에 위임하도록 고쳤다. 폴더 행의 펼침·접힘은 그대로 유지된다.
  4. `shell/app.js` — 중복 정책을 자리에서 먼저 찾고 없으면 종류 등록표로 떨어지는 registry를 TabManager에 물렸다.
- 결과:
  1. 같은 껍데기 코드 위에서 파일 프리셋은 파일 행만, 폴더 프리셋은 폴더 행만 탭을 연다. 프리셋 교체 시 `shell/` 변경 파일이 0건이다.
  2. 프리셋이 등록한 판정 범위(조각/패널)가 실제 탭 열기 결과를 바꾼다.
  3. 껍데기의 종류 무지가 유지된다 — `'file'` · `'folder'` · `'terminal'` 문자열이 `shell/` 다섯 파일 어디에도 0건이다.
- 검증: `tests/test_presets.js`를 새로 써서 SlotRegistry 단독이 아니라 **TreeModel·TabManager에 실제로 끼운 상태**로 판정하게 했다(이번 결함이 단독 시험만 있어서 새어 나갔기 때문이다). Node 7종 + Python 36건 전건 통과, `presets/active.js` 한 줄 교체 후 `shell/` 바이트 대조 변경 0건, pywebview 앱 실기동으로 오류 0줄을 확인했다.

### 계획 외 개선 — Phase 8 적대적 검증에서 나온 지적 넷 반영

- 요청: Phase를 닫기 전 reviewer의 적대적 검증. 완료 조건 다섯의 실체는 충족했으나 제약 위반 둘과 시험 구멍 둘이 나왔다.
- 원인과 조치:
  1. **껍데기에 종류 이름이 새어 들어감 (FR-4, 제약 5)** — `shell/index.html`이 `../presets/file/...`, `../presets/folder/...`를 직접 걸어 껍데기가 프리셋을 이름으로 불렀다. `presets/active.js` 하나만 걸도록 바꾸고, active.js가 고른 이름표로 소재 경로를 만들어 파서 단계에서 이어 붙이게 했다(`document.write`, 빌드 단계 없음 — 제약 3). 이제 고른 프리셋의 소재만 로드된다.
  2. **토큰을 거치지 않은 값 (FR-28, 제약 7)** — `.reference-view`에 `padding: 16px · font-size: 13px · line-height: 1.6`을 직접 적었고, 그중 13px과 1.6은 토큰 집합에 없는 **새로 정한 값**이었다. `var(--space-4) · var(--font-size) · var(--line-height)`로 바꿨다.
  3. **중복 정책 배선이 시험 밖에 있었음 (FR-8)** — 자리와 탭 모델을 잇는 어댑터가 `shell/app.js`의 IIFE 안에 갇혀 노출도 시험도 되지 않았다. `SlotRegistry.createSlotBackedRegistry(slots, base)`로 꺼내 껍데기가 그것을 쓰게 하고, 시험이 같은 함수를 거쳐 판정하도록 고쳤다.
  4. **항진명제 단언 둘** — 참조 보기의 읽기 요청 0건 단언이 그 보기가 브릿지를 쥔 적이 없어 언제나 참이었고, 보기 교체 뒤 `app.js` 파일을 대조하는 단언도 아무도 그 파일을 쓰지 않아 언제나 참이었다. 전자는 전역에 읽기 통로(bridge·fetch) 스파이를 깔고 수명주기 전 구간에서 건드리는지 보게, 후자는 ViewManager의 실제 해석 경로로 갈아끼운 보기가 화면에 나오는지 보게 바꿨다.
- 결과:
  1. `shell/` 아래 전 파일(index.html 포함)에 종류 이름 문자열이 0건이다. 껍데기가 거는 프리셋 소재는 `active.js` 하나뿐이다.
  2. 참조 보기 스타일이 tokens.css에 있는 토큰만 쓴다.
  3. 프리셋이 자리에 등록한 판정 범위가 어댑터를 거쳐 실제 탭 열기 결과를 바꾼다 — 어댑터를 빼면 결과가 달라지는 것으로 배선이 살아 있음을 증명한다.
- 검증:
  1. 고친 곳을 하나씩 되돌리는 역검증으로 시험이 실제로 잡는지 확인했다 — `mapRowSelection` 오타 복원 · index.html에 종류 이름 재삽입 · 토큰 대신 13px 재삽입 셋 모두 해당 단언이 실패한다.
  2. Node 시험 7종 + Python 시험 7종 36건 전건 통과.
  3. Electron으로 `shell/index.html`을 실제 로드해 `document.write` 로드가 동작하고 고른 프리셋의 소재만 실리는 것을 확인했다(script 목록 대조). `active.js`를 folder로 뒤집어 같은 확인을 반복했고 껍데기는 그대로였다.
  4. **두 갈래 실행 확인(FR-39)** — pywebview 갈래를 실제로 띄워 파일 프리셋의 트리(파일과 폴더 함께 표시)를 확인하고, `AGENTS.md` 행을 눌러 미리보기 탭이 열리며 참조 보기가 **파일 이름만** 출력하는 것을 화면으로 확인했다. Electron 갈래는 위 3번으로 확인했다.

### 계획 외 발견 — 아이콘 테마가 고르기만 되고 화면에 반영되지 않는다 (미해결)

- 요청: "아이콘 테마는 사용불가능한가요?"
- 조사 결과: 고른 값이 저장·복원만 되고 **화면은 바뀌지 않는다.**
  1. `shell/app.js`의 `setIconTheme()`이 `currentIconTheme` 대입과 `persistShell()`만 하고 끝난다. 다시 그리지도, 아이콘 소재를 바꾸지도 않는다.
  2. `shell/tree.js`가 아이콘 주소를 모듈 로드 시점 상수(`DIR_CLOSED_ICON` 등)로 굳혀 두어 어떤 테마를 골라도 `icons.svg`의 단색 한 벌만 나온다.
  3. 자산은 이미 들어와 있다 — `shared/design/icons/seti/`(theme.json + 폰트), `shared/design/icons/vscode-icons/`(SVG + theme.json), 합계 8.3MB(D-10으로 반입). 그런데 **어떤 코드도 이 파일들을 참조하지 않는다**(`grep -r 'vscode-icons\|seti\|theme.json\|codicon'` → 0건). 확장자 → 아이콘 매핑 로직이 통째로 없다.
  4. 사용자의 `host_pywebview/settings.json`에 `icon_theme: "vsicons"`가 들어 있다 — 골랐는데 아무 일도 일어나지 않은 상태였다.
- 판정: FR-30 본문("파일 타입 아이콘은 Simple · VS Code Built-in · VS Code Icons 셋 중 고를 수 있어야 한다")을 충족하지 못한다. 다만 FR-30의 **판정 방법**은 "세 아이콘 테마가 모두 고를 수 있고, 고른 값이 다시 켠 뒤 유지되는지"까지만 요구해서 현재 구현으로도 통과한다. 이 문장이 미구현을 잡지 못했다.
- 결정: 사용자가 P9 마감 전에 구현하기로 정했다. 매핑 코드를 어디에 둘지(껍데기 / 갈아끼우는 자리 / `shared/design`의 순수 함수)는 FR-4·제약 5·D-3과 충돌하지 않는 자리를 골라야 해서 판단 대기 중이다.
- 검증: `grep`으로 자산 참조 0건을 확인했고, `setIconTheme` 본문과 `tree.js`의 아이콘 상수를 직접 읽어 반영 경로가 없음을 확인했다. 아직 고치지 않았다.

### 계획 외 기록 — 검증 실행이 host_pywebview/settings.json을 바꾼다

- 조치: 위 P8 검증으로 pywebview 앱을 두 번 띄우면서 `root_path`가 `D:\projects\tab_explorer_templates`로 바뀌고 `recent_folders`에 항목이 늘었다. 사용자가 고른 `theme: dark` · `icon_theme: vsicons`도 함께 들어 있다.
- 결과: 소재 변경이 아니라 실행으로 생기는 런타임 상태(FR-26이 보존하기로 한 값)라 커밋에서 제외했다. 되돌릴지 커밋할지는 사용자 판단 대기 중이다.
- 검증: `git status --short`로 커밋 뒤 남은 변경이 이 파일 1건뿐임을 확인했다.
- 이후: 검증으로 앱을 띄울 때마다 같은 파일이 같은 이유로 다시 바뀐다. 같은 내용을 반복해 적지 않는다. `.gitignore`로 옮길지 커밋할지 정해지면 그때 한 번 적는다.

### 계획 외 개선 — v0.1 대조로 탭 안쪽 여백 · 탐색기 머리글 · 메뉴바 우측 아이콘 간격 교정

- 요청: v0.1(`_archive/260904_explorer_templates`)의 탐색기 줄 간격 · 아이콘 인접 간격 · 탭 제목 간격을 확인하고, 그중 **탭 안쪽 여백 · 탐색기 머리글 아이콘 사이 간격 · 메뉴바 우측 아이콘 여백만** 맞출 것.
- 대조 결과: 탐색기 트리는 v0.1과 이미 완전히 일치했다(행 높이 22 · 좌우 여백 8 · 들여쓰기 깊이×8 · 아이콘→이름 4 · 접기표시→아이콘 0). 어긋난 곳은 탭 영역과 아이콘 버튼 쪽이었다.
- 조치:
  1. `.tab`의 안쪽 여백을 `0 var(--space-2)`(양쪽 8px)에서 v0.1과 같은 `0 2px 0 var(--space-1)`(왼쪽 4px · 오른쪽 2px)로 바꿨다.
  2. `.window-btn`과 `.sidebar-actions .icon-btn`에 `min-width: 0; padding: 0 var(--space-1)`을 얹어 30px 최소폭을 풀었다(v0.1 structure.css 40행). 버튼 폭이 30 → 24px가 된다.
  3. `.sidebar-actions`에 `display: flex`를 더했다(v0.1 83행). 이것이 빠져 있어 `display: block` 아래에서 inline-flex 버튼 사이에 공백 문자가 끼어 **3.9px가 벌어지고 있었다.** 머리글 아이콘 간격이 어긋난 실제 원인이다.
- 결과: Electron으로 계산값을 읽어 v0.1 규칙과 대조했다.
  - 창 제어 버튼 · 머리글 버튼: 폭 24px · `min-width 0` · 좌우 여백 4px, 버튼 사이 간격 **0px**(양쪽 모두)
  - 탭: `padding-left 4px` · `padding-right 2px` · 높이 26px · 최대폭 180px
- 검증: Electron에서 `getBoundingClientRect`와 `getComputedStyle`로 실측했고, `.sidebar-actions` 수정 전 3.9 → 수정 후 0으로 바뀌는 것을 확인했다. pywebview 갈래를 띄워 화면으로도 확인했다. Node 7종 + Python 36건 전건 통과.
- 남긴 것(요청 범위 밖): `.tab-list { gap: 2px }`는 v0.1의 `var(--space-1)`(4px)과 다르고 토큰도 거치지 않는다. `.tab-bar`의 위쪽 여백 4px 누락, v0.1에 없는 `border-bottom`, 닫기 버튼 구조 차이도 남아 있다. 요청이 세 항목뿐이라 손대지 않았고 TE-048에서 판정할 몫이다.

### 계획 외 개선 — 세로띠 구분선 잘림 · 아이콘 둘레 배경 · 상태 표시줄 절대 경로

- 요청: (1) 세로띠의 탐색기 토글과 상태표시줄 토글 아이콘 배경이 달라 세로띠 우측 테두리선이 잘린다 (2) 아이콘 내부 색깔도 세로띠 영역과 차이가 난다 (3) 상태 표시줄 경로는 절대 경로여야 한다.
- 원인:
  1. `.activity-rail`이 `border-right: 1px`로 구분선을 그려 내용 영역이 29px가 되는데 `.rail-btn`은 30px이었다. 실측하면 버튼이 **x = −0.5px**에 앉아 오른쪽 0.5px가 구분선 위를 덮었다. 같은 반픽셀 좌표 때문에 `tokens.css`의 아이콘 선명도 규칙(아이콘 상자는 정수 좌표에 놓여야 한다)도 함께 깨지고 있었다.
  2. `.rail-btn.active`가 `background: var(--color-hover)`를 깔고 두 버튼이 항상 `active`로 그려져, 세로띠 배경과 다른 색 상자가 아이콘 둘레에 상시로 남았다. v0.1은 세로띠 버튼에 `active` 상태 자체가 없고 배경을 hover에만 준다(`explorer_pywebview/shell/app.js` 407~408행, `structure.css` 34·37행).
  3. 연결 계층이 루트 경계를 지키려고 `os.path.relpath`로 **루트 기준 상대 경로**를 돌려주는데(`bridge.py` 134행), 상태 표시줄이 그 값을 그대로 출력하고 있었다.
- 조치:
  1. 구분선을 `border-right`에서 버튼 위에 얹는 `.activity-rail::after`(1px 절대 배치)로 바꿨다. 내용 영역이 30px 그대로라 버튼이 x = 0에 정확히 앉는다.
  2. `.rail-btn.active`에서 배경을 걷어내고 글자색만 남겼다. 배경은 `:hover`에만 붙는다.
  3. `shell/app.js`에 `toAbsolutePath()`를 더해 루트를 붙여 표시한다. 이미 절대 경로(드라이브 문자 · UNC · POSIX 루트)면 그대로 두고, 빈 경로와 `.`은 루트 자신으로 본다. 구분자는 루트의 것을 따른다.
- 결과: 실측으로 확인했다.
  - 세로띠 폭 30px 유지, 버튼 x = 0 · 폭 30px, 버튼 배경 `rgba(0,0,0,0)`
  - 구분선 픽셀을 x = 29에서 y = 50 · 62 · 200 · 400 · 600 · 745 · 758로 훑어 전부 `RGB(111,118,129)` — 두 토글 아이콘 줄에서도 끊기지 않는다
  - 탐색기 토글 둘레(x = 15, y = 62)가 세로띠 배경과 같은 `RGB(23,27,34)`
  - 상태 표시줄이 `D:\projects\tab_explorer_templates\CLAUDE.md`로 절대 경로를 표시한다
- 검증: `tests/test_shell_phase_seven.js`에 셋을 판정하는 시험을 더했다 — 세로띠가 `border-right`를 쓰지 않고 `::after`로 그리는지, `.rail-btn.active`에 배경이 없는지, 상태 표시줄이 `toAbsolutePath`를 거치는지. `toAbsolutePath` 자체도 Windows · UNC · POSIX · 루트 없음까지 여덟 경우로 시험한다. 고친 곳을 하나씩 되돌리는 역검증으로 세 시험이 실제로 잡는 것을 확인했다. Node 7종 + Python 36건 전건 통과, pywebview 갈래 화면 확인.

### 계획 외 발견 — progress-check 훅이 settings.json 때문에 매 턴 걸린다

- 무엇을 했나: 훅이 이번 세션에서 네 번 반복해 걸려 `.claude/hooks/progress-check.mjs`를 읽고 판정 조건을 확인했다.
- 원인: 훅은 "이번 세션에 바뀐 것"이 아니라 `git status --porcelain`, 즉 **작업 트리의 커밋 안 된 변경**을 본다. `docs/`와 `.claude/` 밖 파일이 더러운데 `PROGRESS.md`가 깨끗하면 막는다. `host_pywebview/settings.json`은 앱을 띄울 때마다 다시 쓰이는 런타임 상태라 항상 더럽고, 그래서 **작업을 제대로 기록한 뒤에도 계속 걸린다.** 기록 여부와 무관하게 걸리므로 훅이 막으려던 사고(코드만 고치고 기록을 안 남기는 것)를 판정하지 못하는 상태다.
- 참고: 훅 주석 스스로 이 상황을 예상하고 있다 — "프로젝트 성격에 따라 시끄러울 수 있다. 그때는 매처를 좁히거나 이 hook 을 뺀다. 빼기로 했다면 왜 뺐는지 DECISIONS.md 에 남긴다."
- 결과: 아직 고치지 않았다. 둘 중 하나를 사용자가 정해야 한다.
  1. `host_pywebview/settings.json`을 추적에서 빼고 `.gitignore`에 넣는다 — 근본 원인을 없앤다. FR-26이 이 파일을 "실행 파일 옆 한 파일"로 정했고, 템플릿을 복사해 쓰는 구조라 남의 `root_path`가 저장소에 딸려갈 이유가 없다.
  2. 훅 매처에서 `host_*/settings.json`을 뺀다 — 훅 주석이 제시한 방법이다. 파일은 계속 추적된다.
- 검증: 훅 소스를 직접 읽어 판정식(`touchedWork && !touchedProgress`)을 확인했고, 현재 작업 트리에서 더러운 파일이 `host_pywebview/settings.json` 1건뿐임을 `git status --short`로 확인했다.

### 계획 외 개선 — 실행 상태 파일 둘을 추적에서 뺐다

- 요청: 아이콘 테마는 적절한 단계에서 반영하고 계속 진행할 것. 앞서 제시한 세 갈래 중 추천안(추적 해제)으로 처리했다.
- 조치: `host_pywebview/settings.json`과 `host_electron/settings.json`을 `git rm --cached`로 추적에서 빼고 `.gitignore`에 넣었다. 두 갈래를 함께 처리해 대칭을 유지했다(FR-35).
- 결과:
  1. 작업 트리가 앱 실행만으로 더러워지지 않는다. progress-check 훅이 기록 여부를 제대로 판정할 수 있게 됐다.
  2. 파일 자체는 디스크에 남아 사용자가 고른 설정(`theme: dark` · `icon_theme: vsicons`)이 유지된다.
  3. 복사해 쓰는 템플릿에 남의 루트 경로가 딸려가지 않는다.
- 검증: 두 갈래의 설정 읽기 경로를 확인해 파일이 없으면 기본값을 쓰고 새로 만드는 것을 확인했고(`bridge.py` `_load_settings`, `main.js` `readSettings`), 임시 폴더에 Bridge를 세워 실제로 기본값 파일이 생성되는 것(`theme: gray` · `icon_theme: simple` · `root_path: ""`)을 확인했다. FR-26의 "설정 파일이 망가졌으면 기본값으로 떨어지고 앱은 계속 떠야 한다"와 어긋나지 않는다.

### 계획 외 개선 — 아이콘 테마 셋을 실제로 화면에 반영 (FR-30)

- 요청: 아이콘 테마가 고르기만 되고 화면이 바뀌지 않는 문제를 적절한 단계에서 반영할 것. TE-048(겉보기 대조) 착수 전에 처리했다.
- 원인: `setIconTheme()`이 값 저장만 하고 끝났고, `tree.js`가 아이콘 주소를 모듈 로드 시점 상수로 굳혀 두어 어떤 테마를 골라도 단색 한 벌만 나왔다. 반입해 둔 자산(seti · vscode-icons, 8.3MB)을 참조하는 코드가 0건이었다.
- 조치:
  1. `shared/design/icon_theme.js`를 새로 만들었다. 트리 행의 이름과 펼침 여부를 받아 "무엇을 어떻게 그릴지" 서술값 하나를 돌려준다 — `{ render: 'symbol' | 'glyph' | 'image', ... }`. 확장자 규칙과 테마 자료 구조를 이 한 곳이 갖는다. 자리 다섯을 늘리지 않고 디자인 파일 쪽에 두어 FR-4(껍데기의 종류 무지)와 D-3(자리는 다섯)을 둘 다 지켰다.
  2. `shell/tree.js`가 상수 대신 그 서술값대로 그린다. `shell/app.js`의 `setIconTheme()`이 자료를 읽고 다시 그리며, 저장된 값도 시작할 때 복원해 반영한다.
  3. `shell/shell.css`에 seti · codicon `@font-face`와 글리프 · 그림 아이콘 스타일을 더했다(v0.1 structure.css 104~118행과 같은 방식).
  4. 두 테마 모두 흔한 확장자(md · js · py 등)를 `languageIds`로 잇는데 그 표는 편집기가 대주는 것이라 테마 파일에 없다. 해석기에 확장자→언어 이름 표를 두어 다리를 놓았다. 이것이 없으면 가장 흔한 파일들이 전부 기본 아이콘으로 떨어져 고른 의미가 없다.
- 결과: 실물에서 세 테마가 서로 다르게 그려진다.
  - Simple `[icon-folder-open, icon-folder, icon-file × 3]`
  - VS Code Built-in `[codicon eaf7, codicon ea83, seti e04d, e07b, e051]`
  - VS Code Icons `[default_folder_opened.svg, folder_type_src.svg, file_type_markdown.svg, file_type_python.svg, file_type_js.svg]`
- 부수: 서술값의 필드 이름을 처음 `kind`로 두었더니 FR-4의 종류 비교 검사(`test_phase_six.py`)에 걸렸다. 검사를 느슨하게 하지 않고 필드 이름을 `render`로 바꿨다 — 리소스 종류가 아니라 그리는 방법이라 이름이 맞다.
- 검증: `tests/test_icon_theme.js`를 새로 써서 여섯 가지를 판정한다 — 세 테마 선택 가능 · 자료 없을 때 기본으로 떨어짐 · 세 테마가 다른 방식으로 그려짐 · 파일 타입마다 다른 아이콘 · 트리가 서술값대로 그림 · 껍데기가 확장자를 알지 못함. 가리키는 SVG 파일이 실제로 있는지도 확인한다. pywebview 갈래를 띄워 VS Code Icons(저장값 복원)와 VS Code Built-in을 화면으로 확인했다. Node 11종 + Python 36건 + Electron 공개 동작 시험 전건 통과.
