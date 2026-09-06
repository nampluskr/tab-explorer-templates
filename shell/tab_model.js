// shell/tab_model.js — 리소스와 탭 핵심 모델 (Phase 3)
// 껍데기는 리소스 종류를 알지 못하며, 임의의 종류 문자열을 받아 전달·관리한다 (FR-1, FR-4).
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TabModel = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let nextSeq = 1;

  function generateTabId() {
    return 'tab-' + Date.now().toString(36) + '-' + (nextSeq++);
  }

  function isPlainObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return false;

    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  const DUPLICATE_POLICY = {
    REUSE_EXISTING: 'reuse_existing',
    ALWAYS_NEW: 'always_new'
  };

  class KindRegistry {
    constructor() {
      this._entries = new Map();
    }

    register(kind, options = {}) {
      if (!kind || typeof kind !== 'string') {
        throw new Error('Kind must be a non-empty string');
      }
      this._entries.set(kind, {
        duplicatePolicy: options.duplicatePolicy || DUPLICATE_POLICY.REUSE_EXISTING,
        equalityChecker: options.equalityChecker || null,
        viewProvider: options.viewProvider || null,
        ...options
      });
    }

    get(kind) {
      return this._entries.get(kind);
    }

    has(kind) {
      return this._entries.has(kind);
    }

    unregister(kind) {
      return this._entries.delete(kind);
    }

    clear() {
      this._entries.clear();
    }
  }

  function createTab({
    id = generateTabId(),
    kind,
    title = '',
    resource = {},
    viewState = null,
    paneId = 'main',
    pinned = false,
    preview = false
  }) {
    if (!kind || typeof kind !== 'string') {
      throw new Error('Tab kind must be a non-empty string');
    }
    if (!id || typeof id !== 'string') {
      throw new Error('Tab id must be a non-empty string');
    }

    return {
      id,
      kind,
      title: String(title),
      resource: isPlainObject(resource) ? { ...resource } : resource,
      viewState: viewState,
      paneId: String(paneId),
      pinned: Boolean(pinned),
      preview: Boolean(preview)
    };
  }

  class TabManager {
    constructor(registry = new KindRegistry()) {
      this.registry = registry;
      this._tabs = new Map();
      this._panes = ['main'];
      this._activePaneId = 'main';
      this._activeTabIdByPane = new Map([['main', null]]);
      this._listeners = new Set();
    }

    subscribe(listener) {
      this._listeners.add(listener);
      return () => this._listeners.delete(listener);
    }

    _emit(eventName, detail) {
      for (const listener of this._listeners) {
        try {
          listener(eventName, detail);
        } catch (e) {
          console.error('Error in TabManager listener', e);
        }
      }
    }

    getPanes() {
      return [...this._panes];
    }

    getActivePaneId() {
      return this._activePaneId;
    }

    setActivePaneId(paneId) {
      if (this._panes.includes(paneId)) {
        this._activePaneId = paneId;
        this._emit('pane-activated', { paneId });
      }
    }

    getTab(tabId) {
      return this._tabs.get(tabId) || null;
    }

    getAllTabs() {
      return Array.from(this._tabs.values());
    }

    getTabsByPane(paneId = this._activePaneId) {
      return this.getAllTabs().filter((tab) => tab.paneId === paneId);
    }

    getActiveTab(paneId = this._activePaneId) {
      const tabId = this._activeTabIdByPane.get(paneId);
      return tabId ? this.getTab(tabId) : null;
    }

    openTab({
      kind,
      resource = {},
      title = '',
      paneId = this._activePaneId,
      preview = false,
      pinned = false,
      duplicatePolicy = null
    }) {
      if (!kind || typeof kind !== 'string') {
        throw new Error('Kind must be a non-empty string');
      }

      const targetPaneId = this._panes.includes(paneId) ? paneId : this._activePaneId;
      const registeredConfig = this.registry.get(kind) || {};
      const policy = duplicatePolicy || registeredConfig.duplicatePolicy || DUPLICATE_POLICY.REUSE_EXISTING;
      const checker = registeredConfig.equalityChecker;

      // 중복 정책 판정 (FR-2, FR-8)
      if (policy === DUPLICATE_POLICY.REUSE_EXISTING || typeof policy === 'function') {
        const paneTabs = this.getTabsByPane(targetPaneId);
        const existing = paneTabs.find((candidate) => {
          if (candidate.kind !== kind) return false;
          if (typeof policy === 'function') {
            return policy(candidate, { kind, resource, paneId: targetPaneId });
          }
          if (typeof checker === 'function') {
            return checker(candidate.resource, resource);
          }
          return deepEqual(candidate.resource, resource);
        });

        if (existing) {
          if (pinned && existing.preview) {
            existing.pinned = true;
            existing.preview = false;
          }
          this.activateTab(existing.id);
          return { tab: existing, isNew: false };
        }
      }

      // 새 탭 생성: tab.id는 리소스 주소와 완전히 분리된 고유값 (FR-2)
      const newTabId = generateTabId();
      const tab = createTab({
        id: newTabId,
        kind,
        title,
        resource,
        paneId: targetPaneId,
        pinned,
        preview
      });

      this._tabs.set(tab.id, tab);
      this._activeTabIdByPane.set(targetPaneId, tab.id);
      this._activePaneId = targetPaneId;

      this._emit('tab-opened', { tab, isNew: true });
      return { tab, isNew: true };
    }

    activateTab(tabId) {
      const tab = this._tabs.get(tabId);
      if (!tab) return false;

      this._activePaneId = tab.paneId;
      this._activeTabIdByPane.set(tab.paneId, tab.id);
      this._emit('tab-activated', { tab });
      return true;
    }

    pinTab(tabId) {
      const tab = this._tabs.get(tabId);
      if (!tab) return false;

      tab.pinned = true;
      tab.preview = false;
      this._emit('tab-pinned', { tab });
      return true;
    }

    closeTab(tabId) {
      const tab = this._tabs.get(tabId);
      if (!tab) return null;

      const paneId = tab.paneId;
      const paneTabs = this.getTabsByPane(paneId);
      const tabIndex = paneTabs.findIndex((t) => t.id === tabId);

      this._tabs.delete(tabId);

      let nextActiveTab = null;
      if (this._activeTabIdByPane.get(paneId) === tabId) {
        const remaining = this.getTabsByPane(paneId);
        if (remaining.length > 0) {
          const nextIndex = Math.min(tabIndex, remaining.length - 1);
          nextActiveTab = remaining[nextIndex];
          this._activeTabIdByPane.set(paneId, nextActiveTab.id);
        } else {
          this._activeTabIdByPane.set(paneId, null);
        }
      } else {
        nextActiveTab = this.getActiveTab(paneId);
      }

      this._emit('tab-closed', { tab, nextActiveTab });
      return { closedTab: tab, nextActiveTab };
    }

    moveTabToPane(tabId, targetPaneId) {
      const tab = this._tabs.get(tabId);
      if (!tab || tab.paneId === targetPaneId) return false;

      if (!this._panes.includes(targetPaneId)) {
        this._panes.push(targetPaneId);
        this._activeTabIdByPane.set(targetPaneId, null);
      }

      const sourcePaneId = tab.paneId;
      // Close from source pane context
      const sourceTabs = this.getTabsByPane(sourcePaneId).filter((t) => t.id !== tabId);
      if (this._activeTabIdByPane.get(sourcePaneId) === tabId) {
        const newActive = sourceTabs.length > 0 ? sourceTabs[sourceTabs.length - 1] : null;
        this._activeTabIdByPane.set(sourcePaneId, newActive ? newActive.id : null);
      }

      // Move to target pane
      tab.paneId = targetPaneId;
      this._activeTabIdByPane.set(targetPaneId, tab.id);
      this._activePaneId = targetPaneId;

      this._emit('tab-moved', { tab, sourcePaneId, targetPaneId });
      return true;
    }

    saveViewState(tabId, state) {
      const tab = this._tabs.get(tabId);
      if (!tab) return false;
      tab.viewState = state;
      return true;
    }

    getViewState(tabId) {
      const tab = this._tabs.get(tabId);
      return tab ? tab.viewState : null;
    }
  }

  // 직렬화 지원 (FR-3)
  function serializeResources(tabs) {
    const list = Array.isArray(tabs) ? tabs : [];
    return JSON.stringify(
      list.map((tab) => ({
        id: tab.id,
        kind: tab.kind,
        title: tab.title,
        resource: tab.resource
      }))
    );
  }

  function deserializeResources(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Deserialized data must be an array');
    }
    return parsed.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      resource: item.resource
    }));
  }

  return {
    generateTabId,
    createTab,
    KindRegistry,
    TabManager,
    DUPLICATE_POLICY,
    serializeResources,
    deserializeResources
  };
});
