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


class BridgeStub:
    """최소 브리지 스텁 (Phase 2에서 정식 계약 구현)"""
    pass


def main():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    shell_path = "/shell/index.html"
    webview.settings["DRAG_REGION_SELECTOR"] = ".drag-region"
    static_app = ProjectStaticApp(project_root, shell_path)
    bridge = BridgeStub()

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
    webview.start(debug="--debug" in sys.argv)


if __name__ == "__main__":
    main()