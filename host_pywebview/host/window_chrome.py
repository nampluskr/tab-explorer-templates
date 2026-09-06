"""Windows에서 프레임리스 창에 네이티브 창 관리 동작을 되돌려 준다.

pywebview는 프레임리스 창을 WinForms ``FormBorderStyle.None`` 으로 만든다. 그 순간
``WS_THICKFRAME`` 과 ``WS_MAXIMIZEBOX`` 스타일이 빠지고, Windows는 이 창을 Aero Snap
대상(``Win``+방향키, 화면 가장자리 끌기)으로 보지 않으며 최대화·복원 처리도 어긋난다.

여기서 두 스타일을 다시 켜고, ``WM_NCCALCSIZE`` 를 0으로 처리해 비클라이언트 영역을
없앤다. 스타일만 켜면 제목 표시줄과 테두리가 돌아오지만, 비클라이언트 영역을 0으로
만들면 화면상으로는 프레임리스 그대로이면서 창 관리 동작(스냅·리사이즈·최대화)만
살아난다. 이것이 커스텀 프레임 창의 표준 수법이다.

실행 환경(Windows·WinForms)을 아는 코드다. 그래서 host/ 에만 둔다(D-20).
"""
import ctypes
from ctypes import wintypes


_GWL_STYLE = -16
_GWLP_WNDPROC = -4
_WS_THICKFRAME = 0x00040000
_WS_MAXIMIZEBOX = 0x00010000
_WM_NCCALCSIZE = 0x0083
# SWP_NOSIZE | SWP_NOMOVE | SWP_NOZORDER | SWP_FRAMECHANGED
_SWP_FLAGS = 0x0001 | 0x0002 | 0x0004 | 0x0020

_LRESULT = ctypes.c_ssize_t
_WNDPROC = ctypes.WINFUNCTYPE(
    _LRESULT, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM
)

# 설치한 창의 서브클래스 콜백을 붙잡아 둔다. 놓으면 GC가 수거해 창 프로시저가 깨진다.
_installed = {}


def _prepare(user32):
    user32.GetWindowLongPtrW.restype = ctypes.c_void_p
    user32.GetWindowLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int]
    user32.SetWindowLongPtrW.restype = ctypes.c_void_p
    user32.SetWindowLongPtrW.argtypes = [wintypes.HWND, ctypes.c_int, ctypes.c_void_p]
    user32.CallWindowProcW.restype = _LRESULT
    user32.CallWindowProcW.argtypes = [
        ctypes.c_void_p, wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM
    ]
    user32.SetWindowPos.argtypes = [
        wintypes.HWND, wintypes.HWND, ctypes.c_int, ctypes.c_int,
        ctypes.c_int, ctypes.c_int, wintypes.UINT
    ]


def patch_drag_move():
    """pywebview 6.2.1의 winforms move() 버그를 우회한다.

    프레임리스 창을 끌면 pywebview가 창을 옮기려고 ``SetWindowPos`` 를 부르는데,
    크기 인자로 ``None`` 을 넘겨 ``ctypes.ArgumentError`` 로 죽는다(SWP_NOSIZE라 값은
    무시되지만 정수여야 한다). 여기서 그 메서드를 정수 0을 넘기는 판으로 갈아 끼운다.
    """
    try:
        from webview.platforms import winforms
    except Exception:
        return

    form = winforms.BrowserView.BrowserForm
    if getattr(form, "_drag_move_patched", False):
        return

    _SWP_NOSIZE_NOZORDER_SHOW = 0x0001 | 0x0004 | 0x0040

    def move(self, x, y):
        scale = self._scale
        ctypes.windll.user32.SetWindowPos(
            self.Handle.ToInt32(), None,
            int(x * scale), int(y * scale), 0, 0,
            _SWP_NOSIZE_NOZORDER_SHOW,
        )

    form.move = move
    form._drag_move_patched = True


def enable_native_window_management(hwnd):
    """프레임리스 창(HWND)에 스냅·최대화·복원용 창 스타일을 되돌리고 제목 표시줄은 숨긴다."""
    hwnd = int(hwnd)
    if hwnd in _installed:
        return

    user32 = ctypes.windll.user32
    _prepare(user32)

    style = user32.GetWindowLongPtrW(wintypes.HWND(hwnd), _GWL_STYLE)
    user32.SetWindowLongPtrW(
        wintypes.HWND(hwnd), _GWL_STYLE, style | _WS_THICKFRAME | _WS_MAXIMIZEBOX
    )

    original = user32.GetWindowLongPtrW(wintypes.HWND(hwnd), _GWLP_WNDPROC)

    def _wndproc(window, message, wparam, lparam):
        if message == _WM_NCCALCSIZE and wparam:
            return 0  # 비클라이언트 영역 없음 → 제목 표시줄·테두리가 화면에 돌아오지 않는다
        return user32.CallWindowProcW(original, window, message, wparam, lparam)

    proc = _WNDPROC(_wndproc)
    _installed[hwnd] = (proc, original)
    user32.SetWindowLongPtrW(
        wintypes.HWND(hwnd), _GWLP_WNDPROC, ctypes.cast(proc, ctypes.c_void_p)
    )
    user32.SetWindowPos(wintypes.HWND(hwnd), None, 0, 0, 0, 0, _SWP_FLAGS)
