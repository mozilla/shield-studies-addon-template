/* eslint-disable */

ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm");
ChromeUtils.import("resource://gre/modules/ExtensionUtils.jsm");

// eslint-disable-next-line no-undef
const { EventManager } = ExtensionCommon;
// eslint-disable-next-line no-undef
const { EventEmitter } = ExtensionUtils;

this.testingOverrides = class extends ExtensionAPI {
  getAPI(context) {
    return {
      testingOverrides: {
        /* @TODO no description given */
        getVariationNameOverride: async function getVariationNameOverride() {
          console.log("called getVariationNameOverride ");
          return undefined;
        },

        /* @TODO no description given */
        getFirstRunTimestampOverride: async function getFirstRunTimestampOverride() {
          console.log("called getFirstRunTimestampOverride ");
          return undefined;
        },

        /* @TODO no description given */
        getExpiredOverride: async function getExpiredOverride() {
          console.log("called getExpiredOverride ");
          return undefined;
        },

        /* @TODO no description given */
        listPreferences: async function listPreferences() {
          console.log("called listPreferences ");
          return undefined;
        },
      },
    };
  }
};
