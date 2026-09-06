import os
import re
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

REQUIRED_OPERATIONS = (
    "choose_root",
    "set_root",
    "get_recent_folders",
    "clear_recent_folders",
    "list_children",
    "minimize",
    "toggle_maximize",
    "close",
    "get_settings",
    "save_settings",
    "call_domain",
)

REQUIRED_ERROR_CODES = (
    "ROOT_ESCAPE",
    "NOT_FOUND",
    "PERMISSION_DENIED",
    "READ_FAILED",
    "USER_CANCELLED",
    "UNSUPPORTED_TARGET",
)


class ParityTests(unittest.TestCase):
    def test_both_hosts_use_shared_shell_and_tokens(self):
        index_path = os.path.join(PROJECT_ROOT, "shell", "index.html")
        with open(index_path, encoding="utf-8") as handle:
            index = handle.read()
        self.assertIn("../shared/design/tokens.css", index)
        self.assertIn("app.js", index)

    def test_both_hosts_implement_the_required_operations(self):
        pywebview_bridge_path = os.path.join(PROJECT_ROOT, "host_pywebview", "host", "bridge.py")
        electron_main_path = os.path.join(PROJECT_ROOT, "host_electron", "host", "main.js")

        with open(pywebview_bridge_path, encoding="utf-8") as handle:
            py_source = handle.read()
        with open(electron_main_path, encoding="utf-8") as handle:
            electron_source = handle.read()

        for op in REQUIRED_OPERATIONS:
            self.assertIn(f"def {op}", py_source, f"PyWebView bridge missing operation: {op}")
            self.assertIn(f'"{op}"', electron_source, f"Electron host missing operation: {op}")

    def test_both_hosts_use_the_shared_error_codes(self):
        pywebview_bridge_path = os.path.join(PROJECT_ROOT, "host_pywebview", "host", "bridge.py")
        electron_main_path = os.path.join(PROJECT_ROOT, "host_electron", "host", "main.js")

        with open(pywebview_bridge_path, encoding="utf-8") as handle:
            py_source = handle.read()
        with open(electron_main_path, encoding="utf-8") as handle:
            electron_source = handle.read()

        for code in REQUIRED_ERROR_CODES:
            self.assertIn(f'"{code}"', py_source, f"PyWebView bridge missing error code: {code}")
            self.assertIn(f'"{code}"', electron_source, f"Electron host missing error code: {code}")

    def test_shell_code_does_not_request_operations_outside_contract(self):
        shell_app_path = os.path.join(PROJECT_ROOT, "shell", "app.js")
        with open(shell_app_path, encoding="utf-8") as handle:
            shell_source = handle.read()

        bridge_calls = re.findall(r"window\.bridge\.([a-zA-Z0-9_]+)", shell_source)
        for call in bridge_calls:
            self.assertIn(
                call,
                REQUIRED_OPERATIONS,
                f"Shell calls bridge method '{call}' which is outside the bridge contract!"
            )

    def test_shell_code_has_no_domain_names(self):
        """껍데기 코드에 도메인 이름이 나타나는 곳이 0건이다 (Phase 2 완료 조건)."""
        shell_dir = os.path.join(PROJECT_ROOT, "shell")
        # Known domain concepts / names that shell must NOT know about
        prohibited_domain_keywords = [
            "markdown",
            "image_viewer",
            "media_player",
            "hex_viewer",
            "text_editor",
            "terminal_domain",
            "pdf_viewer",
        ]
        for root, _, files in os.walk(shell_dir):
            for file in files:
                if file.endswith((".js", ".html")):
                    path = os.path.join(root, file)
                    with open(path, encoding="utf-8") as handle:
                        content = handle.read().lower()
                    for keyword in prohibited_domain_keywords:
                        self.assertNotIn(
                            keyword,
                            content,
                            f"Prohibited domain keyword '{keyword}' found in shell file: {path}"
                        )

    def test_electron_bridge_integration(self):
        import subprocess
        res = subprocess.run(
            ["node", os.path.join(PROJECT_ROOT, "tests", "test_bridge_electron.js")],
            capture_output=True,
            text=True
        )
        self.assertEqual(
            res.returncode,
            0,
            f"Electron bridge test failed:\n{res.stderr}\n{res.stdout}"
        )


if __name__ == "__main__":
    unittest.main()
