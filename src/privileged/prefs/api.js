/* global ExtensionAPI */

"use strict";

/* https://firefox-source-docs.mozilla.org/toolkit/components/extensions/webextensions/functions.html */
this.prefs = class extends ExtensionAPI {
  getAPI(context) {
    const { Services } = ChromeUtils.import(
      "resource://gre/modules/Services.jsm",
      {},
    );

    return {
      experiments: {
        prefs: Services.prefs,
      },
    };
  }
};
