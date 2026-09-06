# tests/test_phase_seven.py — Phase 7 검증 (TE-035 ~ TE-041, FR-4, FR-21 ~ FR-27)
import os
import re
import subprocess
import tempfile
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PhaseSevenTests(unittest.TestCase):
    def test_run_node_shell_phase_seven_tests(self):
        """Node 환경에서 화면 및 사용성 단위 테스트 실행 (TE-035 ~ TE-040)."""
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_shell_phase_seven.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"test_shell_phase_seven.js failed:\n{res.stderr}\n{res.stdout}"
        )

    def test_shell_code_has_no_kind_comparisons_in_app(self):
        """shell/app.js에 종류 값과의 비교문이 0건이다 (FR-4)."""
        app_path = os.path.join(PROJECT_ROOT, "shell", "app.js")
        with open(app_path, encoding="utf-8") as handle:
            source = handle.read()

        matches = re.findall(r"(?<!typeof\s)(?:kind|\.kind)\s*[!=]==?\s*['\"][a-zA-Z0-9_-]+['\"]", source)
        self.assertEqual(
            0,
            len(matches),
            f"Found kind comparison against string literal in shell/app.js: {matches}"
        )

    def test_shell_code_has_no_kind_name_strings_in_app(self):
        """shell/app.js에 종류 이름 문자열(file · folder · terminal 등)이 0건이다 (FR-4)."""
        app_path = os.path.join(PROJECT_ROOT, "shell", "app.js")
        with open(app_path, encoding="utf-8") as handle:
            source = handle.read()

        for kind_name in ["file", "folder", "terminal"]:
            matches = re.findall(rf"['\"`]{kind_name}['\"`]", source, re.IGNORECASE)
            self.assertEqual(
                0,
                len(matches),
                f"Found kind name '{kind_name}' in shell/app.js: {matches}"
            )

    def test_cli_argument_handling_pywebview(self):
        """host_pywebview의 Bridge가 유효 디렉토리 인자를 루트로 설정하고 없는 경로면 notice로 처리한다 (TE-041, FR-27)."""
        from host_pywebview.host.bridge import Bridge

        with tempfile.TemporaryDirectory() as valid_dir:
            temp_settings = os.path.join(valid_dir, "settings.json")
            bridge_valid = Bridge(settings_path=temp_settings, cli_root=valid_dir)
            self.assertEqual(
                os.path.normcase(os.path.realpath(bridge_valid.root_path)),
                os.path.normcase(os.path.realpath(valid_dir))
            )
            self.assertIsNone(bridge_valid.startup_notice)

            # 존재하지 않는 경로를 넘긴 경우 -> startup_notice 설정 및 root_path는 설정되지 않음
            non_existent_path = os.path.join(valid_dir, "not_exist_folder")
            bridge_invalid = Bridge(settings_path=temp_settings, cli_root=non_existent_path)
            self.assertIsNotNone(bridge_invalid.startup_notice)
            self.assertIn("unavailable", bridge_invalid.startup_notice)

    def test_cli_argument_handling_electron(self):
        """host_electron의 main.js에서 resolveInsideRoot 및 경로 유효성 로직 검증 (TE-041, FR-27)."""
        node_script = """
        const electronMain = require('./host_electron/host/main.js');
        const assert = require('assert');
        const os = require('os');
        const fs = require('fs');
        const path = require('path');

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'el-cli-test-'));
        electronMain.setSettingsPath(path.join(tmpDir, 'settings.json'));
        (async () => {
          try {
            const res = await electronMain.handleBridge('set_root', tmpDir);
            assert(res.ok, 'set_root on valid dir must succeed');
            const expected = fs.realpathSync.native ? fs.realpathSync.native(tmpDir) : fs.realpathSync(tmpDir);
            assert.strictEqual(res.value, expected);

            const resNonExist = await electronMain.handleBridge('set_root', path.join(tmpDir, 'non_exist'));
            assert(!resNonExist.ok, 'set_root on non-existent dir must fail');
            assert.strictEqual(resNonExist.error.code, 'NOT_FOUND');
          } finally {
            fs.rmdirSync(tmpDir, { recursive: true });
          }
        })().catch(err => {
          console.error(err);
          process.exit(1);
        });
        """
        res = subprocess.run(
            ["node", "-e", node_script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        self.assertEqual(res.returncode, 0, f"Electron CLI test failed:\n{res.stderr}\n{res.stdout}")


if __name__ == "__main__":
    unittest.main()
