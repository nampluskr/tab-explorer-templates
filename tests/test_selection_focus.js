// Run with the local Electron binary; no visible window or host settings writes.
const { app, BrowserWindow } = require('electron');

app.disableHardwareAcceleration();
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1280, height: 800 });
  try {
    await win.loadFile(`${__dirname}/../shell/index.html`);
    const result = await win.webContents.executeJavaScript(`(async () => {
      const sh = window.__shell;
      const assert = (value, message) => { if (!value) throw new Error(message); };
      sh.treeModel.children.set('', [{ path: 'a', name: 'a', is_dir: false }]);
      sh.treeModel.cursorPath = 'a';
      sh.renderTree();
      sh.tabManager.openTab({ kind: 'file', resource: { path: 'a' }, title: 'a', pinned: true });
      sh.tabManager.splitActivePane();
      sh.tabManager.openTab({ kind: 'file', resource: { path: 'b' }, title: 'b', pinned: true });
      sh.renderEditor();
      const fileMenuButton = document.getElementById('btn-menu-file');
      fileMenuButton.click();
      let moveMenuItem = document.querySelector('#popover-menu-file [data-menu-action="move-tab"]');
      assert(moveMenuItem && !moveMenuItem.classList.contains('menu-item-disabled'), 'Move Tab enabled for unique target');
      fileMenuButton.click();
      const duplicateInActivePane = sh.tabManager.getTabsByPane(sh.tabManager.getActivePaneId())
        .find((tab) => tab.resource.path === 'a');
      sh.tabManager.activateTab(duplicateInActivePane.id);
      sh.renderEditor();
      fileMenuButton.click();
      moveMenuItem = [...document.querySelectorAll('#popover-menu-file .menu-item')]
        .find((item) => item.textContent.includes('Move Tab'));
      assert(moveMenuItem && moveMenuItem.classList.contains('menu-item-disabled'), 'Move Tab disabled for duplicate target');
      fileMenuButton.click();
      const areas = () => [document.getElementById('tree-root'), ...document.querySelectorAll('.editor-pane')];
      const selected = () => [document.querySelector('.tree-row.selected'), ...document.querySelectorAll('.tab.active')];
      const key = async (shift = false, ctrl = false) => {
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Tab', shiftKey: shift, ctrlKey: ctrl, bubbles: true, cancelable: true
        }));
        await Promise.resolve();
      };
      assert(areas().length === 3 && selected().length === 3, 'Three selected areas');
      const baseline = sh.tabManager.getAllTabs().map(t => t.id).join();
      for (const theme of ['white', 'gray', 'dark']) {
        sh.setTheme(theme);
        areas()[0].focus();
        const contentBackground = getComputedStyle(document.querySelector('.view-container')).backgroundColor;
        for (const index of [0, 1, 2, 0]) {
          assert(document.activeElement === areas()[index], theme + ': forward focus ' + index);
          const items = selected();
          items.slice(1).forEach((item, paneIndex) => {
            const style = getComputedStyle(item);
            assert(style.backgroundColor === contentBackground, theme + ': active tab matches content background');
            assert(style.outlineStyle === (index === paneIndex + 1 ? 'solid' : 'none'), theme + ': pane focus uses outline only');
          });
          assert(getComputedStyle(items[0]).backgroundColor === contentBackground, theme + ': selected explorer row matches content background');
          assert(getComputedStyle(items[0]).outlineStyle === (index === 0 ? 'solid' : 'none'), theme + ': explorer focus outline');
          await key();
        }
        areas()[0].focus();
        for (const index of [2, 1, 0]) {
          await key(true);
          assert(document.activeElement === areas()[index], theme + ': reverse focus ' + index);
        }
      }
      areas()[1].querySelector('.tab').click();
      assert(document.activeElement === areas()[1], 'Mouse selection focuses first pane');
      sh.renderEditor();
      assert(document.activeElement === areas()[1], 'Editor redraw restores focus');
      areas()[2].querySelector('.view-container').click();
      assert(document.activeElement === areas()[2], 'Content click focuses second pane');
      assert(sh.tabManager.getAllTabs().map(t => t.id).join() === baseline, 'Area navigation preserves tabs');
      sh.setZenMode(true);
      areas()[1].focus();
      await key();
      assert(document.activeElement === areas()[2], 'Zen skips hidden explorer');
      await key();
      assert(document.activeElement === areas()[1], 'Zen wraps between panes');
      sh.setZenMode(false);
      sh.tabManager.unsplit();
      sh.renderEditor();
      areas()[0].focus();
      await key();
      assert(document.activeElement === areas()[1], 'Unsplit forward');
      await key();
      assert(document.activeElement === areas()[0], 'Unsplit wraps');
      document.getElementById('btn-menu-help').click();
      document.querySelector('#popover-menu-help [data-menu-action="about"]').click();
      const toast = document.getElementById('app-toast');
      assert(toast && toast.textContent === 'Explorer Templates v0.1', 'About message content');
      assert(getComputedStyle(toast).position === 'fixed' && getComputedStyle(toast).visibility === 'visible', 'About message visible');
      return 'Selection styles and focus navigation passed in all three themes.';
    })()`);
    console.log(result);
    app.exit(0);
  } catch (error) {
    console.error(error);
    app.exit(1);
  }
});
