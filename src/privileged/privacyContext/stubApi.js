/* eslint-env commonjs */
/* eslint no-logger: off */
/* eslint no-unused-vars: off */
/* global ExtensionAPI */

ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionUtils.jsm");

/* eslint-disable no-undef */
const { EventManager } = ExtensionCommon;
const EventEmitter =
  ExtensionCommon.EventEmitter || ExtensionUtils.EventEmitter;

this.privacyContext = class extends ExtensionAPI {
  getAPI(context) {
    const apiEventEmitter = new EventEmitter();
    return {
      privacyContext: {
        
      /* @TODO no description given */
      permanentPrivateBrowsing: async function permanentPrivateBrowsing  (  ) {
        console.log("Called permanentPrivateBrowsing()", );
        return undefined;
      },

      /* @TODO no description given */
      aPrivateBrowserWindowIsOpen: async function aPrivateBrowserWindowIsOpen  (  ) {
        console.log("Called aPrivateBrowserWindowIsOpen()", );
        return undefined;
      },

        
      },
    }
  }
}