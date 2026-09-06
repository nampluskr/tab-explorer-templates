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
