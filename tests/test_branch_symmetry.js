// tests/test_branch_symmetry.js — Phase 9 (TE-046)
// 어느 갈래를 지워도 반대쪽이 그대로 실행되는지 판정한다 (FR-35)
//
// 실제 실행 확인은 사람이 두 갈래를 띄워서 한다(FR-39). 이 시험은 그 전에
// "지운 뒤에도 남은 쪽이 필요한 것을 모두 갖고 있는가"를 기계로 판정한다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SHARED_DIRS = ['shell', 'presets', 'shared'];
const HOSTS = ['host_pywebview', 'host_electron'];

function listFiles(dir, filter) {
  const out = [];
  const walk = (current) => {
    for (const name of fs.readdirSync(current)) {
      if (name === 'node_modules' || name === '__pycache__' || name === '.git') continue;
      const full = path.join(current, name);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (!filter || filter(full)) out.push(path.relative(ROOT, full).split(path.sep).join('/'));
    }
  };
  walk(dir);
  return out;
}

function readAll(files) {
  return files.map((rel) => ({ rel, src: fs.readFileSync(path.join(ROOT, rel), 'utf8') }));
}

function run() {
  console.log('Running branch symmetry checks (TE-046)...');

  // ---------------------------------------------------------------
  // 1. 공유하는 것이 갈래 폴더 밖에 한 벌로 있다 (FR-35, D-12)
  // ---------------------------------------------------------------
  for (const dir of SHARED_DIRS) {
    assert(
      fs.existsSync(path.join(ROOT, dir)),
      `${dir}/가 갈래 폴더 밖에 있다`
    );
  }
  for (const host of HOSTS) {
    for (const dir of SHARED_DIRS) {
      assert(
        !fs.existsSync(path.join(ROOT, host, dir)),
        `${host}/ 아래에 ${dir}/ 사본이 있으면 안 된다`
      );
    }
  }

  // ---------------------------------------------------------------
  // 2. shell/과 presets/ 아래에 특정 호스트에만 있는 파일이 0건 (FR-35)
  // ---------------------------------------------------------------
  const sharedFiles = readAll([
    ...listFiles(path.join(ROOT, 'shell')),
    ...listFiles(path.join(ROOT, 'presets'))
  ]);
  assert(sharedFiles.length > 0, '공유 파일을 찾을 수 있다');

  for (const { rel } of sharedFiles) {
    for (const host of HOSTS) {
      assert(
        !rel.includes(host),
        `${rel}이 특정 호스트의 이름을 파일 이름에 갖고 있으면 안 된다`
      );
    }
  }

  // ---------------------------------------------------------------
  // 3. 껍데기가 실행 환경의 이름과 API를 알지 못한다 (FR-35, 제약 6)
  // ---------------------------------------------------------------
  const RUNTIME_NAMES = ['pywebview', 'electron', 'Electron'];
  const RUNTIME_APIS = [
    'ipcRenderer', 'ipcMain', 'contextBridge', 'BrowserWindow',
    'require(', 'process.versions', 'window.pywebview', '__dirname'
  ];

  for (const { rel, src } of sharedFiles) {
    // .js와 .html만 코드로 본다 (css에는 해당 이름이 없지만 함께 훑어도 무해하다)
    for (const name of RUNTIME_NAMES) {
      const hits = src.match(new RegExp(name, 'g')) || [];
      assert.strictEqual(
        hits.length, 0,
        `${rel}에 실행 환경 이름 '${name}'이 있으면 안 된다`
      );
    }
    for (const api of RUNTIME_APIS) {
      assert(
        !src.includes(api),
        `${rel}에 실행 환경 API '${api}'가 있으면 안 된다`
      );
    }
  }

  // ---------------------------------------------------------------
  // 4. 두 갈래가 같은 껍데기 파일과 같은 디자인 파일을 가리킨다 (FR-35)
  // ---------------------------------------------------------------
  const pyEntry = fs.readFileSync(path.join(ROOT, 'host_pywebview', 'app.py'), 'utf8');
  const elEntry = fs.readFileSync(path.join(ROOT, 'host_electron', 'host', 'main.js'), 'utf8');

  assert(/["']\/shell\/index\.html["']/.test(pyEntry), 'pywebview 갈래가 shell/index.html을 가리킨다');
  assert(/["']shell["']\s*,\s*["']index\.html["']/.test(elEntry), 'Electron 갈래가 shell/index.html을 가리킨다');

  const indexSrc = fs.readFileSync(path.join(ROOT, 'shell', 'index.html'), 'utf8');
  assert(indexSrc.includes('../shared/design/tokens.css'), '껍데기가 공유 디자인 파일을 가리킨다');

  // 두 갈래가 서로를 참조하지 않는다 — 한쪽을 지워도 남은 쪽이 끊기지 않는다.
  // 안내 문서도 함께 본다. 지운 뒤 남은 문서가 없는 폴더를 가리키면 안 된다 (TE-049).
  const pyFiles = readAll(listFiles(path.join(ROOT, 'host_pywebview'), (f) => /\.(py|json|md)$/.test(f)));
  const elFiles = readAll(listFiles(path.join(ROOT, 'host_electron'), (f) => /\.(js|json|md)$/.test(f))
    .filter((rel) => !rel.includes('package-lock.json')));

  for (const { rel, src } of pyFiles) {
    assert(
      !src.includes('host_electron'),
      `${rel}이 반대쪽 갈래(host_electron)를 참조하면 안 된다`
    );
  }
  for (const { rel, src } of elFiles) {
    assert(
      !src.includes('host_pywebview'),
      `${rel}이 반대쪽 갈래(host_pywebview)를 참조하면 안 된다`
    );
  }

  // ---------------------------------------------------------------
  // 5. 공유 파일도 갈래를 참조하지 않는다 — 지워진 쪽을 찾지 않는다
  // ---------------------------------------------------------------
  for (const { rel, src } of sharedFiles) {
    for (const host of HOSTS) {
      assert(
        !src.includes(host),
        `${rel}이 갈래 폴더(${host})를 참조하면 안 된다`
      );
    }
  }

  // ---------------------------------------------------------------
  // 6. 각 갈래가 혼자서 실행에 필요한 것을 갖고 있다
  // ---------------------------------------------------------------
  const pyRequired = ['app.py', 'host/bridge.py', 'host/__init__.py'];
  for (const rel of pyRequired) {
    assert(
      fs.existsSync(path.join(ROOT, 'host_pywebview', rel)),
      `pywebview 갈래에 ${rel}이 있다`
    );
  }
  const elRequired = ['package.json', 'host/main.js'];
  for (const rel of elRequired) {
    assert(
      fs.existsSync(path.join(ROOT, 'host_electron', rel)),
      `Electron 갈래에 ${rel}이 있다`
    );
  }
  const elPackage = JSON.parse(fs.readFileSync(path.join(ROOT, 'host_electron', 'package.json'), 'utf8'));
  assert.strictEqual(elPackage.main, 'host/main.js', 'Electron 갈래의 진입점이 자기 안을 가리킨다');

  // ---------------------------------------------------------------
  // 7. 두 갈래의 참조 경로가 대칭이다 — 같은 깊이에서 같은 곳을 본다
  // ---------------------------------------------------------------
  assert(
    /os\.path\.dirname\(os\.path\.dirname\(os\.path\.abspath\(__file__\)\)\)/.test(pyEntry),
    'pywebview 갈래가 저장소 루트를 자기 위치에서 계산한다'
  );
  assert(
    /path\.join\(__dirname,\s*["']\.\.["']\s*,\s*["']\.\.["']/.test(elEntry),
    'Electron 갈래도 저장소 루트를 자기 위치에서 계산한다'
  );

  console.log('All branch symmetry checks (TE-046) passed successfully!');
}

run();
