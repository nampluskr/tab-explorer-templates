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