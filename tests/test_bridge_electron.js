const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const hostElectronMain = require("../host_electron/host/main.js");
const { handleBridge, setRootPath, setSettingsPath, setSettingsState } = hostElectronMain;

async function runTests() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "electron-test-"));
  const realRoot = fs.realpathSync.native ? fs.realpathSync.native(tempDir) : fs.realpathSync(tempDir);
  setRootPath(realRoot);
  setSettingsPath(path.join(tempDir, "settings.json"));

  const subDir = path.join(realRoot, "folder");
  fs.mkdirSync(subDir);
  const filePath = path.join(realRoot, "alpha.txt");
  fs.writeFileSync(filePath, "fixture content", "utf8");

  setSettingsState({
    settings: {
      version: 1,
      shell: {
        theme: "gray",
        icon_theme: "simple",
        sidebar_width: 280,
        sidebar_collapsed: false,
        root_path: realRoot,
        recent_folders: []
      }
    },
    notice: null
  });

  try {
    // 1. list_children normal
    const normalRes = await handleBridge("list_children", "");
    assert.strictEqual(normalRes.ok, true);
    assert.strictEqual(normalRes.value.length, 2);
    assert.strictEqual(normalRes.value[0].name, "folder");
    assert.strictEqual(normalRes.value[0].is_dir, true);
    assert.strictEqual(normalRes.value[0].blocked, false);
    assert.strictEqual(normalRes.value[1].name, "alpha.txt");
    assert.strictEqual(normalRes.value[1].is_dir, false);
    assert.strictEqual(normalRes.value[1].blocked, false);
    assert.ok(normalRes.value[1].size > 0);
    assert.ok(normalRes.value[1].created_at_ms !== null);

    // 2. reject .. parent escape paths
    const escapeCases = ["..", "../", "..\\", "folder/..", "folder\\..\\alpha.txt", "folder/../../outside"];
    for (const esc of escapeCases) {
      const res = await handleBridge("list_children", esc);
      assert.strictEqual(res.ok, false, `Expected failure for '${esc}'`);
      assert.strictEqual(res.error.code, "ROOT_ESCAPE", `Expected ROOT_ESCAPE for '${esc}'`);
    }

    // 3. reject absolute paths
    const absCases = ["C:\\Windows", "C:/Windows", "/etc", "\\Windows", "D:\\some\\dir"];
    for (const abs of absCases) {
      const res = await handleBridge("list_children", abs);
      assert.strictEqual(res.ok, false, `Expected failure for '${abs}'`);
      assert.strictEqual(res.error.code, "ROOT_ESCAPE", `Expected ROOT_ESCAPE for '${abs}'`);
    }

    // 4. reject symlinks pointing outside root
    const outsideDir = fs.mkdtempSync(path.join(os.tmpdir(), "outside-test-"));
    const symlinkPath = path.join(realRoot, "outside_link");
    try {
      fs.symlinkSync(outsideDir, symlinkPath, "junction");
      const symRes = await handleBridge("list_children", "outside_link");
      assert.strictEqual(symRes.ok, false);
      assert.strictEqual(symRes.error.code, "ROOT_ESCAPE");

      const parentRes = await handleBridge("list_children", "");
      const linkEntry = parentRes.value.find((e) => e.name === "outside_link");
      assert.ok(linkEntry);
      assert.strictEqual(linkEntry.blocked, true);
      assert.strictEqual(linkEntry.path, "");
    } catch (e) {
      // Symlinks may not be allowed on certain Windows permissions, ignore if permission fails
      if (e.code !== "EPERM") throw e;
    } finally {
      try {
        fs.rmSync(outsideDir, { recursive: true, force: true });
        if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
      } catch {}
    }

    // 5. distinguishes missing (NOT_FOUND) and file (UNSUPPORTED_TARGET)
    const missingRes = await handleBridge("list_children", "nonexistent_folder");
    assert.strictEqual(missingRes.ok, false);
    assert.strictEqual(missingRes.error.code, "NOT_FOUND");

    const fileRes = await handleBridge("list_children", "alpha.txt");
    assert.strictEqual(fileRes.ok, false);
    assert.strictEqual(fileRes.error.code, "UNSUPPORTED_TARGET");

    // 6. get_settings and save_settings
    const settingsRes = await handleBridge("get_settings");
    assert.strictEqual(settingsRes.ok, true);
    assert.strictEqual(settingsRes.value.runtime.runtime_name, "Electron");
    assert.strictEqual(settingsRes.value.runtime.app_name, "Explorer Templates");

    await handleBridge("save_settings", { theme: "dark", sidebar_width: 320 });
    const updatedSettings = await handleBridge("get_settings");
    assert.strictEqual(updatedSettings.value.shell.theme, "dark");
    assert.strictEqual(updatedSettings.value.shell.sidebar_width, 320);

    // 7. recent folders
    const recentRes = await handleBridge("get_recent_folders");
    assert.strictEqual(recentRes.ok, true);

    const clearRes = await handleBridge("clear_recent_folders");
    assert.strictEqual(clearRes.ok, true);

    // 8. call_domain returns UNSUPPORTED_TARGET
    const domainRes = await handleBridge("call_domain", "something");
    assert.strictEqual(domainRes.ok, false);
    assert.strictEqual(domainRes.error.code, "UNSUPPORTED_TARGET");

    console.log("All Electron bridge tests passed successfully!");
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

runTests().catch((err) => {
  console.error("Electron bridge test failed:", err);
  process.exit(1);
});
