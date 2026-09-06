const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const APP_NAME = "Explorer Templates";
const APP_VERSION = "v0.1";
const RUNTIME_NAME = "Electron";

let windowRef;
const settingsPath = path.join(__dirname, "..", "settings.json");
const defaults = {
  version: 1,
  shell: {
    theme: "gray",
    icon_theme: "simple",
    sidebar_width: 280,
    sidebar_collapsed: false,
    root_path: "",
    recent_folders: []
  }
};

const themeBackground = {
  white: "#ffffff",
  gray: "#353b44",
  dark: "#090c10"
};

function readSettings() {
  try {
    if (!fs.existsSync(settingsPath)) {
      fs.writeFileSync(settingsPath, JSON.stringify(defaults, null, 2));
      return { settings: defaults };
    }
    const loaded = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    return {
      settings: {
        ...defaults,
        ...loaded,
        shell: { ...defaults.shell, ...(loaded.shell || {}) }
      }
    };
  } catch {
    return { settings: defaults };
  }
}

const settingsState = readSettings();

function createWindow() {
  const currentTheme = settingsState.settings.shell.theme || "gray";
  const backgroundColor = themeBackground[currentTheme] || themeBackground.gray;

  windowRef = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    backgroundColor: backgroundColor,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  const entryHtml = path.join(__dirname, "..", "..", "shell", "index.html");
  windowRef.loadFile(entryHtml);

  windowRef.webContents.on("did-finish-load", () => {
    windowRef.webContents.insertCSS(
      ".drag-region { -webkit-app-region: drag; } " +
      ".menu-button, .window-btn, .rail-btn, .icon-btn, .splitter { -webkit-app-region: no-drag; }"
    );
  });

  windowRef.on("maximize", () => windowRef.webContents.send("window-state", true));
  windowRef.on("unmaximize", () => windowRef.webContents.send("window-state", false));
}

// 창 제어 최소 ipc 핸들러 (Phase 2에서 정식 계약 구현)
ipcMain.handle("bridge", async (_event, method, ...args) => {
  if (method === "minimize") {
    if (windowRef) windowRef.minimize();
    return { ok: true };
  }
  if (method === "toggle_maximize") {
    if (!windowRef) return { ok: false };
    if (windowRef.isMaximized()) {
      windowRef.unmaximize();
    } else {
      windowRef.maximize();
    }
    return { ok: true, value: windowRef.isMaximized() };
  }
  if (method === "close") {
    if (windowRef) windowRef.close();
    return { ok: true };
  }
  if (method === "get_settings") {
    return {
      ok: true,
      value: {
        shell: settingsState.settings.shell,
        runtime: {
          app_name: APP_NAME,
          app_version: APP_VERSION,
          build_date: new Date().toISOString().slice(0, 10),
          runtime_name: RUNTIME_NAME
        }
      }
    };
  }
  return { ok: false, error: { code: "UNSUPPORTED_TARGET", message: "Not implemented in Phase 1" } };
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});