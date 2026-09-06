import mimetypes
import os
import sys
from urllib.parse import unquote
import webview

WINDOW_WIDTH = 1280
WINDOW_HEIGHT = 800


class ProjectStaticApp:
    def __init__(self, project_root, entry_path):
        self.project_root = os.path.abspath(project_root)
        self.entry_path = entry_path

    def __call__(self, environ, start_response):
        method = environ.get("REQUEST_METHOD", "GET").upper()
        if method not in ("GET", "HEAD"):
            return self._respond(start_response, "405 Method Not Allowed", b"")

        request_path = unquote(environ.get("PATH_INFO", "/"))
        if request_path == "/":
            start_response("302 Found", [("Location", self.entry_path), ("Content-Length", "0")])
            return [b""]

        relative_path = request_path.lstrip("/").replace("/", os.sep)
        file_path = os.path.abspath(os.path.join(self.project_root, relative_path))
        try:
            common_path = os.path.commonpath((self.project_root, file_path))
            is_inside_root = os.path.normcase(common_path) == os.path.normcase(self.project_root)
        except ValueError:
            is_inside_root = False

        if not is_inside_root or not os.path.isfile(file_path):
            return self._respond(start_response, "404 Not Found", b"Not found")

        with open(file_path, "rb") as handle:
            body = handle.read()
        extension = os.path.splitext(file_path)[1].lower()
        content_type = {
            ".js": "text/javascript",
            ".css": "text/css",
            ".svg": "image/svg+xml",
            ".json": "application/json",
            ".html": "text/html; charset=utf-8",
        }.get(extension)
        content_type = content_type or mimetypes.guess_type(file_path)[0] or "application/octet-stream"
        return self._respond(start_response, "200 OK", body, content_type, method == "HEAD")

    @staticmethod
    def _respond(start_response, status, body, content_type="text/plain; charset=utf-8", head=False):
        headers = [("Content-Type", content_type), ("Content-Length", str(len(body)))]
        start_response(status, headers)
        return [b"" if head else body]


from host.bridge import Bridge


def _enable_native_window_management(window):
    """프레임리스 창에 스냅·최대화·복원용 네이티브 동작을 붙인다. Windows에서만 의미가 있다."""
    native = getattr(window, "native", None)
    handle = getattr(native, "Handle", None)
    if handle is None:
        return
    try:
        from host.window_chrome import enable_native_window_management

        enable_native_window_management(handle.ToInt32())
    except Exception:
        pass


def connect_window_events(window, bridge=None):
    def on_shown():
        # pywebview 프레임리스 전환 시 축소되는 현상을 방지하기 위해 shown 이벤트에서 1280x800 재적용
        window.resize(WINDOW_WIDTH, WINDOW_HEIGHT)
        _enable_native_window_management(window)

    window.events.shown += on_shown
    if bridge is not None:
        window.events.maximized += lambda: bridge.notify_window_state(True)
        window.events.restored += lambda: bridge.notify_window_state(False)
    window.events._pywebviewready += lambda: window.evaluate_js(
        "window.bridge=window.pywebview.api;window.dispatchEvent(new Event('bridge-ready'));"
    )


def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    shell_path = "/shell/index.html"
    webview.settings["DRAG_REGION_SELECTOR"] = ".drag-region"
    try:
        from host.window_chrome import patch_drag_move

        patch_drag_move()
    except Exception:
        pass

    cli_root = None
    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            cli_root = os.path.abspath(arg)
            break

    settings_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "settings.json")
    static_app = ProjectStaticApp(project_root, shell_path)
    bridge = Bridge(settings_path=settings_path, cli_root=cli_root)

    window = webview.create_window(
        "Explorer Templates",
        static_app,
        width=WINDOW_WIDTH,
        height=WINDOW_HEIGHT,
        frameless=True,
        easy_drag=False,
        background_color="#353b44",
        js_api=bridge,
    )
    bridge.bind_window(window)
    connect_window_events(window, bridge)
    webview.start(debug="--debug" in sys.argv)



if __name__ == "__main__":
    main()