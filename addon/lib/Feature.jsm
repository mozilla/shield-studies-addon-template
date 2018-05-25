"use strict";

/**
 * Feature module for the Search Nudges Shield Study.s
 **/

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(EXPORTED_SYMBOLS|Feature)" }]*/

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/Console.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const EXPORTED_SYMBOLS = ["Feature"];

XPCOMUtils.defineLazyModuleGetter(
  this,
  "RecentWindow",
  "resource:///modules/RecentWindow.jsm",
);

/** Return most recent NON-PRIVATE browser window, so that we can
 * manipulate chrome elements on it.
 */
function getMostRecentBrowserWindow() {
  return RecentWindow.getMostRecentBrowserWindow({
    private: false,
    allowPopups: false,
  });
}

class Feature {
  /**
   * The feature this study implements.
   *
   *  - studyUtils:  the configured studyUtils singleton.
   *  - reasonName: string of bootstrap.js startup/shutdown reason
   *
   */
  constructor(studyUtils, reasonName, log) {
    this.studyUtils = studyUtils;
    this.reasonName = reasonName;
    this.log = log;

    // Example log statement
    this.log.debug("Feature constructor");
  }

  start() {
    this.log.debug("Feature start");

    // perform something only during INSTALL = a new study period begins
    if (this.reasonName === "ADDON_INSTALL") {
      this.introductionNotificationBar();
    }
  }

  /** Display instrumented 'notification bar' explaining the feature to the user.
   */
  introductionNotificationBar() {
    const feature = this;
    const recentWindow = getMostRecentBrowserWindow();
    const doc = recentWindow.document;
    const notificationBox = doc.querySelector(
      "#high-priority-global-notificationbox",
    );

    if (!notificationBox) return;

    // api: https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XUL/Method/appendNotification
    feature.telemetry({
      event: "introduction-shown",
    });
  }

  hasExpired() {
    return false;
  }

  /* good practice to have the literal 'sending' be wrapped up */
  telemetry(stringStringMap) {
    this.studyUtils.telemetry(stringStringMap);
  }

  /**
   * Called at end of study, and if the user disables the study or it gets uninstalled by other means.
   */
  shutdown() {}
}

// webpack:`libraryTarget: 'this'`
this.EXPORTED_SYMBOLS = EXPORTED_SYMBOLS;
this.Feature = Feature;
