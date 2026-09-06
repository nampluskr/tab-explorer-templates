import json
import os
import re
import subprocess
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class PhaseThreeTests(unittest.TestCase):
    def test_run_node_tab_model_tests(self):
        """Node 환경에서 tab_model 단위 테스트 실행 (TE-016 ~ TE-019)."""
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_tab_model.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"test_tab_model.js failed:\n{res.stderr}\n{res.stdout}"
        )

    def test_shell_code_has_no_kind_comparisons(self):
        """껍데기 코드에서 종류 값과의 비교문이 0건이다 (FR-4)."""
        tab_model_path = os.path.join(PROJECT_ROOT, "shell", "tab_model.js")
        with open(tab_model_path, encoding="utf-8") as handle:
            source = handle.read()

        # Check for comparisons of kind against specific string literals (e.g. kind === '...', tab.kind == "..."), excluding typeof type checks
        matches = re.findall(r"(?<!typeof\s)(?:kind|\.kind)\s*[!=]==?\s*['\"][a-zA-Z0-9_-]+['\"]", source)
        self.assertEqual(
            0,
            len(matches),
            f"Found kind comparison against string literal in shell/tab_model.js: {matches}"
        )

    def test_shell_code_has_no_kind_name_strings(self):
        """껍데기 코드에서 종류 이름 문자열(file · folder · terminal 등)이 0건이다 (FR-4)."""
        tab_model_path = os.path.join(PROJECT_ROOT, "shell", "tab_model.js")
        with open(tab_model_path, encoding="utf-8") as handle:
            source = handle.read()

        for kind_name in ["file", "folder", "terminal"]:
            # Check for kind_name as string literal e.g. 'file', "file", `file`
            matches = re.findall(rf"['\"`]{kind_name}['\"`]", source, re.IGNORECASE)
            self.assertEqual(
                0,
                len(matches),
                f"Found kind name '{kind_name}' as string literal in shell/tab_model.js: {matches}"
            )

    def test_shell_code_never_uses_resource_address_as_tab_id(self):
        """껍데기 코드가 대상 주소를 탭 식별값으로 그대로 쓰는 곳이 0건이다 (FR-2)."""
        tab_model_path = os.path.join(PROJECT_ROOT, "shell", "tab_model.js")
        with open(tab_model_path, encoding="utf-8") as handle:
            source = handle.read()

        # id should not be assigned from resource.path or resource.address
        self.assertNotIn("id: resource.path", source)
        self.assertNotIn("id: resource.address", source)
        self.assertNotIn("id = resource.path", source)
        self.assertNotIn("id = resource.address", source)

    def test_resource_serialization_parity_across_both_hosts(self):
        """열린 탭 전부의 대상 설명이 직렬화 왕복을 손실 없이 통과하며, 두 갈래에서 결과가 같다 (FR-3)."""
        fixtures = [
            {"id": "tab-1", "kind": "data_cube", "title": "Cube A", "resource": {"dim": [100, 200, 50], "step": 0.5}},
            {"id": "tab-2", "kind": "log_stream", "title": "Logs", "resource": {"port": 9001, "filter": "WARN"}},
            {"id": "tab-3", "kind": "custom_note", "title": "Note", "resource": {"text": "hello\nworld", "tags": ["a", "b"]}},
        ]

        # Python serialization & deserialization
        py_serialized = json.dumps(fixtures, ensure_ascii=False)
        py_restored = json.loads(py_serialized)
        self.assertEqual(fixtures, py_restored)

        # Node serialization via subprocess
        node_script = (
            "const { serializeResources, deserializeResources } = require('./shell/tab_model.js');"
            f"const input = {json.dumps(fixtures)};"
            "const s = serializeResources(input);"
            "const r = deserializeResources(s);"
            "console.log(JSON.stringify(r));"
        )
        res = subprocess.run(
            ["node", "-e", node_script],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True
        )
        self.assertEqual(res.returncode, 0, f"Node serialization failed: {res.stderr}")
        node_restored = json.loads(res.stdout.strip())

        # Exact parity between Python and Node roundtrips
        self.assertEqual(py_restored, node_restored)
        for i in range(len(fixtures)):
            self.assertEqual(fixtures[i]["resource"], node_restored[i]["resource"])


if __name__ == "__main__":
    unittest.main()
