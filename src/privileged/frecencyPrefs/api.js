/* global ExtensionAPI */

"use strict";

this.frecencyPrefs = class extends ExtensionAPI {
  getAPI(context) {
    const { Services } = ChromeUtils.import(
      "resource://gre/modules/Services.jsm",
      {},
    );
    const frecencyPrefNameBase = "places.frecency.";
    return {
      frecencyPrefs: {
        async clearUserPref(name) {
          return Services.prefs.clearUserPref(`${frecencyPrefNameBase}${name}`);
        },
        async getIntPref(name) {
          return Services.prefs.getIntPref(`${frecencyPrefNameBase}${name}`);
        },
        async setIntPref(name, value) {
          return Services.prefs.setIntPref(
            `${frecencyPrefNameBase}${name}`,
            value,
          );
        },
      },
    };
  }
};
