import json
import os
import sys
import tempfile
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PYWEBVIEW_DIR = os.path.join(PROJECT_ROOT, "host_pywebview")
sys.path.insert(0, PYWEBVIEW_DIR)

from host.bridge import Bridge


class PyWebViewBridgeTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.settings_dir = tempfile.TemporaryDirectory()
        self.root_path = os.path.realpath(self.temp_dir.name)
        self.settings_path = os.path.join(self.settings_dir.name, "settings.json")
        self.bridge = Bridge(settings_path=self.settings_path)
        self.bridge.root_path = self.root_path

        # Create test fixtures inside root
        self.sub_dir = os.path.join(self.root_path, "folder")
        os.mkdir(self.sub_dir)
        self.file_path = os.path.join(self.root_path, "alpha.txt")
        with open(self.file_path, "w", encoding="utf-8") as handle:
            handle.write("fixture content")

    def tearDown(self):
        self.temp_dir.cleanup()
        self.settings_dir.cleanup()

    def test_list_children_normal(self):
        result = self.bridge.list_children("")
        self.assertTrue(result["ok"])
        names = [item["name"] for item in result["value"]]
        # Folders first, then files
        self.assertEqual(["folder", "alpha.txt"], names)
        # folder entry details
        folder_entry = result["value"][0]
        self.assertTrue(folder_entry["is_dir"])
        self.assertFalse(folder_entry["blocked"])
        # file entry details
        file_entry = result["value"][1]
        self.assertFalse(file_entry["is_dir"])
        self.assertFalse(file_entry["blocked"])
        self.assertGreater(file_entry["size"], 0)
        self.assertIsNotNone(file_entry["created_at_ms"])

    def test_rejects_parent_escape_paths(self):
        """.. 포함 경로 거부 (ROOT_ESCAPE)"""
        cases = ["..", "../", "..\\", "folder/..", "folder\\..\\alpha.txt", "folder/../../outside"]
        for case in cases:
            res = self.bridge.list_children(case)
            self.assertFalse(res["ok"], f"Expected rejection for '{case}'")
            self.assertEqual("ROOT_ESCAPE", res["error"]["code"], f"Expected ROOT_ESCAPE for '{case}'")

    def test_rejects_absolute_paths(self):
        """절대 경로 거부 (ROOT_ESCAPE)"""
        cases = [
            os.path.abspath(os.sep),
            "C:\\Windows",
            "C:/Windows",
            "/etc",
            "\\Windows",
            "D:\\some\\dir"
        ]
        for case in cases:
            res = self.bridge.list_children(case)
            self.assertFalse(res["ok"], f"Expected rejection for '{case}'")
            self.assertEqual("ROOT_ESCAPE", res["error"]["code"], f"Expected ROOT_ESCAPE for '{case}'")

    def test_rejects_symlink_pointing_outside_root(self):
        """루트 밖을 가리키는 심볼릭 링크 거부 (ROOT_ESCAPE) 및 blocked 표시"""
        outside_dir = tempfile.TemporaryDirectory()
        try:
            outside_target = outside_dir.name
            symlink_path = os.path.join(self.root_path, "outside_link")
            try:
                os.symlink(outside_target, symlink_path, target_is_directory=True)
            except OSError:
                # Windows might require admin privileges or Developer Mode for symlinks
                return

            # Direct call to list_children on the symlink
            res = self.bridge.list_children("outside_link")
            self.assertFalse(res["ok"])
            self.assertEqual("ROOT_ESCAPE", res["error"]["code"])

            # Listing parent directory should show it as blocked
            parent_res = self.bridge.list_children("")
            link_entry = next((e for e in parent_res["value"] if e["name"] == "outside_link"), None)
            self.assertIsNotNone(link_entry)
            self.assertTrue(link_entry["blocked"])
            self.assertEqual("", link_entry["path"])
        finally:
            outside_dir.cleanup()

    def test_distinguishes_not_found_and_unsupported_target(self):
        """존재하지 않는 경로(NOT_FOUND)와 파일(UNSUPPORTED_TARGET)이 ROOT_ESCAPE와 명확히 구분된다."""
        res_missing = self.bridge.list_children("nonexistent_folder")
        self.assertFalse(res_missing["ok"])
        self.assertEqual("NOT_FOUND", res_missing["error"]["code"])

        res_file = self.bridge.list_children("alpha.txt")
        self.assertFalse(res_file["ok"])
        self.assertEqual("UNSUPPORTED_TARGET", res_file["error"]["code"])

    def test_settings_preservation_and_recent_folders(self):
        self.bridge.settings["shell"]["recent_folders"] = [self.root_path]
        self.bridge.save_settings({"theme": "dark", "sidebar_width": 320})

        reloaded = Bridge(settings_path=self.settings_path)
        settings = reloaded.get_settings()
        self.assertTrue(settings["ok"])
        self.assertEqual("dark", settings["value"]["shell"]["theme"])
        self.assertEqual(320, settings["value"]["shell"]["sidebar_width"])
        self.assertEqual([self.root_path], settings["value"]["shell"]["recent_folders"])

    def test_clear_recent_folders(self):
        self.bridge.settings["shell"]["recent_folders"] = [self.root_path]
        res = self.bridge.clear_recent_folders()
        self.assertTrue(res["ok"])
        self.assertEqual([], self.bridge.settings["shell"]["recent_folders"])

    def test_toggle_maximize_tracked_state(self):
        calls = []
        window = type("MockWindow", (), {
            "maximize": lambda self: calls.append("maximize"),
            "restore": lambda self: calls.append("restore"),
            "evaluate_js": lambda self, s: None,
        })()
        self.bridge.bind_window(window)

        self.bridge.toggle_maximize()
        self.bridge.notify_window_state(True)
        self.bridge.toggle_maximize()
        self.bridge.notify_window_state(False)
        self.bridge.toggle_maximize()

        self.assertEqual(["maximize", "restore", "maximize"], calls)

    def test_call_domain_returns_unsupported_target(self):
        res = self.bridge.call_domain("any_domain", 1, 2)
        self.assertFalse(res["ok"])
        self.assertEqual("UNSUPPORTED_TARGET", res["error"]["code"])


if __name__ == "__main__":
    unittest.main()
