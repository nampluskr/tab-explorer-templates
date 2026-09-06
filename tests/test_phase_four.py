import os
import re
import subprocess
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PhaseFourTests(unittest.TestCase):
    def test_run_node_view_lifecycle_tests(self):
        """Node 환경에서 view_lifecycle 단위 테스트 실행 (TE-020 ~ TE-022)."""
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_view_lifecycle.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"test_view_lifecycle.js failed:\n{res.stderr}\n{res.stdout}"
        )

    def test_shell_code_does_not_inspect_view_state(self):
        """껍데기 코드가 맡은 상태의 내부를 읽거나 비교하는 곳이 0건이다 (FR-13)."""
        shell_dir = os.path.join(PROJECT_ROOT, "shell")
        for fname in ["tab_model.js", "view_lifecycle.js", "app.js"]:
            path = os.path.join(shell_dir, fname)
            with open(path, encoding="utf-8") as handle:
                source = handle.read()

            # viewState property accesses e.g. viewState.something, viewState['...']
            matches = re.findall(r"viewState\s*(\.[a-zA-Z0-9_$]+|\[['\"][^'\"]+['\"]\])", source)
            self.assertEqual(
                0,
                len(matches),
                f"Found internal viewState inspection in {fname}: {matches}"
            )

    def test_shell_code_has_no_kind_comparisons(self):
        """shell/view_lifecycle.js에 종류 값과의 비교문이 0건이다 (FR-4)."""
        vl_path = os.path.join(PROJECT_ROOT, "shell", "view_lifecycle.js")
        with open(vl_path, encoding="utf-8") as handle:
            source = handle.read()

        matches = re.findall(r"(?<!typeof\s)(?:kind|\.kind)\s*[!=]==?\s*['\"][a-zA-Z0-9_-]+['\"]", source)
        self.assertEqual(
            0,
            len(matches),
            f"Found kind comparison against string literal in shell/view_lifecycle.js: {matches}"
        )

    def test_shell_code_has_no_kind_name_strings(self):
        """shell/view_lifecycle.js에 종류 이름 문자열(file · folder · terminal 등)이 0건이다 (FR-4)."""
        vl_path = os.path.join(PROJECT_ROOT, "shell", "view_lifecycle.js")
        with open(vl_path, encoding="utf-8") as handle:
            source = handle.read()

        for kind_name in ["file", "folder", "terminal"]:
            matches = re.findall(rf"['\"`]{kind_name}['\"`]", source, re.IGNORECASE)
            self.assertEqual(
                0,
                len(matches),
                f"Found kind name '{kind_name}' in shell/view_lifecycle.js: {matches}"
            )


if __name__ == "__main__":
    unittest.main()
