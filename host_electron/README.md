# host_electron

Python/NumPy 연계가 필요 없는 환경을 위한 Electron 갈래다.

## 실행 방법

Node.js(v18 이상)가 필요하다. 최초 1회 의존성을 설치한다.

```powershell
cd host_electron
npm install
```

이후 실행한다.

```powershell
npm start
```

## 동작 원리

- `host/main.js`가 상위의 `shell/index.html`을 `BrowserWindow.loadFile`로 직접 로드한다.
- 껍데기(`shell/`)와 디자인 파일(`shared/design/`)은 `host_pywebview` 갈래와 한 벌로 공유하며, 번들러/트랜스파일러 없이 그대로 로드된다.
- 이 갈래를 쓰지 않는 프로젝트는 `host_electron/` 폴더를 통째로 삭제해도 pywebview 갈래 실행에 영향이 없다.