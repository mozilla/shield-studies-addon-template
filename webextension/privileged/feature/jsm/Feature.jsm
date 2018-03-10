"use strict";

/**  Example Feature module for a Shield Study.
 *
 *  UI:
 *  - during INSTALL only, show a notification bar with 2 buttons:
 *    - "Thanks".  Accepts the study (optional)
 *    - "I don't want this".  Uninstalls the study.
 *
 *  Firefox code:
 *  - Implements the 'introduction' to the 'button choice' study, via notification bar.
 *
 *  Demonstrates `studyUtils` API:
 *
 *  - `telemetry` to instrument "shown", "accept", and "leave-study" events.
 *  - `endStudy` to send a custom study ending.
 *
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
  /** A Demonstration feature.
   *
   *  - variation: study info about particular client study variation
   *  - studyUtils:  the configured studyUtils singleton.
   *  - reasonName: string of bootstrap.js startup/shutdown reason
   *
   */
  constructor(variation, studyUtils, reasonName) {
    this.variation = variation; // unused.  Some other UI might use the specific variation info for things.
    this.studyUtils = studyUtils;
    this.reasonName = reasonName;
    this.log = console;

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

  /** Display instrumented 'notification bar' explaining the feature to the user
   *
   *   Telemetry Probes:
   *
   *   - {event: introduction-shown}
   *
   *   - {event: introduction-accept}
   *
   *   - {event: introduction-leave-study}
   *
   *    Note:  Bar WILL NOT SHOW if the only window open is a private window.
   *
   *    Note:  Handling of 'x' is not implemented.  For more complete implementation:
   *
   *      https://github.com/gregglind/57-perception-shield-study/blob/680124a/addon/lib/Feature.jsm#L148-L152
   *
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
    const notice = notificationBox.appendNotification(
      "Welcome to the new feature! Look for changes!",
      "feature orienation",
      null, // icon
      notificationBox.PRIORITY_INFO_HIGH, // priority
      // buttons
      [
        {
          label: "Thanks!",
          isDefault: true,
          callback: function acceptButton() {
            // eslint-disable-next-line no-console
            console.log("clicked THANKS!");
            feature.telemetry({
              event: "introduction-accept",
            });
          },
        },
        {
          label: "I do not want this.",
          callback: function leaveStudyButton() {
            // eslint-disable-next-line no-console
            console.log("clicked NO!");
            feature.telemetry({
              event: "introduction-leave-study",
            });
            feature.studyUtils.endStudy("introduction-leave-study");
          },
        },
      ],
      // callback for nb events
      null,
    );

    // used by testing to confirm the bar is set with the correct config
    notice.setAttribute("data-study-config", JSON.stringify(this.variation));
    feature.telemetry({
      event: "introduction-shown",
    });
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
