"use strict";

/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/Console.jsm");
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
const { Services } = ChromeUtils.import("resource://gre/modules/Services.jsm");

/*
const {ExtensionCommon} = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
const {ExtensionUtils} = ChromeUtils.import("resource://gre/modules/ExtensionUtils.jsm");
const { EventManager } = ExtensionCommon;
const { EventEmitter } = ExtensionUtils;
*/

const { PrivateBrowsingUtils } = ChromeUtils.import(
  "resource://gre/modules/PrivateBrowsingUtils.jsm",
);

this.privacyContext = class extends ExtensionAPI {
  getAPI(context) {
    return {
      privacyContext: {
        permanentPrivateBrowsing: async function permanentPrivateBrowsing() {
          return PrivateBrowsingUtils.permanentPrivateBrowsing;
        },
        /*
        privateBrowsingAutostartEnabled: async function privateBrowsingAutostartEnabled() {
          const privateBrowsingAutostart = Preferences.get(
            "browser.privatebrowsing.autostart",
          );
          return privateBrowsingAutostart !== false;
        },
        */
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
