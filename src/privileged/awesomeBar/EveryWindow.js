/**
 * Based on https://github.com/mozilla/blurts-addon/blob/master/src/privileged/subscripts/EveryWindow.jsm
 * Ensure a function runs on every window, including future windows.
 * Ignoring private windows.
 */

/* globals Services */
/* eslint-disable-next-line no-var */
var {PrivateBrowsingUtils} = ChromeUtils.import("resource://gre/modules/PrivateBrowsingUtils.jsm", null);

this.EveryWindow = {
  _callbacks: new Map(),
  _initialized: false,

  registerCallback: function EW_registerCallback(id, init, uninit) {
    if (this._callbacks.has(id)) {
      return;
    }

    this._callForEveryWindow(init);
    this._callbacks.set(id, {id, init, uninit});

    if (!this._initialized) {
      Services.obs.addObserver(this._onOpenWindow.bind(this),
        "browser-delayed-startup-finished");
      this._initialized = true;
    }
  },

  unregisterCallback: function EW_unregisterCallback(aId, aCallUninit = true) {
    if (!this._callbacks.has(aId)) {
      return;
    }

    if (aCallUninit) {
      this._callForEveryWindow(this._callbacks.get(aId).uninit);
    }

    this._callbacks.delete(aId);
  },

  _callForEveryWindow(aFunction) {
    const windowList = Services.wm.getEnumerator("navigator:browser");
    while (windowList.hasMoreElements()) {
      const win = windowList.getNext();
      if (!PrivateBrowsingUtils.isWindowPrivate(win)) {
        win.delayedStartupPromise.then(() => { aFunction(win); });
      }
    }
  },

  _onOpenWindow(aWindow) {
    if (PrivateBrowsingUtils.isWindowPrivate(aWindow)) {
      return;
    }
    for (const c of this._callbacks.values()) {
      c.init(aWindow);
    }

    aWindow.addEventListener("unload",
      this._onWindowClosing.bind(this), { once: true });
  },

  _onWindowClosing(aEvent) {
    const win = aEvent.target;
    if (PrivateBrowsingUtils.isWindowPrivate(win)) {
      return;
    }
    for (const c of this._callbacks.values()) {
      c.uninit(win);
    }
  },
};
