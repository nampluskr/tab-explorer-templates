# tab-explorer-templates

## 무엇을 하는가

탐색기와 탭으로 이뤄진 Windows 데스크톱 앱을 새로 만들 때 쓰는 시작점이다.

프레임리스 창, 왼쪽 탐색기 트리, 좌우로 가를 수 있는 패널, 그 안의 탭 줄까지
껍데기를 완성된 상태로 제공한다. 앱마다 달라지는 것은 **트리가 무엇을 보여주고,
행을 고르면 어떤 탭이 열리며, 그 탭 안에 무엇이 그려지는가**뿐이다. 이 세 가지는
정해진 교체 지점으로 드러나 있고, 껍데기 코드는 건드리지 않는다.

탭이 담는 대상을 파일 하나로 한정하지 않는다. 파일, 폴더, 터미널처럼 성격이 다른
대상이 같은 탭 영역에서 같은 규칙으로 열리고 닫힌다.

호스트 연결 계층만 두 갈래로 제공한다 — NumPy를 같은 프로세스에서 직접 부르는
갈래와, 그런 연계가 필요 없는 갈래다. 껍데기와 디자인 파일은 한 벌이고 두 갈래가
그대로 로드하므로 겉보기가 같다. 앱은 쓰지 않는 갈래 폴더 하나를 지우고 쓴다.

복사해서 쓰는 템플릿이다. 코드 생성기나 라이브러리가 아니다.

## 무엇을 하지 않는가

- **도메인 로직을 담지 않는다.** 마크다운 렌더링, 신호 분석, 파일 관리, 터미널
  실행 같은 코드는 들어 있지 않다. 기본으로 딸려 오는 것은 교체 방법을 보여주는
  참조 구현뿐이다.
- **완성된 앱이 아니다.** 파일 탐색기도 폴더 탐색기도 터미널도 이 프로젝트의
  결과물이 아니다. 그것들은 이 템플릿을 복사해 만드는 별개의 앱이다.
- **설치형 라이브러리가 아니다.** 패키지로 배포하지 않는다. 사람이 프로젝트 전체를
  복사하고, 교체 지점을 자기 것으로 바꿔 쓴다.
- **코드 생성기가 아니다.** 자동 생성 마법사나 전용 명령 도구를 만들지 않는다.
- **요약 지표와 목록 표 위주의 UI는 다루지 않는다.** 그 형태는 별도 프로젝트의 몫이다.
- **모바일과 클라우드 배포를 고려하지 않는다.** Windows 로컬 실행이 1차 대상이다.

## 프로젝트 결과 (v0.1)

- **리소스 독립적 모듈 껍데기 (`shell/`)**:
  - 탭 식별자와 대상 리소스 주소를 분리(`tab_model.js`)하여 파일뿐 아니라 폴더, 터미널 세션 등 임의의 대상을 수용
  - 5대 교체 지점(`slot_registry.js`)과 수명주기를 갖는 컴포넌트 엔진(`view_lifecycle.js`: mount, activate, deactivate, resize, destroy) 완성
- **파일/폴더 2종 프리셋 (`presets/`)**:
  - 파일 탐색 기반 앱을 위한 `presets/file`과 폴더 기반 앱을 위한 `presets/folder`를 내장하여 복사 즉시 전환 및 활용 가능
- **두 갈래 호스트 계층 대칭 완성 (`host_electron`, `host_pywebview`)**:
  - 11개 브릿지 계약(`docs/BRIDGE-CONTRACT.md`) 및 6대 공통 에러 계약(`docs/ERROR-CONTRACT.md`) 100% 준수
  - 루트 경로 이탈(`..`), 드라이브 절대경로 및 외부 심볼릭 링크 침범 차단 보안 완비
- **완성도 높은 시각 체계 및 아이콘 테마 엔진 (`shared/design/`)**:
  - 디자인 토큰(59종) 및 3대 테마(White, Gray, Dark) 지원
  - 런타임 해석기(`icon_theme.js`)를 통해 Simple(기본), VS Code Built-in(Seti 글리프), VS Code Icons(SVG) 3종 테마 지원
- **검증 체계 (`tests/`)**:
  - 24개 테스트 파일(4,821줄) 구축, 이전 버전(v0.1) 회귀 검증 32건 전건 통과 및 호스트 대칭성 자동 검증

## 어떻게 쓰는가 (활용 방법)

1. **저장소 복제**: 이 템플릿 전체를 새 프로젝트 폴더로 복사합니다.
2. **호스트 갈래 선택 (불필요한 갈래 삭제)**:
   - Python / NumPy 직접 연계가 필요한 경우: `host_electron/` 폴더를 삭제하고 `host_pywebview/`를 사용합니다.
   - Node.js 기반 독립 실행이 필요한 경우: `host_pywebview/` 폴더를 삭제하고 `host_electron/`를 사용합니다.
3. **프리셋 선택**:
   - `presets/active.js`에서 사용할 프리셋을 지정합니다 (기본값: `file`, 폴더 기반 도구의 경우 `folder`).
4. **교체 지점 구현**:
   - 껍데기 코드는 건드리지 않고, `presets/<선택한 프리셋>/`을 참고하여 5개 교체 지점(`트리 항목`, `행 선택 매핑`, `보기 제공자`, `중복 정책`, `여는 경로`) 중 앱에 필요한 자리를 교체합니다.
   - 탭 콘텐츠는 수명주기(`mount`, `activate`, `deactivate`, `resize`, `destroy`)를 구현한 View 컴포넌트로 연결합니다.
5. **실행**:
   - pywebview 갈래: `pip install -r host_pywebview/requirements.txt` 후 `python host_pywebview/app.py`
   - Electron 갈래: `cd host_electron && npm install` 후 `npm start`
   - 자세한 실행 절차와 단축키는 각 갈래의 `README.md`를 참고합니다.

## 요구 환경

- **OS**: Windows 10 이상 (로컬 실행)
- **NumPy 연계 갈래 (`host_pywebview`)**: Python 3.11 이상, pywebview 6.2.1 이상
- **NumPy 미연계 갈래 (`host_electron`)**: Node.js v18 이상, Electron 31 이상

## 문서

- 현재 버전 작업 문서: `docs/current/` (BRIEF, DECISIONS, SPEC, PLAN, PROGRESS)
- 연결 계층 및 오류 규약: `docs/BRIDGE-CONTRACT.md`, `docs/ERROR-CONTRACT.md`
- 이전 버전(`explorer_templates`) 대비 개선 상세 분석: `docs/ARCHITECTURE-COMPARISON.md`
