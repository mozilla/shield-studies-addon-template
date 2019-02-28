/* global ExtensionAPI */

"use strict";

this.testingOverrides = class extends ExtensionAPI {
  getAPI(context) {
    const { Preferences } = ChromeUtils.import(
      "resource://gre/modules/Preferences.jsm",
      {},
    );

    const { extension } = this;

    // Copied here from tree
    function makeWidgetId(id) {
      id = id.toLowerCase();
      return id.replace(/[^a-z0-9_-]/g, "_");
    }

    const widgetId = makeWidgetId(extension.manifest.applications.gecko.id);

    return {
      testingOverrides: {
        getModelUrlEndpointOverride: async function getVariationNameOverride() {
          return Preferences.get(
            `extensions.${widgetId}.test.modelUrlEndpoint`,
            "",
          );
        },
      },
    };
  }
};
