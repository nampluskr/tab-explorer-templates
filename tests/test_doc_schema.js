// tests/test_doc_schema.js — Phase 9 (TE-050)
// project-workflow DOC-SCHEMA 9절의 초기화 검사 목록을 판정한다 (FR-38)
//
// 이 시험은 문서를 고치지 않는다. 무엇이 걸리는지 보고만 한다.
// docs/current의 5종은 사람이 쓰는 것이라 에이전트가 대신 채우지 않는다.
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CURRENT = path.join(ROOT, 'docs', 'current');
const read = (...p) => fs.readFileSync(path.join(...p), 'utf8');

const FIVE = ['BRIEF.md', 'DECISIONS.md', 'SPEC.md', 'PLAN.md', 'backlog.json'];

const checks = [];
function check(target, name, fn) {
  checks.push({ target, name, fn });
}

// --- 전체 ---
check('전체', '6종 중 5종이 있다 (PROGRESS.md는 에이전트가 만든다)', () => {
  for (const f of FIVE) {
    assert(fs.existsSync(path.join(CURRENT, f)), `${f}이 없다`);
  }
  assert(fs.existsSync(path.join(CURRENT, 'PROGRESS.md')), 'PROGRESS.md가 없다');
});

check('전체', '각 문서 첫 줄에 버전이 있고, 서로 같다', () => {
  const versions = {};
  for (const f of ['BRIEF.md', 'DECISIONS.md', 'SPEC.md', 'PLAN.md']) {
    const head = read(CURRENT, f).split('\n').slice(0, 6).join('\n');
    const m = /v\d+\.\d+/.exec(head);
    assert(m, `${f} 첫머리에 버전이 없다`);
    versions[f] = m[0];
  }
  const backlog = JSON.parse(read(CURRENT, 'backlog.json'));
  const note = (backlog.meta && backlog.meta.note) || '';
  const bm = /v\d+\.\d+/.exec(note);
  assert(bm, 'backlog.json meta.note에 버전이 없다');
  versions['backlog.json'] = bm[0];

  const unique = [...new Set(Object.values(versions))];
  assert.strictEqual(
    unique.length, 1,
    `버전이 서로 다르다: ${JSON.stringify(versions)}`
  );
});

