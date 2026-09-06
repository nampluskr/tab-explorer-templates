import os
import re
import subprocess
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PhaseFiveTests(unittest.TestCase):
    def test_run_node_slots_tests(self):
        """Node 환경에서 다섯 자리 갈아끼우기 및 새 종류 등록 테스트 실행 (TE-023 ~ TE-028)."""
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_slots.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"test_slots.js failed:\n{res.stderr}\n{res.stdout}"
        )

    def test_shell_code_has_no_kind_comparisons_in_slots(self):
        """shell/slot_registry.js에 종류 값과의 비교문이 0건이다 (FR-4)."""
        slot_path = os.path.join(PROJECT_ROOT, "shell", "slot_registry.js")
        with open(slot_path, encoding="utf-8") as handle:
            source = handle.read()

        matches = re.findall(r"(?<!typeof\s)(?:kind|\.kind)\s*[!=]==?\s*['\"][a-zA-Z0-9_-]+['\"]", source)
        self.assertEqual(
            0,
            len(matches),
            f"Found kind comparison against string literal in shell/slot_registry.js: {matches}"
        )

    def test_shell_code_has_no_kind_name_strings_in_slots(self):
        """shell/slot_registry.js에 종류 이름 문자열(file · folder · terminal 등)이 0건이다 (FR-4)."""
        slot_path = os.path.join(PROJECT_ROOT, "shell", "slot_registry.js")
        with open(slot_path, encoding="utf-8") as handle:
            source = handle.read()

        for kind_name in ["file", "folder", "terminal"]:
            matches = re.findall(rf"['\"`]{kind_name}['\"`]", source, re.IGNORECASE)
            self.assertEqual(
                0,
                len(matches),
                f"Found kind name '{kind_name}' in shell/slot_registry.js: {matches}"
            )


if __name__ == "__main__":
    unittest.main()
