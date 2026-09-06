import json
import os
import re
from datetime import date

APP_NAME = "Explorer Templates"
APP_VERSION = "v0.1"
RUNTIME_NAME = "PyWebView"

ERROR_MESSAGES = {
    "ROOT_ESCAPE": "The requested path is outside the selected root.",
    "NOT_FOUND": "The requested path does not exist.",
    "PERMISSION_DENIED": "Permission was denied.",
    "READ_FAILED": "The directory could not be read.",
    "USER_CANCELLED": "Folder selection was cancelled.",
    "UNSUPPORTED_TARGET": "The requested target is not supported.",
}


def success(value=None):
    if value is not None:
        return {"ok": True, "value": value}
    return {"ok": True}


def failure(code):
    return {"ok": False, "error": {"code": code, "message": ERROR_MESSAGES[code]}}


class Bridge:
    """The only surface exposed by the host to the Shell (FR-36)."""

    def __init__(self, settings_path=None, cli_root=None):
        self._window = None
        self._maximized = False
        self.root_path = None
        self.settings_path = settings_path
        self.startup_notice = None
        self.settings = self._load_settings()

        saved_root = self.settings["shell"].get("root_path", "")
        # D-24: CLI 인자가 저장된 값보다 항상 우선한다.
        effective_root = cli_root if cli_root is not None else saved_root
        if effective_root and os.path.isdir(effective_root):
            self.root_path = os.path.realpath(effective_root)
            if cli_root is not None:
                self.settings["shell"]["root_path"] = self.root_path
                self._write_settings()
            self._push_recent(self.root_path)
        elif effective_root:
            self.startup_notice = f"Saved root is unavailable: {effective_root}"

    def bind_window(self, window):
        self._window = window

    def choose_root(self):
        import webview

        if not self._window:
            return failure("READ_FAILED")
        selected = self._window.create_file_dialog(webview.FileDialog.FOLDER)
        if not selected:
            return failure("USER_CANCELLED")
        self.root_path = os.path.realpath(selected[0])
        self._push_recent(self.root_path)
        return success(self.root_path)

    def set_root(self, path):
        if not path or not os.path.isdir(path):
            return failure("NOT_FOUND")
        self.root_path = os.path.realpath(path)
        self._push_recent(self.root_path)
        return success(self.root_path)

    def get_recent_folders(self):
        recent = self.settings["shell"].get("recent_folders", [])
        valid = [p for p in recent if os.path.isdir(p)]
        if valid != recent:
            self.settings["shell"]["recent_folders"] = valid
            self._write_settings()
        return success(valid)

    def clear_recent_folders(self):
        self.settings["shell"]["recent_folders"] = []
        self._write_settings()
        return success()

    def list_children(self, relative_path=""):
        if not self.root_path:
            return failure("NOT_FOUND")
        target_result = self._resolve_inside_root(relative_path)
        if not target_result["ok"]:
            return target_result
        target = target_result["value"]
        if not os.path.exists(target):
            return failure("NOT_FOUND")
        if not os.path.isdir(target):
            return failure("UNSUPPORTED_TARGET")

        try:
            entries = []
            with os.scandir(target) as iterator:
                for entry in iterator:
                    try:
                        resolved = os.path.realpath(entry.path)
                        blocked = not self._is_inside_root(resolved)
                    except OSError:
                        resolved = entry.path
                        blocked = True

                    if blocked:
                        entries.append({
                            "name": entry.name,
                            "path": "",
                            "is_dir": False,
                            "blocked": True,
                        })
                        continue

                    is_dir = entry.is_dir(follow_symlinks=False)
                    size = None
                    created_at_ms = None
                    if not is_dir:
                        try:
                            stat_res = entry.stat(follow_symlinks=False)
                            size = stat_res.st_size
                            created_sec = getattr(stat_res, "st_birthtime", stat_res.st_ctime)
                            created_at_ms = int(created_sec * 1000)
                        except OSError:
                            pass

                    entries.append({
                        "name": entry.name,
                        "path": os.path.relpath(resolved, self.root_path),
                        "is_dir": is_dir,
                        "size": size,
                        "created_at_ms": created_at_ms,
                        "blocked": False,
                    })

            entries.sort(key=lambda item: (not item["is_dir"], item["name"].casefold()))
            return success(entries)
        except PermissionError:
            return failure("PERMISSION_DENIED")
        except OSError:
            return failure("READ_FAILED")

    def minimize(self):
        if self._window:
            self._window.minimize()
        return success()

    def toggle_maximize(self):
        if not self._window:
            return failure("NOT_FOUND")
        if self._maximized:
            self._window.restore()
        else:
            self._window.maximize()
        return success(self._maximized)

    def close(self):
        if self._window:
            self._window.destroy()
        return success()

    def get_settings(self):
        return success({
            "shell": self.settings["shell"],
            "notice": self.startup_notice,
            "runtime": {
                "app_name": APP_NAME,
                "app_version": APP_VERSION,
                "build_date": date.today().isoformat(),
                "runtime_name": RUNTIME_NAME,
            },
        })

    def save_settings(self, shell_settings):
        current = self.settings["shell"]
        supplied = shell_settings if isinstance(shell_settings, dict) else {}
        self.settings["shell"] = self._normalize_shell_settings(supplied, current)
        self._write_settings()
        return success()

    def call_domain(self, target=None, *args):
        return failure("UNSUPPORTED_TARGET")

    def notify_window_state(self, maximized):
        self._maximized = bool(maximized)
        if self._window:
            state = "true" if maximized else "false"
            self._window.evaluate_js(
                f"(function() {{ "
                f"window.dispatchEvent(new CustomEvent('window-state', {{ detail: {state} }})); "
                f"if (typeof window.__hostWindowState === 'function') window.__hostWindowState({state}); "
                f"}})()"
            )

    def _resolve_inside_root(self, relative_path):
        if not isinstance(relative_path, str):
            return failure("ROOT_ESCAPE")

        normalized = relative_path.strip()
        if (
            os.path.isabs(normalized)
            or re.match(r"^[a-zA-Z]:", normalized)
            or normalized.startswith(("\\", "/"))
        ):
            return failure("ROOT_ESCAPE")

        parts = re.split(r"[\\/]", normalized)
        if ".." in parts:
            return failure("ROOT_ESCAPE")

        if normalized in ("", "."):
            return success(self.root_path)

        candidate = os.path.normpath(os.path.join(self.root_path, normalized))
        if not os.path.exists(candidate):
            return failure("NOT_FOUND")

        resolved = os.path.realpath(candidate)
        if not self._is_inside_root(resolved):
            return failure("ROOT_ESCAPE")

        return success(resolved)

    def _is_inside_root(self, candidate):
        if not self.root_path:
            return False
        try:
            common = os.path.commonpath([self.root_path, candidate])
            return os.path.normcase(common) == os.path.normcase(self.root_path)
        except (ValueError, OSError):
            return False

    def _push_recent(self, path):
        recent = [p for p in self.settings["shell"].get("recent_folders", []) if p != path]
        recent.insert(0, path)
        self.settings["shell"]["recent_folders"] = recent[:5]
        self._write_settings()

    def _default_settings(self):
        return {
            "version": 1,
            "shell": {
                "theme": "gray",
                "icon_theme": "simple",
                "sidebar_width": 280,
                "sidebar_collapsed": False,
                "root_path": "",
                "recent_folders": [],
            },
        }

    def _load_settings(self):
        defaults = self._default_settings()
        if not self.settings_path:
            return defaults
        try:
            if not os.path.exists(self.settings_path):
                self.settings = defaults
                self._write_settings()
                return defaults
            with open(self.settings_path, "r", encoding="utf-8") as handle:
                loaded = json.load(handle)
            shell = loaded.get("shell", {}) if isinstance(loaded, dict) else {}
            defaults["shell"] = self._normalize_shell_settings(shell, defaults["shell"])
            return defaults
        except (OSError, ValueError, json.JSONDecodeError):
            self.startup_notice = "Settings could not be read; defaults were used."
            self.settings = defaults
            self._write_settings()
            return defaults

    def _write_settings(self):
        if not self.settings_path:
            return
        payload = {
            "version": 1,
            "shell": self.settings["shell"],
        }
        with open(self.settings_path, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, ensure_ascii=False, indent=2)

    def _normalize_shell_settings(self, supplied, defaults):
        theme = supplied.get("theme", defaults["theme"])
        icon_theme = supplied.get("icon_theme", defaults.get("icon_theme", "simple"))
        width = supplied.get("sidebar_width", defaults["sidebar_width"])
        collapsed = supplied.get("sidebar_collapsed", defaults["sidebar_collapsed"])
        root_path = supplied.get("root_path", defaults["root_path"])
        recent = supplied.get("recent_folders", defaults.get("recent_folders", []))
        recent_folders = [p for p in recent if isinstance(p, str)][:5] if isinstance(recent, list) else []
        return {
            "theme": theme if theme in ("white", "gray", "dark") else defaults["theme"],
            "icon_theme": icon_theme if icon_theme in ("simple", "builtin", "vsicons") else "simple",
            "sidebar_width": width if isinstance(width, (int, float)) and width >= 140 else defaults["sidebar_width"],
            "sidebar_collapsed": collapsed if isinstance(collapsed, bool) else defaults["sidebar_collapsed"],
            "root_path": root_path if isinstance(root_path, str) else defaults["root_path"],
            "recent_folders": recent_folders,
        }