// --- BRIEF ---
check('BRIEF', '필수 블럭 5개가 있다', () => {
  const src = read(CURRENT, 'BRIEF.md');
  const headings = (src.match(/^##+ .*$/gm) || []);
  assert(headings.length >= 5, `블럭이 5개보다 적다: ${headings.length}`);
});

check('BRIEF', '"하지 않을 것"이 비어 있지 않다', () => {
  const src = read(CURRENT, 'BRIEF.md');
  const m = /(하지 않을 것|하지 않는 것)[\s\S]*?(?=\n##\s|\n---|\s*$)/.exec(src);
  assert(m, '"하지 않을 것" 절이 없다');
  const body = m[0].split('\n').slice(1).join('\n').trim();
  assert(body.length > 0, '"하지 않을 것"이 비어 있다');
});

// --- DECISIONS ---
check('DECISIONS', '각 결정에 배제한 대안이 있다', () => {
  const src = read(CURRENT, 'DECISIONS.md');
  const blocks = src.split(/^## D-/m).slice(1);
  assert(blocks.length > 0, '결정이 하나도 없다');
  const missing = [];
  blocks.forEach((b, i) => {
    if (!/배제한 대안/.test(b)) missing.push('D-' + (b.split('.')[0] || i + 1));
  });
  assert.strictEqual(missing.length, 0, `배제한 대안이 없는 결정: ${missing.join(', ')}`);
});

// --- SPEC ---
check('SPEC', '모든 요구에 ID와 판정 방법이 있다', () => {
  const src = read(CURRENT, 'SPEC.md');
  const blocks = src.split(/^#### /m).slice(1);
  const reqs = blocks.filter((b) => /^(FR|NFR)-\d+/.test(b));
  assert(reqs.length > 0, '요구가 하나도 없다');
  const missing = [];
  for (const b of reqs) {
    const id = /^((?:FR|NFR)-\d+)/.exec(b)[1];
    if (!/판정 방법/.test(b)) missing.push(id);
  }
  assert.strictEqual(missing.length, 0, `판정 방법이 없는 요구: ${missing.join(', ')}`);
});

check('SPEC', '미구현 대상이 비어 있지 않다', () => {
  const src = read(CURRENT, 'SPEC.md');
  const m = /##\s*\d*\.?\s*미구현 대상[\s\S]*?(?=\n##\s|$)/.exec(src);
  assert(m, '미구현 대상 절이 없다');
  const items = (m[0].match(/^\d+\.\s+\*\*/gm) || []);
  assert(items.length > 0, '미구현 대상이 비어 있다');
});

// --- PLAN ---
check('PLAN', '모든 Phase에 완료 조건이 있다', () => {
  const src = read(CURRENT, 'PLAN.md');
  // 숫자가 붙은 것만 Phase다 ("Phase 사이의 의존"은 관계 표이지 Phase가 아니다)
  const phases = src.split(/^## Phase (?=\d)/m).slice(1);
  assert(phases.length > 0, 'Phase가 하나도 없다');
  const missing = [];
  for (const p of phases) {
    const num = (p.split('.')[0] || '?').trim();
    if (!/\*\*완료 조건\*\*/.test(p)) missing.push('Phase ' + num);
  }
  assert.strictEqual(missing.length, 0, `완료 조건이 없는 Phase: ${missing.join(', ')}`);
});

check('PLAN', '모든 Phase가 SPEC의 ID를 참조한다', () => {
  const specSrc = read(CURRENT, 'SPEC.md');
  const known = new Set((specSrc.match(/(?:FR|NFR)-\d+/g) || []));
  const src = read(CURRENT, 'PLAN.md');
  const phases = src.split(/^## Phase (?=\d)/m).slice(1);
  const missing = [];
  for (const p of phases) {
    const num = (p.split('.')[0] || '?').trim();
    const ids = (p.match(/(?:FR|NFR)-\d+/g) || []);
    if (ids.length === 0) { missing.push('Phase ' + num + ' (참조 없음)'); continue; }
    const unknown = ids.filter((id) => !known.has(id));
    if (unknown.length) missing.push(`Phase ${num} (SPEC에 없는 ID: ${[...new Set(unknown)].join(', ')})`);
  }
  assert.strictEqual(missing.length, 0, missing.join(' / '));
});

// --- backlog.json ---
check('backlog.json', 'validate 통과', () => {
  const data = JSON.parse(read(CURRENT, 'backlog.json'));
  assert(Array.isArray(data.tasks) && data.tasks.length > 0, 'task가 없다');
  const ids = new Set();
  for (const t of data.tasks) {
    assert(t.id && !ids.has(t.id), `id가 없거나 겹친다: ${t.id}`);
    ids.add(t.id);
    assert(data.enums.status.includes(t.status), `${t.id}: 알 수 없는 status ${t.status}`);
    assert(data.enums.priority.includes(t.priority), `${t.id}: 알 수 없는 priority ${t.priority}`);
    assert(data.enums.category.includes(t.category), `${t.id}: 알 수 없는 category ${t.category}`);
  }
  for (const t of data.tasks) {
    for (const dep of t.deps || []) {
      assert(ids.has(dep), `${t.id}의 deps에 없는 id: ${dep}`);
    }
    if (t.parent) assert(ids.has(t.parent), `${t.id}의 parent에 없는 id: ${t.parent}`);
  }
});

check('backlog.json', '모든 task에 완료 조건이 있다', () => {
  const data = JSON.parse(read(CURRENT, 'backlog.json'));
  const missing = data.tasks.filter((t) => !t.summary || !String(t.summary).trim()).map((t) => t.id);
  assert.strictEqual(missing.length, 0, `완료 조건(summary)이 없는 task: ${missing.join(', ')}`);
});

check('backlog.json', '모든 task의 phase가 PLAN에 있다', () => {
  const planSrc = read(CURRENT, 'PLAN.md');
  const planPhases = new Set((planSrc.match(/^## Phase (\d+)/gm) || []).map((h) => 'P' + h.replace(/\D/g, '')));
  const data = JSON.parse(read(CURRENT, 'backlog.json'));
  const missing = [...new Set(data.tasks.map((t) => t.category))].filter((c) => !planPhases.has(c));
  assert.strictEqual(missing.length, 0, `PLAN에 없는 phase: ${missing.join(', ')}`);
});

// --- README ---
check('README.md', 'v0.1이면 루트에 있고 1번 블럭이 채워져 있다', () => {
  const p = path.join(ROOT, 'README.md');
  assert(fs.existsSync(p), '루트에 README.md가 없다');
  const src = fs.readFileSync(p, 'utf8');
  const firstBlock = src.split(/^##\s/m)[1] || '';
  assert(firstBlock.trim().length > 0, 'README의 1번 블럭이 비어 있다');
});

// ---------------------------------------------------------------
function run() {
  console.log('Running DOC-SCHEMA checks (TE-050, FR-38)...');
  const failures = [];
  for (const c of checks) {
    try {
      c.fn();
      console.log(`  OK   [${c.target}] ${c.name}`);
    } catch (e) {
      failures.push(`[${c.target}] ${c.name}\n       ${e.message}`);
      console.error(`  FAIL [${c.target}] ${c.name}\n       ${e.message}`);
    }
  }

  assert.strictEqual(checks.length, 13, `검사가 13개여야 한다: ${checks.length}`);
  if (failures.length > 0) {
    console.error(`\n${failures.length}건이 걸렸다. 문서는 사람이 쓰는 것이라 고치지 않고 보고만 한다.`);
    process.exit(1);
  }
  console.log(`\n초기화 검사 목록 13건 전건 통과 (FR-38)`);
  console.log('All DOC-SCHEMA checks (TE-050) passed successfully!');
}

run();
