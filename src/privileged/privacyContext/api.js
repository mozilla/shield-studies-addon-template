/* global ExtensionAPI */

"use strict";

this.privacyContext = class extends ExtensionAPI {
  getAPI(context) {

const { Services } = ChromeUtils.import(
  "resource://gre/modules/Services.jsm",
  {},
);

const { PrivateBrowsingUtils } = ChromeUtils.import(
  "resource://gre/modules/PrivateBrowsingUtils.jsm",
);

    return {
      privacyContext: {
        permanentPrivateBrowsing: async function permanentPrivateBrowsing() {
          return PrivateBrowsingUtils.permanentPrivateBrowsing;
        },
        aPrivateBrowserWindowIsOpen: async function aPrivateBrowserWindowIsOpen() {
          if (PrivateBrowsingUtils.permanentPrivateBrowsing) {
            return true;
          }
          const windowList = Services.wm.getEnumerator("navigator:browser");
          while (windowList.hasMoreElements()) {
            const nextWin = windowList.getNext();
            if (PrivateBrowsingUtils.isWindowPrivate(nextWin)) {
              return true;
            }
          }
          return false;
        },
      },
    };
  }
};
