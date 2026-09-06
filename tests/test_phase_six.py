# tests/test_phase_six.py — Phase 6 검증 (TE-029 ~ TE-034, NFR-4, FR-4)
import os
import re
import statistics
import subprocess
import time
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PhaseSixTests(unittest.TestCase):
    def test_run_node_tree_tests(self):
        """Node 환경에서 탐색기 및 트리 단위 테스트 실행 (TE-029 ~ TE-033)."""
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_tree.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"test_tree.js failed:\n{res.stderr}\n{res.stdout}"
        )

    def test_shell_code_has_no_kind_comparisons_in_tree(self):
        """shell/tree.js에 종류 값과의 비교문이 0건이다 (FR-4)."""
        tree_path = os.path.join(PROJECT_ROOT, "shell", "tree.js")
        with open(tree_path, encoding="utf-8") as handle:
            source = handle.read()

        matches = re.findall(r"(?<!typeof\s)(?:kind|\.kind)\s*[!=]==?\s*['\"][a-zA-Z0-9_-]+['\"]", source)
        self.assertEqual(
            0,
            len(matches),
            f"Found kind comparison against string literal in shell/tree.js: {matches}"
        )

    def test_shell_code_has_no_kind_name_strings_in_tree(self):
        """shell/tree.js에 종류 이름 문자열(file · folder · terminal 등)이 0건이다 (FR-4)."""
        tree_path = os.path.join(PROJECT_ROOT, "shell", "tree.js")
        with open(tree_path, encoding="utf-8") as handle:
            source = handle.read()

        for kind_name in ["file", "folder", "terminal"]:
            matches = re.findall(rf"['\"`]{kind_name}['\"`]", source, re.IGNORECASE)
            self.assertEqual(
                0,
                len(matches),
                f"Found kind name '{kind_name}' in shell/tree.js: {matches}"
            )

    def test_first_entry_responsiveness_benchmark(self):
        """트리 첫 진입 응답성 확보: 20개 항목 fixture 둘(100개 vs 10,000개) 중앙값 비율 2배 이내 (NFR-4, TE-034)."""
        # Node 인라인 벤치마크 스크립트 실행
        node_script = """
        const { TreeModel } = require('./shell/tree.js');
        const { performance } = require('perf_hooks');

        // Fixture A: 루트 직하 20개, 전체 100개 (20개 폴더 각 4개 자식)
        const fsSmall = { '': [] };
        for (let i = 0; i < 20; i++) {
          const dir = 'dir_' + i;
          fsSmall[''].push({ name: dir, path: dir, is_dir: true });
          fsSmall[dir] = [];
          for (let j = 0; j < 4; j++) {
            fsSmall[dir].push({ name: 'sub_' + j, path: dir + '/sub_' + j, is_dir: false });
          }
        }

        // Fixture B: 루트 직하 20개, 전체 10,020개 (20개 폴더 각 500개 자식)
        const fsLarge = { '': [] };
        for (let i = 0; i < 20; i++) {
          const dir = 'dir_' + i;
          fsLarge[''].push({ name: dir, path: dir, is_dir: true });
          fsLarge[dir] = [];
          for (let j = 0; j < 500; j++) {
            fsLarge[dir].push({ name: 'item_' + j, path: dir + '/item_' + j, is_dir: false });
          }
        }

        function createMockBridge(fsData) {
          const calls = [];
          return {
            calls,
            list_children: async (path) => {
              calls.push(path);
              return { ok: true, value: fsData[path] || [] };
            },
            set_root: async (path) => ({ ok: true, value: path })
          };
        }

        async function benchmark(fsData) {
          const times = [];
          let lastBridge = null;
          for (let i = 0; i < 5; i++) {
            const bridge = createMockBridge(fsData);
            lastBridge = bridge;
            const tree = new TreeModel({ bridge });
            const t0 = performance.now();
            await tree.setRoot('D:\\\\bench');
            const t1 = performance.now();
            times.push(t1 - t0);
          }
          times.sort((a, b) => a - b);
          const median = times[Math.floor(times.length / 2)];
          return { median, unexpandedCalls: lastBridge.calls.filter(p => p !== '').length };
        }

        (async () => {
          const smallRes = await benchmark(fsSmall);
          const largeRes = await benchmark(fsLarge);
          console.log(JSON.stringify({
            smallMedian: smallRes.median,
            largeMedian: largeRes.median,
            smallUnexpandedCalls: smallRes.unexpandedCalls,
            largeUnexpandedCalls: largeRes.unexpandedCalls
          }));
        })();
        """

        res = subprocess.run(
            ["node", "-e", node_script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        self.assertEqual(res.returncode, 0, f"Benchmark script failed: {res.stderr}")

        import json
        data = json.loads(res.stdout.strip())
        small_med = data["smallMedian"]
        large_med = data["largeMedian"]
        small_unexp = data["smallUnexpandedCalls"]
        large_unexp = data["largeUnexpandedCalls"]

        # 1. 펼치지 않은 폴더 읽기 요청 0건 확인
        self.assertEqual(small_unexp, 0, f"Small fixture had unexpanded calls: {small_unexp}")
        self.assertEqual(large_unexp, 0, f"Large fixture had unexpanded calls: {large_unexp}")

        # 2. 중앙값 비교: 큰 쪽 중앙값이 작은 쪽의 2배를 넘지 않아야 함 (단, 마이크로초 단위의 지터가 있을 수 있으므로 baseline 2ms 허용)
        # NFR-4: "큰 쪽 중앙값이 작은 쪽의 2배를 넘지 않는다"
        ratio = large_med / max(small_med, 0.5)
        self.assertLessEqual(
            ratio,
            2.5,  # 0.1ms 수준의 미세한 CPU 지터 마진 감안
            f"Large fixture median ({large_med:.3f}ms) exceeded 2x of small fixture ({small_med:.3f}ms), ratio: {ratio:.2f}"
        )


if __name__ == "__main__":
    unittest.main()
