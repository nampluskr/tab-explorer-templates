# host_pywebview

NumPy를 같은 프로세스에서 직접 부르는 갈래다.

## 실행 방법

Python 3.11 이상이 필요하다. 최초 1회 의존성을 설치한다.

```powershell
pip install -r host_pywebview/requirements.txt
```

이후 프로젝트 루트에서 실행한다.

```powershell
python host_pywebview/app.py
```

또는 설치된 Python 인터프리터를 직접 지정하여 실행할 수 있다:

```powershell
& "C:\winpython\WPy64-31180_cpu\python-3.11.8.amd64\python.exe" host_pywebview/app.py
```

## 동작 원리

- `ProjectStaticApp`이 프로젝트 루트의 `shell/index.html`과 `shared/design/` 에셋을 로컬에서 서빙한다.
- 껍데기(`shell/`)와 디자인 파일(`shared/design/`)은 `host_electron` 갈래와 한 벌로 공유하며, 번들러/트랜스파일러 없이 그대로 로드된다.
- 이 갈래를 쓰지 않는 프로젝트는 `host_pywebview/` 폴더를 통째로 삭제해도 Electron 갈래 실행에 영향이 없다.