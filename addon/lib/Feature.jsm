"use strict";

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(EXPORTED_SYMBOLS|Feature)" }]*/

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const EXPORTED_SYMBOLS = this.EXPORTED_SYMBOLS = ["Feature"];

XPCOMUtils.defineLazyModuleGetter(this, "RecentWindow",
  "resource:///modules/RecentWindow.jsm");

// window utilities
function getMostRecentBrowserWindow() {
  return RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });
}

class Feature {
  constructor({variation, studyUtils, reasonName}) {
    this.variation = variation;
    this.studyUtils = studyUtils;

    // ONLY IF INSTALL
    if (reasonName === "ADDON_INSTALL") {
      this.firstRunOrientation();
    }
  }

  // this is a partial, example implementation
  firstRunOrientation() {
    const feature = this;
    const recentWindow = getMostRecentBrowserWindow();
    const doc = recentWindow.document;
    const notificationBox = doc.querySelector(
      "#high-priority-global-notificationbox"
    );
    // https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Method/appendNotification
    notificationBox.appendNotification(
      "Welcome to the new feature! Look for changes!",
      "feature orienation",
      null, // icon
      notificationBox.PRIORITY_INFO_HIGH, // priority
      // buttons
      [{
        label: "Thanks!",
        isDefault: true,
        callback() {
          feature.telemetry({
            event: "orientation-clicked",
          });
        },
      },
      {
        label: "I do not want this.",
        callback() {
          feature.telemetry({
            event: "orientation-leave-study",
          });
          feature.studyUtils.endStudy("");
        },
      }],

      null
    );
    feature.telemetry({
      event: "orientation-shown",
    });

  }
  /* good practice to have the literal 'sending' be wrapped up */
  telemetry(stringStringMap) {
    this.studyUtils.telemetry(stringStringMap);
  }
}

// to make this work with webpack!
this.Feature = Feature;


