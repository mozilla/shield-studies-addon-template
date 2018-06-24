"use strict";

/* global ExtensionAPI, Preferences */

ChromeUtils.import("resource://gre/modules/Console.jsm");
ChromeUtils.import("resource://gre/modules/XPCOMUtils.jsm");
ChromeUtils.import("resource://gre/modules/Preferences.jsm");

this.testingOverrides = class extends ExtensionAPI {
  getAPI(context) {
    const { extension } = this;

    // Copied here from tree
    function makeWidgetId(id) {
      id = id.toLowerCase();
      return id.replace(/[^a-z0-9_-]/g, "_");
    }

    const widgetId = makeWidgetId(extension.manifest.applications.gecko.id);

    function convertToNumberIfNotNull(value) {
      return value !== null
        ? Number(value)
        : null;
    }

    return {
      testingOverrides: {
        getVariationNameOverride: async function getVariationNameOverride() {
          return Preferences.get(`extensions.${widgetId}.test.variationName`, null);
        },
        getFirstRunTimestampOverride: async function getFirstRunTimestampOverride() {
          return convertToNumberIfNotNull(Preferences.get(`extensions.${widgetId}.test.firstRunTimestamp`, null));
        },
        getExpiredOverride: async function getExpiredOverride() {
          return Preferences.get(`extensions.${widgetId}.test.expired`, null);
        },
        listPreferences: async function listPreferences() {
          return [
            `extensions.${widgetId}.test.variationName`,
            `extensions.${widgetId}.test.firstRunTimestamp`,
            `extensions.${widgetId}.test.expired`,
          ];
        },
      },
    };
  }
};
